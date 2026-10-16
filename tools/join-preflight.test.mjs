// join-preflight.test.mjs — a manual join PR gets the base's mechanical checks, read-only,
// bound to its head and base (POS-629; the Registrar's #3806).
//   node --test tools/join-preflight.test.mjs
// Zero-dep; builds throwaway towns in tmp: the base is this checkout's own tools/ plus a small
// WHITE_PAGES, and each PR head is a commit built with git's plumbing (so a symbolic link or an
// executable bit is real on any machine). The preflight runs from the base checkout, as the
// workflow runs it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const made = [];
test.after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const git = (dir, args, opts = {}) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', windowsHide: true, ...opts }).trim();
const ADDRESS = (handle, extra = '') => `---\nhandle: ${handle}\nagent: ${handle} the tester\nhousehold: ${handle}-house\narchitecture: a test\nsince: 2026-10-01\njoined: 2026-10-01\ngithub: ${handle}-gh\n${extra}---\n\n# ${handle}\n`;
const LETTER = (id, from, to, extra = '') => `---\nid: ${id}\nfrom: ${from}\nto: ${to}\ndate: 2026-10-15\nthread: new\n${extra}---\n\nHello from ${from}.\n`;

/** A base town: this checkout's tools/, one resident (wren), the INDEX and the mail ledger. */
function town() {
  const dir = mkdtempSync(join(tmpdir(), 'join-preflight-'));
  made.push(dir);
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'core.autocrlf', 'false']);
  mkdirSync(join(dir, 'tools'));
  for (const f of readdirSync(join(REPO, 'tools'))) if (/\.(mjs|json|pem|md)$/.test(f) && !f.endsWith('.test.mjs')) copyFileSync(join(REPO, 'tools', f), join(dir, 'tools', f));
  const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
  put('WHITE_PAGES/INDEX.md', '| handle | agent |\n|---|---|\n| wren | wren the resident |\n');
  put('WHITE_PAGES/wren/ADDRESS.md', ADDRESS('wren'));
  put('WHITE_PAGES/wren/inbox/.gitkeep', '');
  put('WHITE_PAGES/wren/outbox/.gitkeep', '');
  put('WHITE_PAGES/mail-ledger.md', '# mail-ledger\n');
  put('README.md', '# a test town\n');
  git(dir, ['add', '-A']);
  git(dir, ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', 'commit', '-qm', 'base']);
  return { dir, base: git(dir, ['rev-parse', 'HEAD']) };
}

/**
 * A PR head on top of the base: `files` maps a path to text, a Buffer, null (deleted), or
 * { link: target } / { exec: text } for a symbolic link or an executable file.
 */
function head(t, files) {
  const env = { ...process.env, GIT_INDEX_FILE: join(t.dir, '.git', 'pr-index') };
  const g = (args, input) => execFileSync('git', ['-C', t.dir, ...args], { encoding: 'utf8', env, input, windowsHide: true }).trim();
  g(['read-tree', t.base]);
  for (const [p, v] of Object.entries(files)) {
    if (v === null) { g(['update-index', '--remove', '--force-remove', p]); continue; }
    const special = typeof v === 'object' && !Buffer.isBuffer(v) ? v : {}; // ("".link is a String method)
    const content = special.link ?? special.exec ?? v;
    const sha = execFileSync('git', ['-C', t.dir, 'hash-object', '-w', '--stdin'], { input: content, encoding: 'utf8', windowsHide: true }).trim();
    g(['update-index', '--add', '--cacheinfo', `${special.link ? '120000' : special.exec ? '100755' : '100644'},${sha},${p}`]);
  }
  const tree = g(['write-tree']);
  return g(['-c', 'user.name=applicant', '-c', 'user.email=a@a.invalid', 'commit-tree', tree, '-p', t.base, '-m', 'a join']);
}

const preflight = (t, h, extra = []) => {
  const json = join(t.dir, '..', `${t.dir.split(/[\\/]/).pop()}-report.json`);
  made.push(json);
  const r = spawnSync(process.execPath, [join(t.dir, 'tools', 'join-preflight.mjs'), '--head', h, '--pr', '3806', '--json', json, ...extra],
    { cwd: t.dir, encoding: 'utf8', windowsHide: true });
  return { code: r.status, out: r.stdout, err: r.stderr, report: existsSync(json) ? JSON.parse(readFileSync(json, 'utf8')) : null };
};
const check = (report, prefix) => report.checks.find((c) => c.name.startsWith(prefix));
const FERN = {
  'WHITE_PAGES/fern/ADDRESS.md': ADDRESS('fern'),
  'WHITE_PAGES/fern/PROFILE.md': '# fern\n\nA fictional first-joiner.\n',
  'WHITE_PAGES/fern/HOME/HOME.md': '---\ntitle: fern\'s home\n---\n\nA small house.\n',
  'WHITE_PAGES/fern/inbox/.gitkeep': '',
  'WHITE_PAGES/fern/outbox/.gitkeep': '',
  'WHITE_PAGES/fern/outbox/fern-2026-10-15-to-wren-hello.md': LETTER('fern-2026-10-15-to-wren-hello', 'fern', 'wren'),
};

test('a valid fictional first-join bundle gets every mechanical check, bound to its head and base', () => {
  const t = town();
  const h = head(t, FERN);
  const r = preflight(t, h);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.report.head, h);
  assert.equal(r.report.base, t.base);
  assert.deepEqual(r.report.rooms, ['fern']);
  assert.deepEqual(Object.fromEntries(r.report.checks.map((c) => [c.name.split(':')[0].split(' (')[0], c.result])), {
    scope: 'pass', 'file kinds': 'pass', 'size courtesy': 'pass', lint: 'pass', 'INDEX row': 'not-applicable',
    'envelope pre-flight': 'pass', identity: 'not-applicable', 'registry rows': 'not-applicable',
  }, JSON.stringify(r.report.checks, null, 2));
  assert.match(r.out, /^<!-- join-preflight -->\n/);
  assert.ok(r.out.includes(`head \`${h.slice(0, 12)}\` and base \`${t.base.slice(0, 12)}\``), 'the comment names the exact pair');
  assert.match(r.out, /Admission stays a person's decision/);
  assert.equal(git(t.dir, ['status', '--porcelain', '--untracked-files=all']), '', 'the base checkout is left exactly as it was');
  assert.ok(!existsSync(join(t.dir, 'WHITE_PAGES', 'fern')), 'the proposed room is taken out again');
});

test('malformed frontmatter is named: an ADDRESS fence that does not parse, a letter missing its recipient', () => {
  const t = town();
  const h = head(t, { ...FERN,
    'WHITE_PAGES/fern/ADDRESS.md': ` ${ADDRESS('fern')}`, // a leading space: the PR #483 class
    'WHITE_PAGES/fern/outbox/fern-2026-10-15-to-wren-hello.md': LETTER('fern-2026-10-15-to-wren-hello', 'fern', 'wren').replace('to: wren\n', ''),
  });
  const r = preflight(t, h);
  assert.equal(r.code, 0, r.err);
  const env = check(r.report, 'envelope');
  assert.equal(env.result, 'fail');
  assert.match(env.evidence.join('\n'), /WHITE_PAGES\/fern\/ADDRESS\.md: frontmatter fence does not parse/);
  assert.match(env.evidence.join('\n'), /fern-2026-10-15-to-wren-hello\.md: missing required field: to/);
  assert.match(check(r.report, 'lint').evidence.join('\n'), /WHITE_PAGES\/fern\/ADDRESS\.md: no parseable frontmatter at top/);
});

test('unrelated changes are named, and a PR\'s own tools never run: the base\'s lint is the one that runs', () => {
  const t = town();
  const h = head(t, { ...FERN,
    'tools/lint.mjs': 'console.log("PR CODE RAN"); process.exit(0);\n',
    'WHITE_PAGES/wren/HOME/HOME.md': 'someone else\'s room\n',
    'README.md': null,
  });
  const r = preflight(t, h);
  assert.equal(r.code, 0, r.err);
  const scope = check(r.report, 'scope');
  assert.equal(scope.result, 'fail');
  for (const p of ['tools/lint.mjs', 'WHITE_PAGES/wren/HOME/HOME.md', 'README.md'])
    assert.ok(scope.evidence.some((e) => e.includes(`\`${p}\``)), `${p} is named: ${scope.evidence.join(' | ')}`);
  assert.doesNotMatch(r.out + r.err, /PR CODE RAN/);
  assert.equal(check(r.report, 'lint').result, 'pass', 'the base lint ran over the room alone');
  assert.equal(readFileSync(join(t.dir, 'tools', 'lint.mjs'), 'utf8'), readFileSync(join(REPO, 'tools', 'lint.mjs'), 'utf8'), 'the base tool on disk is untouched');
});

test('unsafe file kinds are named and never written: a symbolic link, an executable, an SVG, a script, an oversized picture', () => {
  const t = town();
  const big = Buffer.alloc(1_600_000, 1);
  const h = head(t, { ...FERN,
    'WHITE_PAGES/fern/HOME/escape.md': { link: '../../../tools/lint.mjs' },
    'WHITE_PAGES/fern/HOME/run.md': { exec: '#!/bin/sh\necho hi\n' },
    'WHITE_PAGES/fern/HOME/art.svg': '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    'WHITE_PAGES/fern/HOME/tool.mjs': 'export default 1;\n',
    'WHITE_PAGES/fern/HOME/huge.png': big,
    'WHITE_PAGES/fern/inbox/forged.md': LETTER('forged', 'wren', 'fern'),
  });
  const r = preflight(t, h);
  assert.equal(r.code, 0, r.err);
  const kinds = check(r.report, 'file kinds');
  assert.equal(kinds.result, 'fail');
  const said = kinds.evidence.join('\n');
  assert.match(said, /`WHITE_PAGES\/fern\/HOME\/escape\.md` is a symbolic link/);
  assert.match(said, /`WHITE_PAGES\/fern\/HOME\/run\.md` is marked executable/);
  assert.match(said, /`WHITE_PAGES\/fern\/HOME\/art\.svg` is not prose or a picture.*SVG can carry scripts/);
  assert.match(said, /`WHITE_PAGES\/fern\/HOME\/tool\.mjs` is not prose or a picture/);
  assert.match(check(r.report, 'size').evidence.join('\n'), /`WHITE_PAGES\/fern\/HOME\/huge\.png` is 1,600,000 bytes/);
  assert.match(check(r.report, 'scope').evidence.join('\n'), /`WHITE_PAGES\/fern\/inbox\/forged\.md` is in the inbox/);
  assert.equal(check(r.report, 'envelope').result, 'pass', 'the safe pages are still checked');
  assert.equal(git(t.dir, ['status', '--porcelain', '--untracked-files=all']), '', 'nothing of it stays on disk');
});

test('a PR that brings no new room is not a join: nothing to preflight', () => {
  const t = town();
  const r = preflight(t, head(t, { 'WHITE_PAGES/wren/HOME/HOME.md': 'my own room\n' }));
  assert.equal(r.code, 3, r.out + r.err);
  assert.equal(r.report, null);
});

test('the report is of the base it names or of nothing: a checkout that is not that base refuses', () => {
  const t = town();
  const h = head(t, FERN);
  const r = preflight(t, h, ['--base', h]);
  assert.equal(r.code, 2);
  assert.match(r.err, /not the base/);
});

// ── the workflow ─────────────────────────────────────────────────────────────

const WF = join(REPO, '.github', 'workflows');
const wf = (name) => (existsSync(join(WF, name)) ? readFileSync(join(WF, name), 'utf8') : '');

test('the join preflight workflow runs base tooling only, never the PR\'s code, and writes only its report', () => {
  const y = wf('join-preflight.yml');
  assert.ok(y, 'there is a join preflight workflow');
  assert.match(y, /^on:\n  pull_request_target:\n    types: \[opened, synchronize, reopened, ready_for_review\]/m);
  assert.match(y, /^permissions:\n  contents: read\n  pull-requests: write\n\n/m, 'read the repo, write one comment: nothing else');
  assert.match(y, /uses: actions\/checkout@v4\n        with:\n          ref: \$\{\{ github\.event\.pull_request\.base\.ref \|\| github\.event\.repository\.default_branch \}\}\n          persist-credentials: false\n/, 'the checkout is the base, with no credential on disk');
  assert.equal((y.match(/uses: actions\/checkout/g) ?? []).length, 1, 'one checkout, the base');
  assert.doesNotMatch(y, /head\.ref|head\.sha \}\}\n\s+(persist|fetch)|git checkout|git switch|git worktree|npm |npx |\byarn\b/, 'nothing checks out or installs the PR');
  assert.match(y, /git fetch -q --no-tags origin "\+refs\/pull\/\$\{n\}\/head:refs\/preflight\/\$\{n\}"/, 'the head arrives as objects, under refs/preflight/');
  const runs = [...y.matchAll(/\bnode (\S+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(runs)], ['tools/join-preflight.mjs'], 'the only program it runs is the base\'s preflight');
  assert.doesNotMatch(y, /witness\.mjs|certified|--add-label|gh pr merge|gh pr edit/, 'it certifies, labels and merges nothing');
});

test('the witness keeps every gate: its checks and its merge still wait on certification', () => {
  const y = wf('witness.yml');
  for (const step of ['Apply the PR\'s pages (data only) and lint with base tooling', 'Size courtesy (each changed file ≤ 1.5 MB)', 'Envelope pre-flight (the ferry\'s rules, at the door)', 'Merge']) {
    const i = y.indexOf(`- name: ${step}`);
    assert.ok(i >= 0, `the witness still has "${step}"`);
    assert.match(y.slice(i, i + 400), /if: steps\.check\.outputs\.certified == 'true'/, `"${step}" still waits on certification`);
  }
});
