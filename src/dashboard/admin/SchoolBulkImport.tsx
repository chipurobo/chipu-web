import { useState, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { KENYA_COUNTIES } from '../../lib/counties';
import { parseSheet, parseBoolish, downloadCsv, downloadXlsx, csvCell, type SheetRow } from '../../lib/parseSheet';
import type { SchoolType } from '../../lib/database.types';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle } from 'lucide-react';

// =============================================================
// Bulk school import (admin-only)
//
// Accepts a CSV or XLSX file with one school per row. Each row must
// have at minimum: school_name, full_name (lead teacher). Optional:
// county, type, is_maker_space, phone, contact_email.
//
// Passwords are auto-generated per row — on success we download a CSV
// containing each school's login email + password so the admin can
// share them with the teachers manually.
// =============================================================

const COUNTY_LOOKUP = new Map(KENYA_COUNTIES.map((c) => [c.toLowerCase(), c]));
const SCHOOL_TYPES: SchoolType[] = ['mainstream', 'integrated', 'special'];

interface ParsedRow extends SheetRow {
  __status?: 'pending' | 'ok' | 'error';
  __message?: string;
  __email?: string;
  __password?: string;
}

export function SchoolBulkImport({ onClose, onAllDone }: { onClose: () => void; onAllDone: () => void }) {
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setErr(null); setDone(false);
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    try {
      const parsed = await parseSheet(f);
      if (parsed.length === 0) {
        setErr('No data rows found. Make sure the first row is a header row.');
        setRows(null);
        return;
      }
      setRows(parsed.map((r) => ({ ...r, __status: 'pending' as const })));
    } catch (e: unknown) {
      setErr((e as Error).message ?? 'Failed to parse file.');
      setRows(null);
    }
  };

  const runImport = async () => {
    if (!rows || rows.length === 0) return;
    setRunning(true);
    const updated: ParsedRow[] = [...rows];

    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];

      // Validate + normalise
      const fullName  = (row.full_name ?? row.teacher ?? '').trim();
      const schoolName = (row.school_name ?? row.school ?? row.name ?? '').trim();
      const phone     = (row.phone ?? '').trim();
      const email     = (row.contact_email ?? row.email ?? '').trim();
      const rawCounty = (row.county ?? '').trim();
      const rawType   = (row.type ?? row.school_type ?? 'mainstream').trim().toLowerCase();
      const isMaker   = parseBoolish(row.is_maker_space ?? row.maker_space ?? row.maker);

      if (!schoolName || !fullName) {
        updated[i] = { ...row, __status: 'error', __message: 'Missing school_name or full_name' };
        setRows([...updated]);
        continue;
      }

      const county = rawCounty ? COUNTY_LOOKUP.get(rawCounty.toLowerCase()) ?? null : null;
      if (rawCounty && !county) {
        updated[i] = { ...row, __status: 'error', __message: `Unknown county "${rawCounty}"` };
        setRows([...updated]);
        continue;
      }

      const type: SchoolType = (SCHOOL_TYPES as string[]).includes(rawType)
        ? (rawType as SchoolType)
        : 'mainstream';

      const password = generatePassword();
      const username = deriveUsername(fullName);

      if (username.length < 3) {
        updated[i] = { ...row, __status: 'error', __message: 'Full name too short to derive a username' };
        setRows([...updated]);
        continue;
      }

      const { error } = await supabase.rpc('create_school_with_lead', {
        p_username:       username,
        p_password:       password,
        p_full_name:      fullName,
        p_phone:          phone,
        p_contact_email:  email || null,
        p_school_name:    schoolName,
        p_county:         county,
        p_school_type:    type,
        p_is_maker_space: isMaker,
        p_member_count:   0,
      });

      if (error) {
        updated[i] = { ...row, __status: 'error', __message: error.message };
      } else {
        updated[i] = {
          ...row,
          __status: 'ok',
          __email:  `${username}@chipurobo.local`,
          __password: password,
        };
      }
      setRows([...updated]);
    }

    setRunning(false);
    setDone(true);
    onAllDone();
  };

  const downloadResults = () => {
    if (!rows) return;
    const successful = rows.filter((r) => r.__status === 'ok');
    if (successful.length === 0) return;
    const lines = ['school,full_name,email,password'];
    successful.forEach((r) => {
      lines.push([
        csvCell(r.school_name ?? r.school ?? ''),
        csvCell(r.full_name ?? ''),
        csvCell(r.__email ?? ''),
        csvCell(r.__password ?? ''),
      ].join(','));
    });
    downloadCsv('chipurobo-school-credentials.csv', lines.join('\n'));
  };

  const downloadTemplate = () => {
    downloadXlsx('chipurobo-schools-template.xlsx', [
      ['school_name',                  'county',  'type',       'is_maker_space', 'full_name',    'phone',          'contact_email'],
      ['Kibera Primary',               'Nairobi', 'mainstream', 'no',             'Mary Wanjiku', '+254700000001',  'mary@kiberaprimary.ac.ke'],
      ['Strathmore Maker Lab',         'Nairobi', 'integrated', 'yes',            'Peter Kamau',  '+254700000002',  'peter@strathmore.edu'],
      ['Thika School for the Blind',   'Kiambu',  'special',    'no',             'Jane Achieng', '+254700000003',  ''],
    ], 'Schools');
  };

  const okCount = rows?.filter((r) => r.__status === 'ok').length ?? 0;
  const errCount = rows?.filter((r) => r.__status === 'error').length ?? 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0">Bulk import schools</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start mb-4">
        <p className="text-sm text-gray-600">
          Upload a CSV or Excel file with one school per row. Required columns:{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">school_name</code> and{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">full_name</code>. Optional:{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">county</code>,{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">type</code>,{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">is_maker_space</code>,{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">phone</code>,{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">contact_email</code>. Passwords are
          generated for you.
        </p>
        <button onClick={downloadTemplate} type="button" className="btn-secondary !text-xs whitespace-nowrap">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Template .xlsx
        </button>
      </div>

      <label className="flex items-center gap-3 cursor-pointer card p-4 border-dashed border-2 border-warm-200 hover:bg-warm-50 mb-4">
        <Upload className="h-5 w-5 text-teal-700 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-sm">
            {fileName ? fileName : 'Choose a CSV or .xlsx file'}
          </div>
          <div className="text-xs text-gray-500">First row should be the column headers.</div>
        </div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={onFile}
          disabled={running}
        />
      </label>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          {err}
        </div>
      )}

      {rows && rows.length > 0 && (
        <>
          <div className="card overflow-x-auto max-h-80 overflow-y-auto mb-3">
            <table className="data-table">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th>School</th>
                  <th>Teacher</th>
                  <th>County</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className={r.__status === 'error' ? 'bg-red-50/40' : r.__status === 'ok' ? 'bg-emerald-50/40' : ''}>
                    <td>{r.school_name ?? r.school ?? '—'}</td>
                    <td>{r.full_name ?? '—'}</td>
                    <td className="text-sm">{r.county ?? '—'}</td>
                    <td className="text-sm">{r.type ?? r.school_type ?? 'mainstream'}</td>
                    <td>
                      {r.__status === 'ok' && (
                        <span className="inline-flex items-center text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> created
                        </span>
                      )}
                      {r.__status === 'error' && (
                        <span className="inline-flex items-center text-xs text-red-700" title={r.__message}>
                          <AlertCircle className="h-3.5 w-3.5 mr-1" /> {r.__message?.slice(0, 50)}
                        </span>
                      )}
                      {r.__status === 'pending' && (
                        <span className="text-xs text-gray-400">pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-warm-200 flex-wrap">
            <div className="text-sm text-gray-600">
              {rows.length} row(s)
              {done && (
                <>
                  {' · '}
                  <span className="text-emerald-700">{okCount} created</span>
                  {errCount > 0 && <> · <span className="text-red-700">{errCount} failed</span></>}
                </>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {done && okCount > 0 && (
                <button onClick={downloadResults} className="btn-secondary">
                  <Download className="h-4 w-4 mr-1.5" />
                  Download credentials CSV
                </button>
              )}
              <button
                onClick={runImport}
                className="btn-primary"
                disabled={running || done}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                {running ? 'Importing…' : done ? 'Done' : `Import ${rows.length} school(s)`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function generatePassword(): string {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  const len = 6;
  const pick = () => Array.from({ length: len }, () => a[Math.floor(Math.random() * a.length)]).join('');
  return `${pick()}-${pick()}`;
}

function deriveUsername(fullName: string): string {
  return fullName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .replace(/\.+/g, '.')
    .slice(0, 32);
}
