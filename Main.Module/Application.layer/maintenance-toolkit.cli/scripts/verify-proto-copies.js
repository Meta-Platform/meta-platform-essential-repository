#!/usr/bin/env node
/**
 * verify-proto-copies.js
 *
 * Verificação automática de igualdade das cópias do `.proto` do
 * [Package Executor RPC Standard].
 *
 * Contexto: o contrato gRPC de supervisão existe em 3 cópias byte-idênticas no
 * monorepo. A CANÔNICA é a do Open Standard — a norma manda que toda alteração
 * comece nela e só então seja propagada. Até aqui a propagação era manual, e a
 * própria norma admitia isso ("validado por `diff`"); este script é a automação
 * que faltava, no mesmo molde do `verify-ecosystem-defaults-copies.js`.
 *
 * Duas comparações, porque uma só não basta:
 *   1) bytes (sha256) — as cópias devem ser byte-idênticas;
 *   2) enums (nome -> número) — a comparação que importa de verdade. O número de
 *      um valor de enum é o que trafega no wire: dois arquivos com bytes
 *      diferentes e enums iguais ainda se entendem; enums diferentes quebram
 *      clientes em produção, e é isso que precisa gritar.
 *
 * Sai com código != 0 se QUALQUER cópia divergir da canônica. Só usa
 * `node:fs`/`node:crypto`/`node:path` — nenhuma dependência npm.
 *
 * Uso:
 *   node scripts/verify-proto-copies.js
 *
 * [Package Executor RPC Standard]:
 *   Meta-Platform/meta-platform-open-standard/specifications/package-executor-rpc-standard.md
 */

'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

// Raiz do monorepo: este arquivo vive em
//   <repo>/repos/essential-repository/Main.Module/Application.layer/maintenance-toolkit.cli/scripts/
// Subimos 6 níveis para chegar em <repo>.
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');

// A cópia CANÔNICA — a norma. Toda alteração começa aqui.
const CANONICAL = path.join(
  REPO_ROOT,
  'Meta-Platform/meta-platform-open-standard/proto/package_executor_rpc.proto'
);

// As cópias de implementação, que DEVEM ser idênticas à canônica.
const COPIES = [
  path.join(
    REPO_ROOT,
    'repos/essential-repository/Commons.Module/Libraries.layer/supervisor.lib/IDL/PackageExecutorRPCSpec.proto'
  ),
  path.join(
    REPO_ROOT,
    'Meta-Platform/meta-platform-package-executor-command-line/src/Helpers/CommunicationInterface/IDL/PackageExecutorRPCSpec.proto'
  ),
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extrai `enum NOME { VALOR = N; ... }` do texto do `.proto`, inclusive os
 * enums ANINHADOS dentro de mensagens — `ExecutionStatus` mora dentro de
 * `ExecutionStatusResponse` justamente porque o `STARTING` dos dois enums
 * colidiria no escopo do package.
 *
 * Basta uma varredura textual: o que se compara aqui é a igualdade entre
 * arquivos que deveriam ser o MESMO arquivo, não a validade do proto3 — essa
 * quem afirma é o compilador estrito (`protox`, no build do host de
 * referência).
 */
function extractEnums(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

  const enums = {};
  const enumPattern = /\benum\s+(\w+)\s*\{([^}]*)\}/g;

  let match;
  while ((match = enumPattern.exec(withoutComments)) !== null) {
    const [, name, body] = match;
    const values = {};
    const valuePattern = /(\w+)\s*=\s*(-?\d+)\s*;/g;
    let value;
    while ((value = valuePattern.exec(body)) !== null) {
      values[value[1]] = Number(value[2]);
    }
    enums[name] = values;
  }
  return enums;
}

function readReport(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, filePath };
  }
  const raw = fs.readFileSync(filePath);
  return {
    exists: true,
    filePath,
    bytesHash: sha256(raw),
    enums: extractEnums(raw.toString('utf8')),
  };
}

function describeEnumDivergence(canonicalEnums, copyEnums) {
  const problems = [];

  for (const [enumName, values] of Object.entries(canonicalEnums)) {
    if (!(enumName in copyEnums)) {
      problems.push(`enum \`${enumName}\` não existe na cópia`);
      continue;
    }
    for (const [valueName, number] of Object.entries(values)) {
      if (!(valueName in copyEnums[enumName])) {
        problems.push(`${enumName}.${valueName} (= ${number}) não existe na cópia`);
      } else if (copyEnums[enumName][valueName] !== number) {
        problems.push(
          `${enumName}.${valueName}: canônica = ${number}, cópia = ${copyEnums[enumName][valueName]}`
        );
      }
    }
  }

  for (const [enumName, values] of Object.entries(copyEnums)) {
    if (!(enumName in canonicalEnums)) {
      problems.push(`enum \`${enumName}\` só existe na cópia`);
      continue;
    }
    for (const valueName of Object.keys(values)) {
      if (!(valueName in canonicalEnums[enumName])) {
        problems.push(`${enumName}.${valueName} só existe na cópia`);
      }
    }
  }

  return problems;
}

function main() {
  console.log('== Verificação de cópias do package_executor_rpc.proto ==\n');

  const canonical = readReport(CANONICAL);
  console.log('CANÔNICA:');
  console.log('  ' + CANONICAL);
  if (!canonical.exists) {
    console.error('  ERRO: arquivo canônico não encontrado.');
    process.exit(2);
  }
  console.log('  bytes(sha256) = ' + canonical.bytesHash);
  for (const [enumName, values] of Object.entries(canonical.enums)) {
    const rendered = Object.entries(values)
      .map(([valueName, number]) => `${valueName}=${number}`)
      .join(' ');
    console.log(`  enum ${enumName}: ${rendered}`);
  }
  console.log('');

  let failures = 0;

  console.log('CÓPIAS (' + COPIES.length + '):');
  for (const copyPath of COPIES) {
    const copy = readReport(copyPath);
    console.log('  ' + copyPath);

    if (!copy.exists) {
      console.log('    [DIVERGE] arquivo não encontrado');
      failures++;
      continue;
    }

    const problems = describeEnumDivergence(canonical.enums, copy.enums);
    const sameBytes = copy.bytesHash === canonical.bytesHash;

    if (problems.length > 0) {
      console.log('    [DIVERGE] o contrato difere — isto quebra o wire:');
      for (const problem of problems) console.log('      - ' + problem);
      failures++;
    } else if (!sameBytes) {
      console.log('    [DIVERGE] mesmos enums, mas bytes diferem (comentário/formatação)');
      console.log('      copy bytes(sha256) = ' + copy.bytesHash);
      failures++;
    } else {
      console.log('    [OK] byte-idêntica à canônica');
    }
  }

  console.log('');
  if (failures === 0) {
    console.log('RESULTADO: OK — todas as ' + COPIES.length +
      ' cópias são byte-idênticas à canônica.');
    process.exit(0);
  }
  console.log('RESULTADO: FALHA — ' + failures + ' cópia(s) divergem da canônica.');
  console.log('A norma manda propagar A PARTIR da canônica; copie-a por cima das demais.');
  process.exit(1);
}

main();
