#!/usr/bin/env node
/**
 * verify-webgui-build-profiles.js
 *
 * WGMEM — mostra o perfil de build EFETIVO de cada `.webgui`, em todos os
 * repositórios (inclusive os de terceiros).
 *
 * Por que existe: o perfil não está escrito em lugar nenhum do pacote. Ele é
 * resolvido em cadeia — ambiente, depois o parâmetro do próprio pacote, depois
 * o `RT_WEBGUI_BUILD_PROFILE` herdado do ecosystem-defaults, e por último o
 * `isWatch` legado. Olhar o `startup-params.json` de um webgui e ver
 * `"isWatch": true` dá a impressão errada de que aquele pacote sobe em watch,
 * quando o padrão do ecossistema tem precedência sobre ele.
 *
 * Este script aplica a MESMA função de resolução que o builder usa em runtime
 * (BuildProfiles.ResolveBuildProfile), então o que ele mostra é o que vai
 * acontecer de verdade.
 *
 * Uso:
 *   node scripts/verify-webgui-build-profiles.js
 *   node scripts/verify-webgui-build-profiles.js --ecosystem ~/EcosystemData
 *   node scripts/verify-webgui-build-profiles.js --expect release   # vira gate
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');

const CANONICAL_DEFAULTS = path.join(
  REPO_ROOT,
  'repos/essential-repository/Main.Module/Application.layer/repository-manager.cli/src/Configs/ecosystem-defaults.json'
);

// A resolução vem da lib que o runtime usa — replicá-la aqui garantiria que os
// dois se contradissessem no primeiro ajuste de precedência.
const BUILD_PROFILES_CANDIDATES = [
  path.join(REPO_ROOT, 'repos/ecosystem-core-repository/Main.Module/Libraries.layer/web-interface-builder.lib/src/BuildProfiles.js'),
  path.join(REPO_ROOT, 'repos/EcosystemCoreRepo/Main.Module/Libraries.layer/web-interface-builder.lib/src/BuildProfiles.js')
];

const _ParseArgs = (argv) => {
  const args = { roots: [] };
  for(let i = 0; i < argv.length; i++){
    if(argv[i] === '--ecosystem') args.ecosystem = argv[++i];
    else if(argv[i] === '--expect') args.expect = argv[++i];
    else if(argv[i] === '--json')   args.json = true;
  }
  return args;
};

const _ReadJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e) { return undefined; }
};

// Varredura de diretórios `.webgui`, limitada em profundidade porque a árvore
// de um repositório é rasa (Module/layer/group/pacote) e node_modules não deve
// ser percorrido nunca.
const _FindWebguis = (root, depth = 0, found = []) => {
  if(depth > 7) return found;
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); }
  catch(e) { return found; }

  for(const entry of entries){
    if(!entry.isDirectory()) continue;
    if(entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(root, entry.name);
    if(entry.name.endsWith('.webgui')) found.push(full);
    else _FindWebguis(full, depth + 1, found);
  }
  return found;
};

const Main = () => {
  const args = _ParseArgs(process.argv.slice(2));

  const buildProfilesPath = BUILD_PROFILES_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if(!buildProfilesPath){
    console.error('Não encontrei o BuildProfiles.js do web-interface-builder.lib.');
    process.exit(2);
  }
  const BuildProfiles = require(buildProfilesPath);

  const defaults = _ReadJson(CANONICAL_DEFAULTS) || {};
  const inheritedProfile = defaults.RT_WEBGUI_BUILD_PROFILE;

  // O ambiente NÃO entra na resolução aqui: queremos o perfil que o pacote terá
  // por configuração, não o que uma variável desta sessão forçaria.
  const env = {};

  const roots = [path.join(REPO_ROOT, 'repos'), path.join(REPO_ROOT, 'thrid-party-repos')];
  if(args.ecosystem) roots.push(path.join(args.ecosystem.replace(/^~/, process.env.HOME || '~'), 'repos'));

  const rows = [];
  for(const root of roots){
    for(const webgui of _FindWebguis(root)){
      const startupParams = _ReadJson(path.join(webgui, 'metadata', 'startup-params.json')) || {};
      const declared = startupParams.webguiBuildProfile;
      const isWatch  = startupParams.isWatch;

      const profile = BuildProfiles.ResolveBuildProfile({
        profileName: declared || inheritedProfile,
        isWatch,
        env
      });

      // De onde veio a decisão — é o que explica o resultado ao leitor.
      const origin = declared ? 'pacote'
        : inheritedProfile ? 'ecosystem-defaults'
        : isWatch === true ? 'isWatch (legado)'
        : 'padrão embutido';

      rows.push({
        name: path.basename(webgui),
        repo: path.relative(REPO_ROOT, webgui).split(path.sep).slice(0, 2).join('/') || webgui,
        declaresIsWatch: isWatch === true,
        declaredProfile: declared || null,
        effectiveProfile: profile.name,
        watch: profile.watch,
        origin
      });
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  if(args.json){
    console.log(JSON.stringify({ inheritedProfile, rows }, null, 2));
  } else {
    console.log('');
    console.log(`  Perfil herdado do ecosystem-defaults: ${inheritedProfile || '(não declarado)'}`);
    console.log('  ' + '─'.repeat(88));
    console.log(`  ${'PERFIL'.padEnd(12)} ${'WATCH'.padEnd(6)} ${'ORIGEM'.padEnd(20)} ${'isWatch?'.padEnd(9)} WEBGUI`);
    console.log('  ' + '─'.repeat(88));
    for(const row of rows)
      console.log(`  ${row.effectiveProfile.padEnd(12)} ${(row.watch ? 'sim' : 'não').padEnd(6)} ${row.origin.padEnd(20)} ${(row.declaresIsWatch ? 'declara' : '—').padEnd(9)} ${row.name}`);
    console.log('  ' + '─'.repeat(88));

    const byProfile = rows.reduce((acc, row) => { acc[row.effectiveProfile] = (acc[row.effectiveProfile] || 0) + 1; return acc; }, {});
    console.log(`  total: ${rows.length} webgui(s) — ` + Object.entries(byProfile).map(([k, v]) => `${k}: ${v}`).join(', '));

    const legacyOverridden = rows.filter((row) => row.declaresIsWatch && !row.watch)
    if(legacyOverridden.length)
      console.log(`  ${legacyOverridden.length} pacote(s) declaram isWatch mas o padrão do ecossistema tem precedência — não sobem em watch.`);
    console.log('');
  }

  if(args.expect){
    const offenders = rows.filter((row) => row.effectiveProfile !== args.expect);
    if(offenders.length){
      console.error(`FALHA: ${offenders.length} webgui(s) não resolvem para "${args.expect}": ${offenders.map((o) => `${o.name} (${o.effectiveProfile})`).join(', ')}`);
      process.exit(1);
    }
    console.log(`OK: todos os ${rows.length} webgui(s) resolvem para "${args.expect}".`);
  }
};

Main();
