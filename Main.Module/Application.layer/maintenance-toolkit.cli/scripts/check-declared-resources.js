#!/usr/bin/env node
/**
 * check-declared-resources.js
 *
 * Quem está segurando o quê. Cruza os recursos DECLARADOS pelos packages
 * (`storage-params.json`, `socket-params.json` e a porta do
 * `startup-params.json`) com o que os processos vivos têm aberto agora, e diz o
 * nome de quem segura — PID e package, não só "recurso em uso".
 *
 * O problema que isto resolve, com nome e data: em 2026-08-16 uma instância do
 * `3d-viewer.webservice` levantada três horas antes segurava a porta 8085 e o
 * lock do `_3d_index.duckdb`. O `_3dviewer-desktop` subiu assim mesmo e
 * DEGRADOU EM SILÊNCIO — a reindexação do parts-index falhou com uma linha de
 * log no meio de milhares, e a janela abriu como se estivesse tudo bem. O erro
 * do DuckDB trazia o PID; ninguém tinha por que estar lendo aquela linha.
 *
 * Isto é DIAGNÓSTICO, não gate — e a distinção é deliberada. A checagem
 * puramente estática ("dois packages declaram a mesma porta") acusa o que
 * funciona: `desktopapp`, `webapp`, `webservice` e `cli` do mesmo app declaram
 * de propósito o mesmo storage, porque são variantes que nunca rodam juntas. Um
 * verificador que aponta o correto é um verificador que as pessoas desligam.
 * O que não dá para saber lendo metadado é o que está VIVO agora.
 *
 * Uso:
 *   node scripts/check-declared-resources.js                        # quem segura o quê
 *   node scripts/check-declared-resources.js --package 3d-viewer.desktopapp
 *   node scripts/check-declared-resources.js --collisions           # mapa de recursos compartilhados
 *   node scripts/check-declared-resources.js --json
 *
 * Lê apenas `/proc` — sem `ss`, sem `fuser`, sem root. Só enxerga processos do
 * próprio usuário, que é exatamente o caso de uso: instância esquecida da
 * sessão anterior.
 *
 * Saída: 1 quando `--package` foi pedido e algum recurso DELE já está ocupado
 * (a pergunta "posso subir isto agora?" tem resposta binária); 0 nos demais
 * relatórios; 2 se nem deu para começar.
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');
const os   = require('node:os');

const MAX_SCAN_DEPTH = 5;
const IGNORED_DIRS   = new Set(['node_modules', '.git', 'dist', 'build', 'test', 'tests']);
const REPO_CONTAINERS = ['repos', 'thrid-party-repos'];

const DEFAULT_ECOSYSTEM_DATA = path.join(os.homedir(), 'EcosystemData');

const _ParseArgs = (argv) => {
  const args = { collisions: false, json: false, packages: [] };
  for(let i = 0; i < argv.length; i++){
    if(argv[i] === '--collisions') args.collisions = true;
    else if(argv[i] === '--json') args.json = true;
    else if(argv[i] === '--package') args.packages.push(argv[++i]);
    else if(argv[i] === '--ecosystem-data') args.ecosystemData = path.resolve(argv[++i]);
  }
  if(!args.ecosystemData) args.ecosystemData = DEFAULT_ECOSYSTEM_DATA;
  return args;
};

const _ReadJson = (filePath) => {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch(error){ return null; }
};

const _FindDistributionRoot = () => {
  let dir = path.resolve(__dirname);
  while(dir !== path.parse(dir).root){
    if(fs.existsSync(path.join(dir, 'repos', 'essential-repository'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
};

const _FindPackages = (rootPath, depth = 0) => {
  if(depth > MAX_SCAN_DEPTH || !fs.existsSync(rootPath)) return [];
  const found = fs.existsSync(path.join(rootPath, 'metadata', 'package.json')) ? [rootPath] : [];
  return fs.readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
    .reduce((accumulated, entry) => accumulated.concat(_FindPackages(path.join(rootPath, entry.name), depth + 1)), found);
};

/*
 * O storage declarado tem duas formas: string (o package é o dono) ou objeto
 * com `namespace`/`filename`/`owner` (aponta o storage de outro package). As
 * duas resolvem para o MESMO caminho quando apontam o mesmo arquivo — é assim
 * que dois packages compartilham um banco de propósito.
 */
const _ResolveStorageEntries = ({ storageParams, ownName, ecosystemData }) => {

  const declared = Object.keys(storageParams || {}).map((key) => {

    const value = storageParams[key];

    const namespace = typeof value === 'string' ? ownName : value.namespace;
    const filename  = typeof value === 'string' ? value   : value.filename;
    const owner     = typeof value === 'string' ? true    : value.owner !== false;

    return {
      key,
      owner,
      namespace,
      resourcePath: path.join(ecosystemData, 'storage', namespace, filename)
    };
  });

  /*
   * A ÁREA do namespace, e não só os arquivos declarados. O que travou o viewer
   * em 2026-08-16 foi o lock do `_3d_index.duckdb` — um arquivo que o app cria
   * ao lado dos declarados e que não aparece em metadado nenhum. Vigiar só o
   * que está declarado é vigiar a parte que raramente é o problema: um índice,
   * um `-wal`, um `-journal` nascem em tempo de execução e travam igual.
   */
  const areas = [...new Set(declared.map((entry) => entry.namespace))].map((namespace) => ({
    key: `área de storage (${namespace})`,
    owner: false,
    namespace,
    area: true,
    resourcePath: path.join(ecosystemData, 'storage', namespace)
  }));

  return declared.concat(areas);
};

/*
 * O socket declarado tem as mesmas duas formas do storage, e mais um `scope`:
 *
 *   "nome.sock"                                → sockets/nome.sock (é o dono)
 *   { namespace: "outro.app", owner: false }   → sockets/outro.app.sock
 *   { filename: "x.sock", scope: "supervisor" } → supervisor-sockets/x.sock
 *
 * Entrada que não dá nome a arquivo nenhum é ignorada em silêncio: aqui vale
 * mais deixar de checar um recurso do que derrubar a ferramenta inteira.
 */
const _ResolveSocketEntries = ({ socketParams, ecosystemData }) =>
  Object.keys(socketParams || {}).map((key) => {

    const value = socketParams[key];

    const filename = typeof value === 'string'
      ? value
      : value && (value.filename || (value.namespace ? `${value.namespace}.sock` : null));

    if(!filename) return null;

    const directory = value && value.scope === 'supervisor' ? 'supervisor-sockets' : 'sockets';

    return { key, resourcePath: path.join(ecosystemData, directory, filename) };
  })
  .filter(Boolean);

const _CollectDeclarations = ({ repositories, ecosystemData }) =>
  repositories
    .flatMap((repository) => _FindPackages(repository))
    .map((packagePath) => {

      const metadataDir = path.join(packagePath, 'metadata');
      const ownName     = path.basename(packagePath);

      const startup = _ReadJson(path.join(metadataDir, 'startup-params.json')) || {};
      const storage = _ReadJson(path.join(metadataDir, 'storage-params.json'));
      const sockets = _ReadJson(path.join(metadataDir, 'socket-params.json'));

      const port = startup.port !== undefined ? String(startup.port) : null;

      return {
        name: ownName,
        packagePath,
        port,
        storage: _ResolveStorageEntries({ storageParams: storage, ownName, ecosystemData }),
        sockets: _ResolveSocketEntries({ socketParams: sockets, ecosystemData })
      };
    })
    .filter((declaration) => declaration.port || declaration.storage.length > 0 || declaration.sockets.length > 0);

/** Dois DONOS do mesmo recurso. Compartilhar declarado não é conflito. */
const _FindOwnershipCollisions = (declarations) => {

  const owners = new Map();

  declarations.forEach((declaration) => {

    if(declaration.port){
      const key = `porta ${declaration.port}`;
      owners.set(key, (owners.get(key) || []).concat(declaration.name));
    }

    declaration.storage
      .filter((entry) => entry.owner)
      .forEach((entry) => {
        const key = `storage ${entry.resourcePath}`;
        owners.set(key, (owners.get(key) || []).concat(declaration.name));
      });
  });

  return [...owners.entries()]
    .filter(([ , packages ]) => packages.length > 1)
    .map(([ resource, packages ]) => ({ resource, packages }));
};

/* ------------------------------------------------------------------ */
/* Estado vivo, direto do /proc                                        */
/* ------------------------------------------------------------------ */

const _ListProcesses = () =>
  fs.readdirSync('/proc')
    .filter((entry) => /^\d+$/.test(entry))
    .map((pid) => {
      try {
        const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
        return { pid, cmdline };
      } catch(error){
        return null;
      }
    })
    .filter(Boolean);

/** O executor recebe o package em `--package <caminho>`; é o melhor nome que há. */
const _DescribeProcess = ({ pid, cmdline }) => {
  const packageIndex = cmdline.indexOf('--package');
  const packageName  = packageIndex >= 0 && cmdline[packageIndex + 1]
    ? path.basename(cmdline[packageIndex + 1])
    : path.basename(cmdline[0] || 'desconhecido');
  return `${packageName} (PID ${pid})`;
};

/** Descritores abertos de um processo, já resolvidos para caminho real. */
const _OpenPaths = (pid) => {
  try {
    return fs.readdirSync(`/proc/${pid}/fd`)
      .map((fd) => { try { return fs.readlinkSync(`/proc/${pid}/fd/${fd}`); } catch(error){ return null; } })
      .filter(Boolean);
  } catch(error){
    return [];
  }
};

/** Inodes de socket abertos por processo — a ponte entre /proc/net e o PID. */
const _SocketInodesByProcess = (processes) =>
  processes.map((process) => ({
    process,
    inodes: new Set(_OpenPaths(process.pid)
      .map((openPath) => (openPath.match(/^socket:\[(\d+)\]$/) || [])[1])
      .filter(Boolean))
  }));

/** Portas TCP em LISTEN, com o inode que permite achar o dono. */
const _ListeningPorts = () => {

  const LISTEN = '0A';

  return ['/proc/net/tcp', '/proc/net/tcp6']
    .filter((netFile) => fs.existsSync(netFile))
    .flatMap((netFile) => fs.readFileSync(netFile, 'utf8').split('\n').slice(1))
    .map((line) => line.trim().split(/\s+/))
    .filter((columns) => columns.length > 9 && columns[3] === LISTEN)
    .map((columns) => ({
      port: String(parseInt(columns[1].split(':')[1], 16)),
      inode: columns[9]
    }));
};

const _FindLiveHolders = ({ declarations, focus }) => {

  const processes    = _ListProcesses();
  const socketInodes = _SocketInodesByProcess(processes);
  const listening    = _ListeningPorts();

  // Um caminho aberto por alguém → quem. Uma passada só sobre /proc.
  const holdersByPath = new Map();
  processes.forEach((process) => {
    _OpenPaths(process.pid)
      .filter((openPath) => openPath.startsWith('/'))
      .forEach((openPath) => {
        holdersByPath.set(openPath, (holdersByPath.get(openPath) || []).concat(process));
      });
  });

  const _HoldersOfPath = (resourcePath) => {
    // Um diretório de storage é segurado pelos arquivos DENTRO dele: o
    // `_3d_index.duckdb` que travou não é declarado em lugar nenhum.
    const direct = holdersByPath.get(resourcePath) || [];
    const inside = [...holdersByPath.entries()]
      .filter(([ openPath ]) => openPath.startsWith(`${resourcePath}${path.sep}`))
      .flatMap(([ openPath, holders ]) => holders.map((holder) => ({ holder, openPath })));
    return { direct, inside };
  };

  return declarations
    .filter((declaration) => focus.length === 0 || focus.includes(declaration.name))
    .map((declaration) => {

      const portHolders = declaration.port
        ? listening
          .filter((entry) => entry.port === declaration.port)
          .flatMap((entry) => socketInodes
            .filter((candidate) => candidate.inodes.has(entry.inode))
            .map((candidate) => candidate.process))
        : [];

      // O que já é recurso declarado não se repete na linha da área.
      const declaredPaths = new Set(declaration.storage.filter((entry) => !entry.area).map((entry) => entry.resourcePath));

      const storageHolders = declaration.storage.map((entry) => {
        const holders = _HoldersOfPath(entry.resourcePath);
        return {
          ...entry,
          ...holders,
          inside: entry.area
            ? holders.inside.filter(({ openPath }) => !declaredPaths.has(openPath))
            : holders.inside
        };
      });

      const socketHolders = declaration.sockets.map((entry) => ({
        ...entry,
        ...(_HoldersOfPath(entry.resourcePath))
      }));

      return { declaration, portHolders, storageHolders, socketHolders };
    });
};

const _ReportStatic = (collisions) => {

  console.log('');
  console.log('Recursos que mais de um package declara como próprio');
  console.log('');

  if(collisions.length === 0){
    console.log('  nenhum.');
    console.log('');
    return;
  }

  collisions.forEach(({ resource, packages }) => {
    console.log(`  ${resource}`);
    console.log(`      ${packages.join(', ')}`);
  });

  console.log('');
  console.log('  Isto é um MAPA, não uma lista de defeitos. Variantes do mesmo app');
  console.log('  (desktopapp/webapp/webservice/cli) declaram o mesmo recurso de');
  console.log('  propósito — só uma roda por vez. O que a lista responde é: "se estes');
  console.log('  dois subirem juntos, disputam o quê?".');
  console.log('');
};

const _ReportLive = (liveResults) => {

  console.log('Recursos declarados — quem está segurando agora');
  console.log('');

  let ocupados = 0;

  liveResults.forEach(({ declaration, portHolders, storageHolders, socketHolders }) => {

    const linhas = [];

    portHolders.forEach((holder) => linhas.push(`      porta ${declaration.port}: ${_DescribeProcess(holder)}`));

    storageHolders.forEach((entry) => {
      entry.direct.forEach((holder) => linhas.push(`      ${entry.key}: ${_DescribeProcess(holder)}`));
      entry.inside.forEach(({ holder, openPath }) =>
        linhas.push(`      ${entry.key} → ${path.basename(openPath)}: ${_DescribeProcess(holder)}`));
    });

    socketHolders.forEach((entry) => {
      entry.direct.forEach((holder) => linhas.push(`      ${entry.key}: ${_DescribeProcess(holder)}`));
    });

    if(linhas.length === 0) return;

    ocupados += 1;
    console.log(`  ${declaration.name}`);
    [...new Set(linhas)].forEach((linha) => console.log(linha));
    console.log('');
  });

  if(ocupados === 0) console.log('  nenhum recurso declarado está em uso neste momento.');

  console.log('');
  return ocupados;
};

const Main = () => {

  const args = _ParseArgs(process.argv.slice(2));

  const distributionRoot = _FindDistributionRoot();
  if(!distributionRoot){
    console.error('Não achei a raiz do checkout de distribuição (o diretório que contém repos/essential-repository).');
    process.exit(2);
  }

  const repositories = REPO_CONTAINERS
    .map((container) => path.join(distributionRoot, container))
    .filter((container) => fs.existsSync(container))
    .flatMap((container) => fs.readdirSync(container, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(container, entry.name)));

  const declarations = _CollectDeclarations({ repositories, ecosystemData: args.ecosystemData });
  const collisions   = _FindOwnershipCollisions(declarations);

  if(args.packages.length > 0){
    const desconhecidos = args.packages.filter((name) => !declarations.some((declaration) => declaration.name === name));
    if(desconhecidos.length > 0){
      console.error(`Package sem recurso declarado (ou inexistente): ${desconhecidos.join(', ')}`);
      process.exit(2);
    }
  }

  const liveResults = _FindLiveHolders({ declarations, focus: args.packages });

  const _Occupied = ({ portHolders, storageHolders, socketHolders }) =>
    portHolders.length > 0
    || storageHolders.some((entry) => entry.direct.length > 0 || entry.inside.length > 0)
    || socketHolders.some((entry) => entry.direct.length > 0);

  // Só com `--package` a saída vira resposta binária: perguntei se posso subir
  // AQUELE package. No relatório geral, recurso ocupado é o estado normal de um
  // ecossistema em uso — sair com 1 ali seria ruído.
  const exitCode = args.packages.length > 0 && liveResults.some(_Occupied) ? 1 : 0;

  if(args.json){
    console.log(JSON.stringify({
      collisions,
      live: liveResults.map(({ declaration, portHolders, storageHolders, socketHolders }) => ({
        package: declaration.name,
        port: declaration.port,
        portHolders: portHolders.map(_DescribeProcess),
        storageHolders: storageHolders.flatMap((entry) =>
          entry.direct.concat(entry.inside.map((item) => item.holder)).map(_DescribeProcess)),
        socketHolders: socketHolders.flatMap((entry) => entry.direct.map(_DescribeProcess))
      }))
    }, null, 2));
    process.exit(exitCode);
  }

  if(args.collisions) _ReportStatic(collisions);
  else _ReportLive(liveResults);

  process.exit(exitCode);
};

Main();
