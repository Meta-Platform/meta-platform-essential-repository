#!/usr/bin/env node
/**
 * webgui-build-rss-probe.js
 *
 * WGMEM — instrumento de medição do resíduo de memória do build de `.webgui`.
 *
 * Contexto: o build de interface (webpack 5) roda DENTRO de processos de vida
 * longa — o daemon `ecosystem-instance-manager.app`, cada `run package` e o
 * processo principal do Electron. Sem `compiler.close()` e com o `Watching`
 * descartado, tudo que o webpack alocou (module graph, source maps, o cache de
 * arquivos lidos) continua alcançável para sempre. O sintoma é um `.webapp` que
 * deveria ocupar pouco parado em ~500 MB.
 *
 * Este script NÃO altera nada: só lê `/proc` pelo mesmo `process-metrics.lib`
 * que o daemon já usa para o painel de monitoramento, para que a medição aqui e
 * a métrica que o usuário vê no Instance Executor venham da mesma fonte.
 *
 * Três modos:
 *
 *   --survey                    Fotografia comparativa: agrupa os processos do
 *                               package-executor por tipo de pacote e mostra o
 *                               delta entre quem embute webgui e quem não
 *                               embute. É a linha de base do projeto.
 *
 *   --pid <pid> [--seconds N]   Acompanha UM processo: rss inicial, pico, final
 *                               e delta. Use antes/depois de subir um webgui.
 *
 *   --pid <pid> --group         Idem, mas somando o grupo de processos (para
 *                               desktopapp, onde a aplicação é `run` + Electron
 *                               + renderers, não um processo só).
 *
 * Uso:
 *   node scripts/webgui-build-rss-probe.js --survey
 *   node scripts/webgui-build-rss-probe.js --pid 2963064 --seconds 180
 *   node scripts/webgui-build-rss-probe.js --pid 2519716 --group --seconds 60
 *   node scripts/webgui-build-rss-probe.js --survey --json > baseline.json
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

// Este arquivo vive em
//   <repo>/repos/essential-repository/Main.Module/Application.layer/maintenance-toolkit.cli/scripts/
// Subimos 6 níveis para chegar em <repo>.
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');

// Este script roda por `node scripts/...`, fora do Package Executor — quem
// instala o hook que faz o `require` enxergar `.ts` é o executor, e aqui ele
// não passou. Sem isto, o sampler (que é TypeScript) carrega, mas o primeiro
// vizinho que ele pedir sem extensão vira MODULE_NOT_FOUND.
require(path.join(
  REPO_ROOT,
  'repos/essential-repository/Commons.Module/Libraries.layer/module-resolution.lib/src/register.js'
));

// O sampler vive no ecosystem-core. Num checkout do monorepo o caminho é
// direto; num ecossistema INSTALADO os repositórios têm outros nomes de
// diretório (EcosystemCoreRepo), então tentamos os dois.
//
// Sem extensão no caminho base: a linguagem do arquivo é assunto do repositório
// que o mantém, e o sampler JÁ virou TypeScript. Escrito como `...Sampler.js`,
// este script morria com "não encontrei o CreateProcessSampler" — a medição
// inteira ficava indisponível por causa de uma letra.
const SAMPLER_BASES = [
  path.join(REPO_ROOT, 'repos/ecosystem-core-repository/Main.Module/Libraries.layer/process-metrics.lib/src/CreateProcessSampler'),
  path.join(REPO_ROOT, 'repos/EcosystemCoreRepo/Main.Module/Libraries.layer/process-metrics.lib/src/CreateProcessSampler')
];

const SAMPLER_CANDIDATES = SAMPLER_BASES.flatMap((base) => [`${base}.js`, `${base}.ts`]);

const _LoadSampler = () => {
  const found = SAMPLER_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    console.error('Não encontrei o CreateProcessSampler. Procurei em:');
    SAMPLER_CANDIDATES.forEach((candidate) => console.error(`  ${candidate}`));
    process.exit(2);
  }
  return require(found);
};

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const _ParseArgs = (argv) => {
  const args = { seconds: 60, intervalMs: 500 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--survey')       args.survey = true;
    else if (arg === '--group')   args.group = true;
    else if (arg === '--json')    args.json = true;
    else if (arg === '--pid')     args.pid = Number(argv[++i]);
    else if (arg === '--seconds') args.seconds = Number(argv[++i]);
    else if (arg === '--interval-ms') args.intervalMs = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
};

const USAGE = `
webgui-build-rss-probe — mede o resíduo de memória do build de .webgui

  --survey                 fotografia comparativa webapp (com gui) vs app (sem gui)
  --pid <pid>              acompanha um processo ao longo do tempo
  --group                  soma o grupo de processos do pid (desktopapp/Electron)
  --seconds <n>            duração do acompanhamento (padrão: 60)
  --interval-ms <n>        intervalo entre amostras (padrão: 500)
  --json                   saída em JSON, para registrar a linha de base
`;

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

const _Mb = (bytes) =>
  bytes === undefined || bytes === null ? '   —  ' : `${(bytes / 1024 / 1024).toFixed(0).padStart(5)} MB`;

const _DeltaMb = (bytes) => {
  if (bytes === undefined || bytes === null) return '   —  ';
  const sign = bytes >= 0 ? '+' : '-';
  return `${sign}${(Math.abs(bytes) / 1024 / 1024).toFixed(0).padStart(4)} MB`;
};

const _Median = (values) => {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

// ---------------------------------------------------------------------------
// Modo --survey
// ---------------------------------------------------------------------------

// O tipo do pacote está no sufixo do diretório apontado por --package: um
// `.webapp` embute webgui e por isso paga o webpack; um `.app` não. A comparação
// entre as duas populações é o que isola o custo do build.
const _ClassifyPackage = (packagePath) => {
  if (!packagePath) return { kind: 'unknown', embedsWebgui: false };
  const name = path.basename(packagePath);
  const suffix = name.slice(name.lastIndexOf('.'));
  const embedsWebgui = suffix === '.webapp' || suffix === '.desktopapp';
  return { kind: suffix.replace('.', '') || 'unknown', name, embedsWebgui };
};

const _ReadCmdline = (pid) => {
  try {
    // /proc/<pid>/cmdline separa os argumentos por NUL, não por espaço.
    return fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
  } catch (e) { return undefined; }
};

const _ExtractPackagePath = (argv) => {
  const index = argv.indexOf('--package');
  return index >= 0 ? argv[index + 1] : undefined;
};

const _CollectExecutorProcesses = (sampler) => {
  const entries = fs.readdirSync('/proc').filter((entry) => /^\d+$/.test(entry));

  return entries
    .map((entry) => {
      const pid  = Number(entry);
      const argv = _ReadCmdline(pid);
      if (!argv || !argv[0] || !argv[0].includes('meta-platform-package-executor')) return undefined;

      const packagePath = _ExtractPackagePath(argv);
      // O wrapper shell aparece no /proc com "$PACKAGE_PATH" ainda literal —
      // é o processo que vai virar o executor, não o executor. Ignoramos.
      if (!packagePath || packagePath.includes('$')) return undefined;

      const sample = sampler.SampleProcess(pid);
      if (!sample) return undefined;

      return { pid, ...(_ClassifyPackage(packagePath)), packagePath, rssBytes: sample.rssBytes, threads: sample.threads, uptimeSeconds: sample.uptimeSeconds };
    })
    .filter(Boolean)
    .sort((a, b) => (b.rssBytes || 0) - (a.rssBytes || 0));
};

const _RunSurvey = (sampler, args) => {
  const processes = _CollectExecutorProcesses(sampler);

  if (processes.length === 0) {
    console.error('Nenhum processo do package-executor encontrado. O ecossistema está no ar?');
    process.exit(1);
  }

  const withWebgui    = processes.filter((p) => p.embedsWebgui);
  const withoutWebgui = processes.filter((p) => !p.embedsWebgui);

  const medianWith    = _Median(withWebgui.map((p) => p.rssBytes).filter(Number.isFinite));
  const medianWithout = _Median(withoutWebgui.map((p) => p.rssBytes).filter(Number.isFinite));
  const residuePerInstance = medianWith !== undefined && medianWithout !== undefined
    ? medianWith - medianWithout
    : undefined;

  const report = {
    takenAt: new Date().toISOString(),
    processes,
    summary: {
      withWebguiCount:      withWebgui.length,
      withoutWebguiCount:   withoutWebgui.length,
      medianRssWithWebgui:  medianWith,
      medianRssWithoutWebgui: medianWithout,
      residuePerInstanceBytes: residuePerInstance,
      // O que o ecossistema inteiro paga hoje pelo build residente.
      totalResidueBytes: residuePerInstance !== undefined ? residuePerInstance * withWebgui.length : undefined
    }
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('');
  console.log('  RSS por instância do package-executor');
  console.log('  ' + '─'.repeat(74));
  processes.forEach((p) => {
    const marker = p.embedsWebgui ? '▓' : '░';
    console.log(`  ${marker} ${_Mb(p.rssBytes)}  ${String(p.kind).padEnd(11)} ${p.name}`);
  });

  console.log('');
  console.log('  ▓ embute webgui (paga o webpack)   ░ não embute');
  console.log('  ' + '─'.repeat(74));
  console.log(`  mediana COM webgui   (${String(withWebgui.length).padStart(2)} proc): ${_Mb(medianWith)}`);
  console.log(`  mediana SEM webgui   (${String(withoutWebgui.length).padStart(2)} proc): ${_Mb(medianWithout)}`);
  console.log(`  resíduo por instância         : ${_DeltaMb(residuePerInstance)}`);
  console.log(`  resíduo total no ecossistema  : ${_DeltaMb(report.summary.totalResidueBytes)}`);
  console.log('');
};

// ---------------------------------------------------------------------------
// Modo --pid
// ---------------------------------------------------------------------------

const _RunWatch = async (sampler, args) => {
  const Sample = () => args.group ? sampler.SampleProcessGroup(args.pid) : sampler.SampleProcess(args.pid);

  const first = Sample();
  if (!first) {
    console.error(`Não consegui amostrar ${args.group ? 'o grupo' : 'o processo'} ${args.pid}. Ele existe?`);
    process.exit(1);
  }

  const scope = args.group ? `grupo ${args.pid}` : `pid ${args.pid}`;
  if (!args.json) {
    console.log('');
    console.log(`  Acompanhando ${scope} por ${args.seconds}s (amostra a cada ${args.intervalMs}ms)`);
    console.log('  ' + '─'.repeat(58));
  }

  const samples = [];
  const startedAtMs = Date.now();
  const deadlineMs  = startedAtMs + args.seconds * 1000;

  let peak = first;
  let last = first;

  while (Date.now() < deadlineMs) {
    await new Promise((resolve) => setTimeout(resolve, args.intervalMs));

    const sample = Sample();
    // O processo pode morrer no meio da janela — no caso do worker de build,
    // é exatamente o que queremos observar.
    if (!sample) {
      if (!args.json) console.log(`  ${new Date().toISOString()}  processo encerrado`);
      last = undefined;
      break;
    }

    samples.push({ atMs: Date.now() - startedAtMs, rssBytes: sample.rssBytes, cpuPercent: sample.cpuPercent });
    if ((sample.rssBytes || 0) > (peak.rssBytes || 0)) peak = sample;
    last = sample;

    if (!args.json) {
      const elapsed = ((Date.now() - startedAtMs) / 1000).toFixed(0).padStart(4);
      console.log(`  ${elapsed}s  rss ${_Mb(sample.rssBytes)}  cpu ${String(sample.cpuPercent).padStart(5)}%  proc ${String(sample.processCount).padStart(2)}`);
    }
  }

  const report = {
    scope,
    pid: args.pid,
    group: !!args.group,
    durationSeconds: args.seconds,
    rssFirstBytes: first.rssBytes,
    rssPeakBytes:  peak.rssBytes,
    rssLastBytes:  last && last.rssBytes,
    deltaBytes:    last ? (last.rssBytes || 0) - (first.rssBytes || 0) : undefined,
    // Quanto do pico NÃO foi devolvido: é a definição operacional de resíduo.
    retainedFromPeakBytes: last ? (last.rssBytes || 0) - (first.rssBytes || 0) : undefined,
    samples
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('  ' + '─'.repeat(58));
  console.log(`  inicial : ${_Mb(report.rssFirstBytes)}`);
  console.log(`  pico    : ${_Mb(report.rssPeakBytes)}`);
  console.log(`  final   : ${_Mb(report.rssLastBytes)}`);
  console.log(`  delta   : ${_DeltaMb(report.deltaBytes)}   ← o que NÃO voltou ao SO`);
  console.log('');
};

// ---------------------------------------------------------------------------

const Main = async () => {
  const args = _ParseArgs(process.argv.slice(2));

  if (args.help || (!args.survey && !args.pid)) {
    console.log(USAGE);
    process.exit(args.help ? 0 : 1);
  }

  const sampler = _LoadSampler()();

  if (!sampler.IsSupported()) {
    console.error('Este sistema não expõe /proc — a medição de RSS não está disponível aqui.');
    process.exit(2);
  }

  if (args.survey) _RunSurvey(sampler, args);
  else await _RunWatch(sampler, args);
};

Main().catch((error) => {
  console.error(error);
  process.exit(1);
});
