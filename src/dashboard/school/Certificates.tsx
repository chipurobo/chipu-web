import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type {
  CertificateIssuance, CertificateTemplate, ClubMember,
} from '../../lib/database.types';
import { Award, GraduationCap, UserCog, Printer } from 'lucide-react';

// =============================================================
// /dashboard/school/certificates
//
// School lead's list of every certificate ever issued to their school.
// Each row links to /dashboard/certificate/:id which renders the
// printable artwork; lead clicks Print and hands it to the student.
// =============================================================

interface CertRow extends CertificateIssuance {
  templates: Pick<CertificateTemplate, 'id' | 'title' | 'audience' | 'programme' | 'hero_color'> | null;
  student:   Pick<ClubMember, 'id' | 'full_name'> | null;
}

export function SchoolCertificates() {
  const { school } = useAuth();
  const [rows, setRows] = useState<CertRow[] | null>(null);
  const [err, setErr]   = useState<string | null>(null);

  useEffect(() => {
    if (!school) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('certificate_issuances')
        .select(`
          *,
          templates:template_id ( id, title, audience, programme, hero_color ),
          student:student_id ( id, full_name )
        `)
        .eq('school_id', school.id)
        .is('revoked_at', null)
        .order('issued_at', { ascending: false });
      if (cancelled) return;
      if (error) setErr(error.message);
      else setRows(data as unknown as CertRow[]);
    })();
    return () => { cancelled = true; };
  }, [school?.id]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          {school?.name ?? 'Your school'}
        </p>
        <h1>Certificates</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Every certificate ChipuRobo has issued to a student or teacher at your school. Click a
          row to open the printable copy — use your browser's "Save as PDF" to keep a digital
          version for the student.
        </p>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Certificate</th>
              <th>Recipient</th>
              <th>Issued</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {!rows && (
              <tr><td colSpan={4} className="text-center text-gray-500 py-8">Loading…</td></tr>
            )}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-12">
                  <Award className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                  No certificates issued yet.
                </td>
              </tr>
            )}
            {rows?.map((r) => {
              const isStudent = r.templates?.audience === 'student';
              return (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-start gap-2">
                      <span
                        className="inline-block w-1 h-8 rounded-full flex-shrink-0"
                        style={{ background: r.templates?.hero_color ?? '#0d9488' }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{r.templates?.title ?? '—'}</div>
                        {r.templates?.programme && (
                          <div className="text-xs text-gray-500">{r.templates.programme}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="inline-flex items-center gap-1.5">
                      {isStudent
                        ? <GraduationCap className="h-3.5 w-3.5 text-teal-700" />
                        : <UserCog className="h-3.5 w-3.5 text-amber-700" />}
                      <span className="text-sm text-gray-900">
                        {r.student?.full_name ?? 'Teacher'}
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-500">
                    {new Date(r.issued_at).toLocaleDateString()}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Link
                      to={`/dashboard/certificate/${r.id}`}
                      className="inline-flex items-center text-xs text-teal-700 hover:underline"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" />
                      Open & print
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
