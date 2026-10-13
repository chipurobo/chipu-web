#!/usr/bin/env node
/**
 * Seed learners and their logins from a spreadsheet, or generate a synthetic
 * roster to test at scale.
 *
 *   node scripts/seed-learners.mjs --file learners.xlsx            # validate only
 *   node scripts/seed-learners.mjs --file learners.xlsx --apply    # write
 *   node scripts/seed-learners.mjs --synthetic 30000 --apply       # fake data
 *
 * Columns (header names are matched loosely): school (name or code) and
 * admission_number. Optional: grade, password, full_name (schools usually
 * give no names; the admission number is the learner's label).
 *
 * Passwords: --password-mode school (default) generates one password per
 * school; --password-mode per-learner generates one per learner; a password
 * column in the file always wins. Generated passwords are written to
 * .context/seed-credentials-<timestamp>.csv (mode 600, gitignored). Share
 * them with schools through a channel you trust, then delete the file.
 *
 * Database: --db docker (default, the local Supabase container) or
 * --db "postgresql://…" for a hosted project (needs psql on PATH).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : []).filter(Boolean));
const apply = args.apply === true;
const db = args.db ?? 'docker';
const passwordMode = args['password-mode'] ?? 'school';
const batchSize = Number(args.batch ?? 500);

function psql(sql) {
  const cmd = db === 'docker'
    ? ['docker', ['exec', '-i', 'supabase_db_chipurobo-dashboard', 'psql', '-U', 'postgres', '-d', 'postgres', '-qAt', '-v', 'ON_ERROR_STOP=1']]
    : ['psql', [db, '-qAt', '-v', 'ON_ERROR_STOP=1']];
  const result = spawnSync(cmd[0], cmd[1], { input: sql, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.split('\n').filter((l) => l.includes('ERROR')).join('\n') || result.stderr);
  return result.stdout.trim();
}
const q = (v) => `'${String(v).replaceAll("'", "''")}'`;
const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const login = (code, adm) => `${code}-${slug(adm)}`;
const generatePassword = () => `Chipu-${randomBytes(4).toString('hex')}`;

// ---------------------------------------------------------------- schools
const schools = JSON.parse(psql(`select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', code)), '[]') from public.schools;`));
const byCode = new Map(schools.map((s) => [s.code.toLowerCase(), s]));
const byName = new Map(schools.map((s) => [s.name.trim().toLowerCase(), s]));
console.log(`Schools in database: ${schools.length}`);

// ---------------------------------------------------------------- rows
let rows = [];
if (args.synthetic) {
  const total = Number(args.synthetic);
  const first = ['Amani', 'Baraka', 'Chebet', 'Dalia', 'Eman', 'Faith', 'Gacheru', 'Halima', 'Imani', 'Juma', 'Kamau', 'Lulu', 'Mumbi', 'Neema', 'Otieno', 'Pendo', 'Rehema', 'Saidi', 'Tumaini', 'Wanjiru', 'Zawadi'];
  const last = ['Achieng', 'Barasa', 'Cheruiyot', 'Githinji', 'Hassan', 'Kiprop', 'Mwangi', 'Njoroge', 'Ochieng', 'Omondi', 'Wafula', 'Wanjala', 'Yusuf'];
  const year = new Date().getFullYear();
  const prefix = args.prefix ?? String(year);
  schools.forEach((school, s) => {
    const share = Math.floor(total / schools.length) + (s < total % schools.length ? 1 : 0);
    for (let n = 1; n <= share; n++) rows.push({ school: school.code, admission_number: `${prefix}/${String(n).padStart(4, '0')}`,
      full_name: args['with-names'] ? `${first[(s * 7 + n) % first.length]} ${last[(s * 3 + n * 5) % last.length]}` : '', grade: String(4 + ((s + n) % 9)) });
  });
  console.log(`Generated ${rows.length} synthetic learners across ${schools.length} schools`);
} else if (args.file) {
  const XLSX = require('xlsx');
  const book = XLSX.read(readFileSync(args.file));
  const sheet = book.Sheets[book.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const pick = (r, keys) => { for (const k of Object.keys(r)) if (keys.includes(k.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'))) return String(r[k]).trim(); return ''; };
  rows = raw.map((r) => ({ school: pick(r, ['school', 'school_name', 'school_code', 'code']), admission_number: pick(r, ['admission_number', 'admission', 'adm', 'adm_no', 'admission_no']),
    full_name: pick(r, ['full_name', 'name', 'learner', 'student', 'learner_name']), grade: pick(r, ['grade', 'class', 'form']), password: pick(r, ['password']) }));
  console.log(`Read ${rows.length} rows from ${args.file}`);
} else { console.error('Give --file <xlsx|csv> or --synthetic <count>.'); process.exit(1); }

// ---------------------------------------------------------------- validate
const problems = [];
const seen = new Set();
const perSchool = new Map();
for (const [i, r] of rows.entries()) {
  const line = i + 2;
  const school = byCode.get(r.school.toLowerCase()) ?? byName.get(r.school.toLowerCase());
  if (!school) { problems.push(`row ${line}: school "${r.school}" not found`); continue; }
  r.school_id = school.id; r.code = school.code;
  if (!r.admission_number) { problems.push(`row ${line}: missing admission number`); continue; }
  if (!/^[A-Za-z0-9][A-Za-z0-9/._ -]{0,19}$/.test(r.admission_number)) problems.push(`row ${line}: admission number "${r.admission_number}" has unsupported characters or is longer than 20`);
  const l = login(school.code, r.admission_number);
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(l)) problems.push(`row ${line}: login "${l}" is not 3–32 characters`);
  const key = `${school.id}|${r.admission_number.toLowerCase()}`;
  if (seen.has(key)) problems.push(`row ${line}: duplicate admission number ${r.admission_number} at ${school.name}`); seen.add(key);
  if (r.password && r.password.length < 8) problems.push(`row ${line}: password shorter than 8`);
  perSchool.set(school.id, (perSchool.get(school.id) ?? 0) + 1);
}
const big = [...perSchool.entries()].filter(([, n]) => n > 1000);
for (const [id, n] of big) problems.push(`school ${schools.find((s) => s.id === id).name} has ${n} learners; pages that list a whole roster stop at 1000`);
console.log(`Schools used: ${perSchool.size}. Largest roster: ${Math.max(0, ...perSchool.values())}.`);
if (problems.length) { console.log(`\n${problems.length} problem(s):`); problems.slice(0, 50).forEach((p) => console.log('  ' + p)); if (problems.length > 50) console.log(`  … and ${problems.length - 50} more`); }
if (!apply) { console.log(problems.length ? '\nFix the problems above, then run again with --apply.' : '\nLooks good. Run again with --apply to write.'); process.exit(problems.length ? 1 : 0); }
if (problems.some((p) => !p.includes('stop at 1000'))) { console.error('\nNot applying while there are problems.'); process.exit(1); }

// ---------------------------------------------------------------- apply
const adminId = psql(`select id from public.profiles where role = 'admin' order by created_at limit 1;`);
if (!adminId) { console.error('No admin profile found.'); process.exit(1); }
const schoolPasswords = new Map();
const credentials = [];
let created = 0, skipped = 0, failed = 0;
const started = Date.now();
mkdirSync('.context', { recursive: true });
const groups = new Map();
for (const r of rows) { if (!r.school_id) continue; if (!groups.has(r.school_id)) groups.set(r.school_id, []); groups.get(r.school_id).push(r); }
for (const [schoolId, list] of groups) {
  const school = schools.find((s) => s.id === schoolId);
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize).map((r) => {
      let password = r.password;
      if (!password) {
        if (passwordMode === 'school') { if (!schoolPasswords.has(schoolId)) schoolPasswords.set(schoolId, generatePassword()); password = schoolPasswords.get(schoolId); }
        else password = generatePassword();
      }
      r.resolved_password = password;
      return { full_name: r.full_name || null, admission_number: r.admission_number, grade: r.grade || null, password };
    });
    const out = JSON.parse(psql(`begin;
select set_config('request.jwt.claim.sub', ${q(adminId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select public.admin_bulk_create_learners(${q(schoolId)}, ${q(JSON.stringify(batch))}::jsonb, null);
commit;`).split('\n').find((l) => l.startsWith('{')));
    created += out.created; skipped += out.skipped; failed += out.errors.length;
    for (const e of out.errors) console.log(`  ${school.name} ${e.admission_number}: ${e.message}`);
    for (const l of out.logins) { const r = batch.find((b) => b.admission_number === l.admission_number); credentials.push([school.name, school.code, l.admission_number, l.login, r.password]); }
    process.stdout.write(`\r${created} created, ${skipped} already had logins, ${failed} failed  (${Math.round((Date.now() - started) / 1000)}s)   `);
  }
}
console.log();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `.context/seed-credentials-${stamp}.csv`;
writeFileSync(file, ['school,school_code,admission_number,login,password', ...credentials.map((c) => c.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n'), { mode: 0o600 });
console.log(`Credentials for ${credentials.length} new logins written to ${file} (keep it private, delete after sharing).`);
console.log(`Done in ${Math.round((Date.now() - started) / 1000)}s.`);
