#!/usr/bin/env node
/**
 * verify-typescript.js
 *
 * Gate do Source Language Standard. Percorre os packages que têm `tsconfig.json`
 * e recusa três coisas:
 *
 *   1. erro de tipo (`tsc --noEmit`);
 *   2. sintaxe não apagável — enum, namespace, decorator — que o `tsc` acusa
 *      pela opção `erasableSyntaxOnly` do tsconfig base;
 *   3. par `Foo.js` + `Foo.ts` no mesmo diretório.
 *
 * O par é o mais traiçoeiro dos três: os dois arquivos existem, nada falha, e o
 * `.js` vence a resolução — o TypeScript que alguém acabou de escrever nunca
 * executa. Só uma verificação como esta encontra.
 *
 * O `typescript` e o `@types/node` vivem AQUI, e não em cada package: verificar
 * tipo é tarefa de manutenção, e não dependência de execução de ninguém.
 *
 * Uso:
 *   node scripts/verify-typescript.js
 *   node scripts/verify-typescript.js --repo ~/Workspaces/.../ecosystem-core-repository
 *   node scripts/verify-typescript.js --json
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TOOLKIT_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT    = path.resolve(__dirname, '..', '..', '..', '..');

const TSC_BIN    = path.join(TOOLKIT_ROOT, 'node_modules', '.bin', 'tsc');
const TYPE_ROOTS = path.join(TOOLKIT_ROOT, 'node_modules', '@types');

// A árvore de um repositório é rasa: Module → layer → [group] → package.
const MAX_SCAN_DEPTH = 4;
const IGNORED_DIRS   = new Set(['node_modules', '.git', 'dist', 'build']);

const _ParseArgs = (argv) => {
  const args = { repos: [] };
  for(let i = 0; i < argv.length; i++){
    if(argv[i] === '--repo') args.repos.push(path.resolve(argv[++i]));
    else if(argv[i] === '--json') args.json = true;
  }
  if(args.repos.length === 0) args.repos.push(REPO_ROOT);
  return args;
};

/** Diretórios com `tsconfig.json` — cada um é uma unidade de verificação. */
const _FindTypedPackages = (rootPath, depth = 0) => {

  if(depth > MAX_SCAN_DEPTH) return [];

  const entries = fs.existsSync(rootPath)
    ? fs.readdirSync(rootPath, { withFileTypes: true })
    : [];

  const found = fs.existsSync(path.join(rootPath, 'tsconfig.json')) ? [rootPath] : [];

  return entries
    .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
    .reduce(
      (accumulated, entry) => accumulated.concat(_FindTypedPackages(path.join(rootPath, entry.name), depth + 1)),
      found
    );
};

/** Arquivos `.ts` que têm um `.js` de mesmo nome ao lado. */
const _FindDialectCollisions = (packagePath) => {

  const _Walk = (dirPath) => {

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const collisions = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts'))
      .filter((entry) => fs.existsSync(path.join(dirPath, `${entry.name.slice(0, -3)}.js`)))
      .map((entry) => path.relative(packagePath, path.join(dirPath, entry.name.slice(0, -3))));

    return entries
      .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
      .reduce((accumulated, entry) => accumulated.concat(_Walk(path.join(dirPath, entry.name))), collisions);
  };

  const sourcePath = path.join(packagePath, 'src');

  return fs.existsSync(sourcePath) ? _Walk(sourcePath) : [];
};

/**
 * Os packages do RUNTIME não instalam `@types` — eles executam por apagamento
 * de tipos, e verificar tipo é tarefa de manutenção — então emprestam os do
 * toolkit. Já um `.webgui` ou `.uilib` traz os seus próprios (react, d3, …), e
 * apontar o typeRoots para o toolkit os apagaria do mapa: o `tsc` acusaria
 * "Cannot find type definition file for 'react'" em código perfeitamente são.
 */
const _TypeRootsArgumentsFor = (packagePath) =>
  fs.existsSync(path.join(packagePath, 'node_modules', '@types'))
    ? []
    : ['--typeRoots', TYPE_ROOTS];

const _RunTypeCheck = (packagePath) => {

  const result = spawnSync(
    TSC_BIN,
    ['--noEmit', '-p', path.join(packagePath, 'tsconfig.json'), ..._TypeRootsArgumentsFor(packagePath)],
    { encoding: 'utf8' }
  );

  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

  return { ok: result.status === 0, output };
};

const _VerifyPackage = (packagePath) => {

  const collisions = _FindDialectCollisions(packagePath);
  const typeCheck  = _RunTypeCheck(packagePath);

  return {
    package: packagePath,
    ok     : typeCheck.ok && collisions.length === 0,
    collisions,
    output : typeCheck.output
  };
};

const _Report = (results) => {

  results.forEach((result) => {
    const name = path.basename(result.package);

    if(result.ok){
      console.log(`  ok    ${name}`);
      return;
    }

    console.log(`  FALHA ${name}`);

    result.collisions.forEach((module) =>
      console.log(`        colisão de dialeto: ${module}.js e ${module}.ts — o .js vence e o .ts nunca executa`));

    if(result.output) console.log(result.output.split('\n').map((line) => `        ${line}`).join('\n'));
  });

  const failed = results.filter((result) => !result.ok);

  console.log('');
  console.log(`  ${results.length} package(s) verificado(s), ${failed.length} com falha`);

  return failed.length;
};

const Main = () => {

  const args = _ParseArgs(process.argv.slice(2));

  if(!fs.existsSync(TSC_BIN)){
    console.error(`tsc não encontrado em ${TSC_BIN} — rode "npm install" em ${TOOLKIT_ROOT}`);
    process.exit(2);
  }

  const results = args.repos
    .flatMap((repoPath) => _FindTypedPackages(repoPath))
    .map(_VerifyPackage);

  if(args.json){
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.some((result) => !result.ok) ? 1 : 0);
  }

  process.exit(_Report(results) > 0 ? 1 : 0);
};

Main();
