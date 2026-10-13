#!/usr/bin/env node
/**
 * Seed learners and their logins. Learners have no password: they sign in
 * with their school and a four-digit admission number that the database
 * assigns in order (0001, 0002, …) unless the file provides one.
 *
 *   node scripts/seed-learners.mjs --file learners.xlsx            # validate only
 *   node scripts/seed-learners.mjs --file learners.xlsx --apply    # write
 *   node scripts/seed-learners.mjs --synthetic 30000 --apply       # fake rows
 *   node scripts/seed-learners.mjs --count 40 --school likoni-vi --apply
 *                                                                  # 40 new numbered learners at one school
 *
 * File columns (header names matched loosely): school (name or code).
 * Optional: admission_number (1–4 digits), grade, full_name.
 *
 * Database: --db docker (default, the local Supabase container) or
 * --db linked to run through `supabase db query --linked` on the hosted project.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : []).filter(Boolean));
const apply = args.apply === true;
const db = args.db ?? 'docker';
const batchSize = Number(args.batch ?? 500);

function sql(query) {
  if (db === 'linked') {
    const r = spawnSync(`${homedir()}/.local/bin/supabase`, ['db', 'query', '--linked', '--output-format', 'json', query], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error(r.stderr.slice(-800) || r.stdout.slice(-800));
    const parsed = JSON.parse(r.stdout.trim());
    return parsed && typeof parsed === 'object' && 'rows' in parsed ? parsed.rows : parsed;
  }
  const r = spawnSync('docker', ['exec', '-i', 'supabase_db_chipurobo-dashboard', 'psql', '-U', 'postgres', '-d', 'postgres', '-qAt', '-v', 'ON_ERROR_STOP=1'], { input: query, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr.split('\n').filter((l) => l.includes('ERROR')).join('\n') || r.stderr);
  const line = r.stdout.trim().split('\n').find((l) => l.startsWith('{') || l.startsWith('['));
  return line ? JSON.parse(line) : r.stdout.trim();
}
const q = (v) => `'${String(v).replaceAll("'", "''")}'`;
const first = (rows) => (Array.isArray(rows) ? rows[0] : rows);

// ---------------------------------------------------------------- schools
const schoolRows = sql(`select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', code)), '[]') as schools from public.schools;`);
const schools = db === 'linked' ? first(schoolRows).schools : schoolRows;
const byCode = new Map(schools.map((s) => [s.code.toLowerCase(), s]));
const byName = new Map(schools.map((s) => [s.name.trim().toLowerCase(), s]));
console.log(`Schools in database: ${schools.length}`);

// ---------------------------------------------------------------- rows
let rows = [];
if (args.synthetic) {
  const total = Number(args.synthetic);
  schools.forEach((school, s) => {
    const share = Math.floor(total / schools.length) + (s < total % schools.length ? 1 : 0);
    for (let n = 1; n <= share; n++) rows.push({ school: school.code, admission_number: '', full_name: '', grade: String(4 + ((s + n) % 9)) });
  });
  console.log(`Generated ${rows.length} synthetic learners across ${schools.length} schools (numbers assigned by the database)`);
} else if (args.count && args.school) {
  for (let n = 0; n < Number(args.count); n++) rows.push({ school: String(args.school), admission_number: '', full_name: '', grade: '' });
  console.log(`${rows.length} new learners at ${args.school}`);
} else if (args.file) {
  const XLSX = require('xlsx');
  const book = XLSX.read(readFileSync(args.file));
  const raw = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' });
  const pick = (r, keys) => { for (const k of Object.keys(r)) if (keys.includes(k.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'))) return String(r[k]).trim(); return ''; };
  rows = raw.map((r) => ({ school: pick(r, ['school', 'school_name', 'school_code', 'code']), admission_number: pick(r, ['admission_number', 'admission', 'adm', 'adm_no', 'admission_no']),
    full_name: pick(r, ['full_name', 'name', 'learner', 'student', 'learner_name']), grade: pick(r, ['grade', 'class', 'form']) }));
  console.log(`Read ${rows.length} rows from ${args.file}`);
} else { console.error('Give --file <xlsx|csv>, --synthetic <count>, or --count <n> --school <code>.'); process.exit(1); }

// ---------------------------------------------------------------- validate
const problems = [];
const seen = new Set();
const perSchool = new Map();
for (const [i, r] of rows.entries()) {
  const line = i + 2;
  const school = byCode.get(r.school.toLowerCase()) ?? byName.get(r.school.toLowerCase());
  if (!school) { problems.push(`row ${line}: school "${r.school}" not found`); continue; }
  r.school_id = school.id; r.code = school.code;
  if (r.admission_number) {
    if (!/^[0-9]{1,4}$/.test(r.admission_number)) problems.push(`row ${line}: admission number "${r.admission_number}" must be 1–4 digits (or empty to assign)`);
    else { r.admission_number = r.admission_number.padStart(4, '0'); const key = `${school.id}|${r.admission_number}`; if (seen.has(key)) problems.push(`row ${line}: duplicate admission number ${r.admission_number} at ${school.name}`); seen.add(key); }
  }
  perSchool.set(school.id, (perSchool.get(school.id) ?? 0) + 1);
}
for (const [id, n] of [...perSchool.entries()].filter(([, n]) => n > 1000)) problems.push(`school ${schools.find((s) => s.id === id).name} has ${n} learners in this file; pages that list a whole roster stop at 1000`);
console.log(`Schools used: ${perSchool.size}. Largest batch: ${Math.max(0, ...perSchool.values())}.`);
if (problems.length) { console.log(`\n${problems.length} problem(s):`); problems.slice(0, 50).forEach((p) => console.log('  ' + p)); if (problems.length > 50) console.log(`  … and ${problems.length - 50} more`); }
if (!apply) { console.log(problems.length ? '\nFix the problems above, then run again with --apply.' : '\nLooks good. Run again with --apply to write.'); process.exit(problems.length ? 1 : 0); }
if (problems.some((p) => !p.includes('stop at 1000'))) { console.error('\nNot applying while there are problems.'); process.exit(1); }

// ---------------------------------------------------------------- apply
const adminRows = sql(`select id from public.profiles where role = 'admin' order by created_at limit 1;`);
const adminId = db === 'linked' ? first(adminRows)?.id : adminRows;
if (!adminId) { console.error('No admin profile found.'); process.exit(1); }
const created = [];
let skipped = 0, failed = 0;
const started = Date.now();
mkdirSync('.context', { recursive: true });
const groups = new Map();
for (const r of rows) { if (!r.school_id) continue; if (!groups.has(r.school_id)) groups.set(r.school_id, []); groups.get(r.school_id).push(r); }
for (const [schoolId, list] of groups) {
  const school = schools.find((s) => s.id === schoolId);
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize).map((r) => ({ admission_number: r.admission_number || null, full_name: r.full_name || null, grade: r.grade || null }));
    const outRows = sql(`begin;
select set_config('request.jwt.claim.sub', ${q(adminId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select public.admin_bulk_create_learners(${q(schoolId)}::uuid, ${q(JSON.stringify(batch))}::jsonb, null) as result;
commit;`);
    let out = db === 'linked' ? first(outRows).result : outRows;
    if (typeof out === 'string') out = JSON.parse(out);
    skipped += out.skipped; failed += out.errors.length;
    for (const e of out.errors) console.log(`  ${school.name} ${e.admission_number ?? ''}: ${e.message}`);
    for (const l of out.logins) created.push([school.name, school.code, l.admission_number, l.login]);
    process.stdout.write(`\r${created.length} created, ${skipped} already had logins, ${failed} failed  (${Math.round((Date.now() - started) / 1000)}s)   `);
  }
}
console.log();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `.context/seed-learners-${stamp}.csv`;
writeFileSync(file, ['school,school_code,admission_number,login', ...created.map((c) => c.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n'));
console.log(`Admission numbers for ${created.length} new learners written to ${file}. Learners sign in with their school and number; there is no password.`);
console.log(`Done in ${Math.round((Date.now() - started) / 1000)}s.`);
