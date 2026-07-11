#!/usr/bin/env node
/**
 * verify-ecosystem-defaults-copies.js
 *
 * CFGEC-31 (tech-debt) — Verificação automática de igualdade das cópias do
 * `ecosystem-defaults.json`.
 *
 * Contexto: existem 4 cópias supostamente byte-idênticas desse arquivo em
 * lugares diferentes do monorepo. A CANÔNICA é a do `repository-manager.cli`
 * (a que o `install` materializa no ecossistema). As demais são cópias que
 * DEVEM permanecer idênticas à canônica.
 *
 * Este script compara cada cópia contra a canônica por:
 *   1) bytes (sha256 do conteúdo bruto);
 *   2) JSON normalizado (parse + JSON.stringify canônico com chaves ordenadas),
 *      para detectar divergências semânticas mesmo que a formatação difira.
 *
 * Sai com código != 0 se QUALQUER cópia divergir da canônica (para ser
 * plugado no lint/CI do CFGEC-29). Só usa `node:fs`/`node:crypto`/`node:path`
 * — nenhuma dependência npm nova.
 *
 * Uso:
 *   node scripts/verify-ecosystem-defaults-copies.js
 */

'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

// Raiz do monorepo: este arquivo vive em
//   <repo>/repos/essential-repository/Main.Module/Application.layer/maintenance-toolkit.cli/scripts/
// Subimos 6 níveis para chegar em <repo>.
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');

// A cópia CANÔNICA — a fonte da verdade que o `install` materializa.
const CANONICAL = path.join(
  REPO_ROOT,
  'repos/essential-repository/Main.Module/Application.layer/repository-manager.cli/src/Configs/ecosystem-defaults.json'
);

// As demais cópias que DEVEM ser idênticas à canônica.
const COPIES = [
  path.join(
    REPO_ROOT,
    'repos/essential-repository/Main.Module/Application.layer/maintenance-toolkit.cli/src/Configs/ecosystem-defaults.json'
  ),
  path.join(
    REPO_ROOT,
    'Meta-Platform/meta-platform-open-standard/specifications/metadados/ecosystem-defaults.json'
  ),
  path.join(
    REPO_ROOT,
    'Meta-Platform/meta-platform-setup-wizard-command-line/configs/ecosystem-defaults.json'
  ),
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Normalização canônica de JSON: ordena chaves recursivamente para que a
// comparação semântica ignore ordem de chaves e formatação/espaços.
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function readReport(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, filePath };
  }
  const raw = fs.readFileSync(filePath);
  let normalized = null;
  let parseError = null;
  try {
    normalized = JSON.stringify(canonicalize(JSON.parse(raw.toString('utf8'))));
  } catch (err) {
    parseError = err.message;
  }
  return {
    exists: true,
    filePath,
    bytesHash: sha256(raw),
    normalizedHash: normalized === null ? null : sha256(Buffer.from(normalized)),
    parseError,
  };
}

function main() {
  console.log('== Verificação de cópias do ecosystem-defaults.json (CFGEC-31) ==\n');

  const canonical = readReport(CANONICAL);
  console.log('CANÔNICA:');
  console.log('  ' + CANONICAL);
  if (!canonical.exists) {
    console.error('  ERRO: arquivo canônico não encontrado.');
    process.exit(2);
  }
  if (canonical.parseError) {
    console.error('  ERRO: JSON canônico inválido: ' + canonical.parseError);
    process.exit(2);
  }
  console.log('  bytes(sha256)      = ' + canonical.bytesHash);
  console.log('  normalized(sha256) = ' + canonical.normalizedHash);
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
    if (copy.parseError) {
      console.log('    [DIVERGE] JSON inválido: ' + copy.parseError);
      failures++;
      continue;
    }

    const sameBytes = copy.bytesHash === canonical.bytesHash;
    const sameJson = copy.normalizedHash === canonical.normalizedHash;

    if (sameBytes && sameJson) {
      console.log('    [OK] byte-idêntica à canônica');
    } else if (!sameJson) {
      console.log('    [DIVERGE] conteúdo JSON difere (bytes=' +
        (sameBytes ? 'iguais' : 'diferentes') + ')');
      console.log('      copy   normalized(sha256) = ' + copy.normalizedHash);
      failures++;
    } else {
      // JSON igual mas bytes diferentes: só formatação/espaços divergem.
      console.log('    [DIVERGE] mesmo JSON, mas bytes diferem (formatação/whitespace)');
      console.log('      copy   bytes(sha256) = ' + copy.bytesHash);
      failures++;
    }
  }

  console.log('');
  if (failures === 0) {
    console.log('RESULTADO: OK — todas as ' + COPIES.length +
      ' cópias são byte-idênticas à canônica.');
    process.exit(0);
  }
  console.log('RESULTADO: FALHA — ' + failures + ' cópia(s) divergem da canônica.');
  process.exit(1);
}

main();
