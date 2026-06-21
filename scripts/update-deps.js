#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
const readline = require('readline');
// Minimal semver helpers (avoids requiring node_modules)
function parseVersion(v) {
  if (!v) return null;
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3], version: `${+m[1]}.${+m[2]}.${+m[3]}` };
}

function validVersion(v) {
  return !!parseVersion(v);
}

function coerceVersion(v) {
  if (!v) return null;
  const m = String(v).match(/(\d+\.\d+\.\d+)/);
  return m ? m[1] : null;
}

function minVersionFromSpec(spec) {
  return coerceVersion(spec);
}

function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return NaN;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

function lte(a, b) {
  return compareVersions(a, b) <= 0;
}
function gt(a, b) {
  return compareVersions(a, b) > 0;
}
const path = require('path');

const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const sections = ['dependencies', 'devDependencies'];

function run(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return null;
  }
}

function getVersions(name) {
  const out = run(`npm view ${name} versions --json`);
  if (!out) return null;
  try {
    const arr = JSON.parse(out);
    if (Array.isArray(arr)) return arr.filter((v) => parseVersion(v));
    return null;
  } catch (e) {
    return null;
  }
}

function getLatestStable(name) {
  // Prefer getting all stable versions and pick the highest
  const vers = getVersions(name);
  if (vers && vers.length) return vers[vers.length - 1];
  // Fallback to dist-tags if versions list not available
  const out = run(`npm view ${name} dist-tags --json`);
  if (!out) return null;
  try {
    const tags = JSON.parse(out);
    const latest = tags && tags.latest ? String(tags.latest) : null;
    // ensure latest is a stable semver
    if (latest && parseVersion(latest)) return latest;
    return null;
  } catch (e) {
    return null;
  }
}

function pickCandidates(versions, currentSpec) {
  const min = minVersionFromSpec(currentSpec);
  const current = min ? min : coerceVersion(currentSpec);
  if (!current) return {};
  let patch = null,
    minor = null,
    major = null;
  for (const v of versions) {
    if (!validVersion(v)) continue;
    if (lte(v, current)) continue;
    const parsed = parseVersion(v);
    const curParsed = parseVersion(current);
    if (!parsed || !curParsed) continue;
    if (parsed.major === curParsed.major) {
      if (parsed.minor === curParsed.minor) {
        if (!patch || gt(parsed.version, patch)) patch = parsed.version;
      } else if (parsed.minor > curParsed.minor) {
        if (!minor || gt(parsed.version, minor)) minor = parsed.version;
      }
    } else if (parsed.major > curParsed.major) {
      if (!major || gt(parsed.version, major)) major = parsed.version;
    }
  }
  return { current, patch, minor, major };
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) =>
    rl.question(question, (ans) => {
      rl.close();
      res(ans.trim());
    }),
  );
}

async function processSection(section) {
  const deps = pkg[section] || {};
  const names = Object.keys(deps);
  for (const name of names) {
    const origSpec = deps[name];
    const versions = getVersions(name);
    let candidates = {};
    if (versions && versions.length) {
      candidates = pickCandidates(versions, origSpec);
    } else {
      const latest = getLatestStable(name);
      if (latest)
        candidates = {
          current: minVersionFromSpec(origSpec) ? minVersionFromSpec(origSpec) : coerceVersion(origSpec),
          patch: null,
          minor: null,
          major: latest,
        };
    }
    if (!candidates.current) continue;
    if (!candidates.patch && !candidates.minor && !candidates.major) continue; // up-to-date

    console.log(`\n${section} -> ${name}`);
    console.log(`  current: ${candidates.current}  spec: ${origSpec}`);
    console.log(
      `  patch:  ${candidates.patch || '-'}\n  minor:  ${candidates.minor || '-'}\n  major:  ${candidates.major || '-'}\n`,
    );

    const ans = await ask('Choose update [p]atch, [n]minor, [M]major, [s]kip, [q]quit: ');
    if (!ans) continue;
    const ch = ans[0].toLowerCase();
    if (ch === 'q') return false;
    let chosen = null;
    if (ch === 'p' && candidates.patch) chosen = candidates.patch;
    if (ch === 'n' && candidates.minor) chosen = candidates.minor;
    if (ans[0] === 'M' && candidates.major) chosen = candidates.major;
    if (ch === 's') continue;
    if (!chosen) {
      console.log('No such candidate available, skipped.');
      continue;
    }

    // preserve prefix ^ or ~ if present
    const m = origSpec.match(/^(\^|~|>=|<=|>|<|=)?\s*(.*)$/);
    const prefix = m && m[1] ? m[1] : '';
    deps[name] = prefix + chosen;
    console.log(`Updated ${name} -> ${deps[name]}`);
  }
  pkg[section] = deps;
  return true;
}

async function main() {
  console.log('Scanning dependencies for available updates...');
  for (const s of sections) {
    const ok = await processSection(s);
    if (ok === false) break;
  }

  const ans = await ask('\nApply changes to package.json? [y/N]: ');
  if (ans && ans.toLowerCase().startsWith('y')) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('package.json updated. Run `npm install` to apply changes.');
  } else {
    console.log('No changes applied. Exiting.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
