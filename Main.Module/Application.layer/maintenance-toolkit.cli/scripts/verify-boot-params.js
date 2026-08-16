#!/usr/bin/env node
/**
 * verify-boot-params.js
 *
 * Gate dos metadados de montagem. Para cada entrada de `boot.json` que aponta
 * uma dependência, compara o que o ALVO exige (`params` e `bound-params` do
 * metadado dele) com o que o CONSUMIDOR fornece. Falta um nome obrigatório? É
 * erro aqui, e não na primeira execução.
 *
 * O problema que isto resolve, com nome e data: em 2026-08-16 o
 * `mesh-normalizer.wasmlib` entrou como bound-param obrigatório do
 * `3d-viewer.webservice/endpoint-group`. O boot.json do `.webservice` passou a
 * fornecê-lo; o do `.desktopapp`, que monta o MESMO endpoint-group, não. O
 * `_3dservice` continuou subindo e o `_3dviewer-desktop` passou a morrer antes
 * de abrir a janela, com "O parâmetro [meshNormalizer] não foi encontrado!".
 * Ninguém tinha como saber, olhando o commit, que havia um segundo fornecedor.
 *
 * A lista do `endpoint-group.json` é WHITELIST — ela autoriza o nome. Quem
 * ENTREGA o valor é cada boot.json consumidor, e eles são independentes entre
 * si. Toda vez que um param obrigatório nasce, ele nasce faltando em N-1
 * lugares.
 *
 * O índice de packages é sempre GLOBAL (todos os repositórios do checkout),
 * porque o namespace `@/` também é: um boot.json do EngineeringToolsRepo
 * depende de metadado do EcosystemCoreRepo. `--repo` restringe apenas QUAIS
 * boot.json são verificados, nunca onde os alvos são procurados.
 *
 * BASELINE. O gate nasceu com 14 faltas já no repositório, duas delas quebrando
 * apps de verdade (o `eco-panel` e o `meta-project-manager` não subiam). Um gate
 * que nasce vermelho é um gate que se aprende a ignorar — foi assim que o lint
 * de UI passou semanas quebrado. Por isso o que já existia entra em
 * `verify-boot-params.baseline.json` como DÍVIDA DECLARADA: não barra o commit,
 * mas aparece no rodapé de toda execução, com contagem. Achado que não está no
 * baseline barra.
 *
 * O baseline é para encolher. Quando uma dívida é paga, o gate avisa que a
 * entrada sobrou — `--update-baseline` reescreve o arquivo.
 *
 * Uso:
 *   node scripts/verify-boot-params.js
 *   node scripts/verify-boot-params.js --repo ~/Workspaces/.../applications-repository
 *   node scripts/verify-boot-params.js --json
 *   node scripts/verify-boot-params.js --update-baseline
 *   node scripts/verify-boot-params.js --strict          # ignora o baseline
 *
 * Saída: 0 sem falha nova, 1 com falha nova, 2 se nem deu para começar.
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

// A árvore de um repositório é rasa: Module → layer → [group] → package.
const MAX_SCAN_DEPTH = 5;
const IGNORED_DIRS   = new Set(['node_modules', '.git', 'dist', 'build', 'test', 'tests']);

// Onde os repositórios ficam lado a lado dentro do checkout de distribuição.
const REPO_CONTAINERS = ['repos', 'thrid-party-repos'];

/*
 * As seções que o executor valida com `IsValidMetadata` — e SÓ elas. Quem
 * confere é `CreateServiceTaskParams` (services) e `CreateListEndpointTaskParams`
 * (endpoints); `executables` e `windows` seguem outro caminho, em que um nome
 * ausente não é recusa.
 *
 * Cobrar as outras seções com esta régua produz ruído, não achado: o
 * `package-runner.cli` "deve" sete bound-params ao próprio command-group e roda
 * o ecossistema inteiro assim mesmo. Um gate que acusa o que funciona é um gate
 * que as pessoas aprendem a ignorar.
 */
const VALIDATED_SECTIONS = new Set(['services', 'endpoints']);

const BASELINE_PATH = path.join(__dirname, 'verify-boot-params.baseline.json');

const _ParseArgs = (argv) => {
  const args = { repos: [] };
  for(let i = 0; i < argv.length; i++){
    if(argv[i] === '--repo') args.repos.push(path.resolve(argv[++i]));
    else if(argv[i] === '--json') args.json = true;
    else if(argv[i] === '--update-baseline') args.updateBaseline = true;
    else if(argv[i] === '--strict') args.strict = true;
  }
  return args;
};

/**
 * A identidade de um achado. Caminho RELATIVO à raiz do checkout: o baseline
 * viaja com o repositório e cada clone mora num lugar diferente.
 */
const _FindingKey = ({ distributionRoot, bootPath, finding }) =>
  [ path.relative(distributionRoot, bootPath), finding.section, finding.dependency, finding.paramKind, finding.name ].join(' | ');

const _LoadBaseline = () => {
  if(!fs.existsSync(BASELINE_PATH)) return new Set();
  try {
    const content = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    return new Set(content.conhecidos || []);
  } catch(error){
    console.error(`baseline ilegível (${BASELINE_PATH}): ${error.message}`);
    process.exit(2);
  }
};

/**
 * Sobe até a raiz do checkout de distribuição — o único lugar onde a topologia
 * existe inteira. Mesma busca que o hook de pre-commit faz.
 */
const _FindDistributionRoot = () => {
  let dir = path.resolve(__dirname);
  while(dir !== path.parse(dir).root){
    if(fs.existsSync(path.join(dir, 'repos', 'essential-repository'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
};

const _ListRepositories = (distributionRoot) =>
  REPO_CONTAINERS
    .map((container) => path.join(distributionRoot, container))
    .filter((container) => fs.existsSync(container))
    .flatMap((container) => fs.readdirSync(container, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => path.join(container, entry.name)));

const _ReadJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch(error){
    return { __parseError: error.message };
  }
};

/** Todo diretório que tem `metadata/package.json` é um package. */
const _FindPackages = (rootPath, depth = 0) => {

  if(depth > MAX_SCAN_DEPTH || !fs.existsSync(rootPath)) return [];

  const found = fs.existsSync(path.join(rootPath, 'metadata', 'package.json')) ? [rootPath] : [];

  return fs.readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
    .reduce(
      (accumulated, entry) => accumulated.concat(_FindPackages(path.join(rootPath, entry.name), depth + 1)),
      found
    );
};

/**
 * namespace → diretório. Um namespace repetido é registrado como colisão: o
 * `@/` é global, então dois packages com o mesmo nome em repositórios
 * diferentes tornam a resolução ambígua para o executor E para este gate.
 */
const _IndexPackagesByNamespace = (repositories) => {

  const index     = new Map();
  const collisions = new Map();

  repositories.flatMap((repository) => _FindPackages(repository)).forEach((packagePath) => {

    const metadata = _ReadJson(path.join(packagePath, 'metadata', 'package.json'));
    const namespace = metadata && metadata.namespace;
    if(!namespace) return;

    if(index.has(namespace)){
      const previous = collisions.get(namespace) || [index.get(namespace)];
      collisions.set(namespace, previous.concat(packagePath));
      return;
    }

    index.set(namespace, packagePath);
  });

  return { index, collisions };
};

/**
 * `dependency` é sempre `<prefixo>/<package>/<metadado>[/<namespace>]`, com o
 * package VAZIO quando aponta para o próprio (`@//endpoint-group`). É o mesmo
 * corte que `ExtractNamespaceFromDependency` e `ExtractMetadataFromMetadataByType`
 * fazem no executor — se um dia mudar lá, muda aqui.
 */
const _SplitDependency = (dependency) => {
  const [ prefix, token, metadataName, subNamespace ] = String(dependency).split('/');
  return { prefix, token, metadataName, subNamespace };
};

/** O metadado exigido pelo alvo, ou o motivo de não dar para olhar. */
const _ResolveTargetMetadata = ({ dependency, ownNamespace, packageIndex }) => {

  const { prefix, token, metadataName, subNamespace } = _SplitDependency(dependency);

  if(!metadataName) return { unresolved: 'a dependência não nomeia um metadado' };

  const targetNamespace = token === '' ? ownNamespace : `${prefix}/${token}`;
  const targetPath      = packageIndex.get(targetNamespace);

  if(!targetPath) return { unresolved: `package ${targetNamespace} não está neste checkout` };

  const metadataPath = path.join(targetPath, 'metadata', `${metadataName}.json`);
  if(!fs.existsSync(metadataPath)) return { unresolved: `${targetNamespace} não tem metadata/${metadataName}.json` };

  const content = _ReadJson(metadataPath);
  if(content.__parseError) return { unresolved: `metadata/${metadataName}.json não é JSON válido: ${content.__parseError}` };

  // `services.json` é uma LISTA de services; os demais metadados são o próprio
  // objeto. Quem pede um service nomeia qual, no fim da dependência.
  if(Array.isArray(content)){
    const entry = content.find((item) => item && item.namespace === subNamespace);
    if(!entry) return { unresolved: `${targetNamespace}/${metadataName} não declara "${subNamespace}"` };
    return { metadata: entry, targetNamespace, metadataPath };
  }

  return { metadata: content, targetNamespace, metadataPath };
};

const _IsOptional = (name) => String(name).charAt(0) === '?';

/**
 * O executor recusa com `!!params[nome]` — ausente e vazio falham igual. Aqui
 * vale o mesmo, senão o gate passaria um `""` que quebra na execução.
 */
const _MissingNames = (required, provided) =>
  (required || [])
    .filter((name) => !_IsOptional(name))
    .filter((name) => {
      const value = provided && provided[name];
      return value === undefined || value === null || value === '';
    });

const _CheckEntry = ({ entry, ownNamespace, packageIndex, section }) => {

  const resolved = _ResolveTargetMetadata({ dependency: entry.dependency, ownNamespace, packageIndex });

  if(resolved.unresolved){
    return [{ kind: 'uncheckable', section, dependency: entry.dependency, reason: resolved.unresolved }];
  }

  const missingParams = _MissingNames(resolved.metadata.params, entry.params);
  const missingBound  = _MissingNames(resolved.metadata['bound-params'], entry['bound-params']);

  return []
    .concat(missingParams.map((name) => ({ kind: 'missing', section, dependency: entry.dependency, paramKind: 'param', name })))
    .concat(missingBound.map((name)  => ({ kind: 'missing', section, dependency: entry.dependency, paramKind: 'bound-param', name })));
};

const _CheckBootFile = ({ bootPath, packagePath, packageIndex }) => {

  const boot = _ReadJson(bootPath);
  if(boot.__parseError) return { bootPath, findings: [{ kind: 'invalid', reason: boot.__parseError }] };

  const ownMetadata  = _ReadJson(path.join(packagePath, 'metadata', 'package.json'));
  const ownNamespace = ownMetadata && ownMetadata.namespace;

  const findings = Object.keys(boot)
    .filter((section) => Array.isArray(boot[section]) && VALIDATED_SECTIONS.has(section))
    .flatMap((section) => boot[section]
      .filter((entry) => entry && entry.dependency)
      .flatMap((entry) => _CheckEntry({ entry, ownNamespace, packageIndex, section })));

  return { bootPath, packagePath, findings };
};

const _Report = ({ results, collisions, verifiedRepos, baselineHits, baselineStale }) => {

  const withMissing = results.filter((result) => result.findings.some((finding) => finding.kind === 'missing' || finding.kind === 'invalid'));
  const uncheckable = results.flatMap((result) => result.findings.filter((finding) => finding.kind === 'uncheckable'));

  console.log('');
  console.log('Gate de params de boot.json');
  console.log(`  escopo: ${verifiedRepos.map((repository) => path.basename(repository)).join(', ')}`);
  console.log('');

  withMissing.forEach((result) => {
    console.log(`  ${result.bootPath}`);
    result.findings
      .filter((finding) => finding.kind !== 'uncheckable')
      .forEach((finding) => {
        if(finding.kind === 'invalid'){
          console.log(`      boot.json ilegível: ${finding.reason}`);
          return;
        }
        console.log(`      [${finding.section}] ${finding.dependency}`);
        console.log(`          ${finding.paramKind} obrigatório não fornecido: ${finding.name}`);
      });
    console.log('');
  });

  if(collisions.size > 0){
    console.log('  Namespaces em colisão (a resolução fica ambígua para o executor também):');
    collisions.forEach((paths, namespace) => {
      console.log(`      ${namespace}`);
      paths.forEach((collisionPath) => console.log(`          ${collisionPath}`));
    });
    console.log('');
  }

  if(uncheckable.length > 0){
    console.log(`  ${uncheckable.length} dependência(s) não verificável(is) — alvo fora deste checkout:`);
    [...new Set(uncheckable.map((finding) => `${finding.dependency} (${finding.reason})`))]
      .forEach((line) => console.log(`      ${line}`));
    console.log('');
  }

  const totalMissing = results.flatMap((result) => result.findings).filter((finding) => finding.kind === 'missing').length;

  console.log(`  ${results.length} boot.json verificado(s), ${withMissing.length} com problema NOVO`
    + (totalMissing > 0 ? ` (${totalMissing} param(s) faltando)` : ''));

  if(baselineHits > 0){
    console.log(`  ${baselineHits} falta(s) conhecida(s) no baseline — dívida declarada, não barra o commit.`);
    console.log(`      ${path.relative(process.cwd(), BASELINE_PATH)}`);
  }

  if(baselineStale.length > 0){
    console.log('');
    console.log(`  ${baselineStale.length} entrada(s) do baseline não corresponde(m) mais a nada — dívida paga.`);
    console.log('      Rode com --update-baseline para encolher o arquivo.');
    baselineStale.forEach((entry) => console.log(`      ${entry}`));
  }

  return withMissing.length;
};

const Main = () => {

  const args = _ParseArgs(process.argv.slice(2));

  const distributionRoot = _FindDistributionRoot();
  if(!distributionRoot){
    console.error('Não achei a raiz do checkout de distribuição (o diretório que contém repos/essential-repository).');
    process.exit(2);
  }

  const allRepositories = _ListRepositories(distributionRoot);
  if(allRepositories.length === 0){
    console.error(`Nenhum repositório encontrado sob ${distributionRoot}.`);
    process.exit(2);
  }

  // Índice global, escopo local: o alvo pode estar em qualquer repositório.
  const { index: packageIndex, collisions } = _IndexPackagesByNamespace(allRepositories);

  const verifiedRepos = args.repos.length > 0 ? args.repos : allRepositories;

  const rawResults = verifiedRepos
    .flatMap((repository) => _FindPackages(repository))
    .map((packagePath) => ({ packagePath, bootPath: path.join(packagePath, 'metadata', 'boot.json') }))
    .filter(({ bootPath }) => fs.existsSync(bootPath))
    .map(({ packagePath, bootPath }) => _CheckBootFile({ bootPath, packagePath, packageIndex }));

  const todasAsChaves = rawResults.flatMap((result) => result.findings
    .filter((finding) => finding.kind === 'missing')
    .map((finding) => _FindingKey({ distributionRoot, bootPath: result.bootPath, finding })));

  if(args.updateBaseline){
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify({
      _leia: 'Faltas de param que já existiam quando o gate nasceu. Para ENCOLHER, não crescer: conserte uma e rode --update-baseline.',
      conhecidos: todasAsChaves.sort()
    }, null, 2)}\n`);
    console.log(`baseline reescrito com ${todasAsChaves.length} entrada(s): ${BASELINE_PATH}`);
    process.exit(0);
  }

  const baseline = args.strict ? new Set() : _LoadBaseline();

  // Fora do baseline é falha; dentro é dívida declarada.
  let baselineHits = 0;
  const results = rawResults.map((result) => ({
    ...result,
    findings: result.findings.filter((finding) => {
      if(finding.kind !== 'missing') return true;
      if(!baseline.has(_FindingKey({ distributionRoot, bootPath: result.bootPath, finding }))) return true;
      baselineHits += 1;
      return false;
    })
  }));

  const encontradas  = new Set(todasAsChaves);
  const baselineStale = [...baseline].filter((entry) => !encontradas.has(entry));

  if(args.json){
    console.log(JSON.stringify({ results, collisions: [...collisions], baselineHits, baselineStale }, null, 2));
    process.exit(results.some((result) => result.findings.some((finding) => finding.kind === 'missing' || finding.kind === 'invalid')) ? 1 : 0);
  }

  process.exit(_Report({ results, collisions, verifiedRepos, baselineHits, baselineStale }) > 0 ? 1 : 0);
};

Main();
