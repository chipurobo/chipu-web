import { useState, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { parseSheet, parseBoolish, downloadXlsx, type SheetRow } from '../../lib/parseSheet';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ParsedRow extends SheetRow {
  __status?: 'pending' | 'ok' | 'error';
  __message?: string;
}

/**
 * Bulk import students into club_members.
 *
 * The school lead drops a CSV/XLSX with at minimum a full_name column;
 * grade and in_club are optional (defaults: empty, true).
 */
export function StudentBulkImport({
  schoolId, onClose, onAllDone,
}: {
  schoolId: string;
  onClose: () => void;
  onAllDone: () => void;
}) {
  const [rows,    setRows]    = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [err,     setErr]     = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done,    setDone]    = useState(false);

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

    // Insert one at a time so per-row errors surface clearly.
    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      const fullName = (row.full_name ?? row.name ?? '').trim();
      if (!fullName) {
        updated[i] = { ...row, __status: 'error', __message: 'Missing full_name' };
        setRows([...updated]);
        continue;
      }
      const grade = (row.grade ?? row.class ?? '').trim() || null;
      // Default to "in the code club" if the column is absent (admin's common case).
      const inClub = row.in_club === undefined ? true : parseBoolish(row.in_club);

      const { error } = await supabase.from('club_members').insert({
        school_id: schoolId,
        full_name: fullName,
        grade,
        in_club:   inClub,
      });

      updated[i] = error
        ? { ...row, __status: 'error', __message: error.message }
        : { ...row, __status: 'ok' };
      setRows([...updated]);
    }

    setRunning(false);
    setDone(true);
    onAllDone();
  };

  const downloadTemplate = () => {
    downloadXlsx('chipurobo-students-template.xlsx', [
      ['full_name',    'grade',   'in_club'],
      ['Mary Wanjiku', 'Grade 7', 'yes'],
      ['Peter Kamau',  'Grade 6', 'yes'],
      ['Jane Achieng', 'Grade 8', 'no'],
    ], 'Students');
  };

  const okCount  = rows?.filter((r) => r.__status === 'ok').length ?? 0;
  const errCount = rows?.filter((r) => r.__status === 'error').length ?? 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0">Bulk import students</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start mb-4">
        <p className="text-sm text-gray-600">
          Upload a CSV or Excel file with one student per row. Required column:{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">full_name</code>. Optional:{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">grade</code>,{' '}
          <code className="text-xs bg-warm-100 px-1 rounded">in_club</code> (yes/no — defaults to yes).
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
                  <th>Name</th>
                  <th>Grade</th>
                  <th>In club</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className={r.__status === 'error' ? 'bg-red-50/40' : r.__status === 'ok' ? 'bg-emerald-50/40' : ''}>
                    <td>{r.full_name ?? r.name ?? '—'}</td>
                    <td className="text-sm">{r.grade ?? r.class ?? '—'}</td>
                    <td className="text-sm">
                      {r.in_club === undefined ? 'yes' : (parseBoolish(r.in_club) ? 'yes' : 'no')}
                    </td>
                    <td>
                      {r.__status === 'ok' && (
                        <span className="inline-flex items-center text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> added
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

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-warm-200">
            <div className="text-sm text-gray-600">
              {rows.length} row(s)
              {done && (
                <>
                  {' · '}
                  <span className="text-emerald-700">{okCount} added</span>
                  {errCount > 0 && <> · <span className="text-red-700">{errCount} failed</span></>}
                </>
              )}
            </div>
            <button
              onClick={runImport}
              className="btn-primary"
              disabled={running || done}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              {running ? 'Importing…' : done ? 'Done' : `Import ${rows.length} student(s)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
