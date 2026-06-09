import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CertificateIssuance, CertificateTemplate, School, ClubMember } from '../lib/database.types';
import { ArrowLeft, Printer, Award } from 'lucide-react';

// =============================================================
// /dashboard/certificate/:issuanceId
//
// Printable HTML certificate. School lead opens, clicks Print → "Save as
// PDF" in the browser print dialog, hands it to the student offline. RLS
// guarantees only admin / the school's lead / the teacher recipient can
// open this URL — anyone else hits "Certificate not found".
//
// The screen view shows the certificate inside the dashboard chrome with
// a Print button at the top. The @media print stylesheet (in index.css)
// hides everything except the cert itself when printing.
// =============================================================

interface FullIssuance extends CertificateIssuance {
  templates: CertificateTemplate | null;
  schools:   Pick<School, 'id' | 'name' | 'county'> | null;
  student:   Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}

export function Certificate() {
  const { issuanceId } = useParams<{ issuanceId: string }>();
  const [iss, setIss] = useState<FullIssuance | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!issuanceId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('certificate_issuances')
        .select(`
          *,
          templates:template_id ( * ),
          schools:school_id ( id, name, county ),
          student:student_id ( id, full_name, grade )
        `)
        .eq('id', issuanceId)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setErr(error.message); return; }
      if (!data) { setErr('Certificate not found.'); return; }
      const row = data as unknown as FullIssuance;
      setIss(row);

      // Pull teacher name separately if the recipient is a teacher
      // (we can't readily join profiles → auth, so we use the admin
      // leads RPC which is admin-only — fall back to '—' otherwise).
      if (row.teacher_id) {
        const { data: leads } = await supabase.rpc('admin_list_school_leads');
        if (cancelled) return;
        if (leads) {
          const t = (leads as Array<{ user_id: string; full_name: string | null }>)
            .find((l) => l.user_id === row.teacher_id);
          setTeacherName(t?.full_name ?? null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [issuanceId]);

  if (err) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-2xl">
        <BackLink />
        <div className="card p-6 mt-4 text-sm text-red-700 bg-red-50 border-red-200">{err}</div>
      </div>
    );
  }

  if (!iss || !iss.templates) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <BackLink />
        <p className="text-sm text-gray-500 mt-4">Loading…</p>
      </div>
    );
  }

  const recipientName = iss.student?.full_name ?? teacherName ?? '—';
  const hero = iss.templates.hero_color ?? '#0d9488';

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between gap-3 flex-wrap print:hidden">
        <BackLink />
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print / Save as PDF
        </button>
      </div>

      <p className="text-sm text-gray-600 print:hidden">
        Click <strong>Print / Save as PDF</strong> — in the print dialog choose <em>"Save as PDF"</em>
        {' '}as the destination to download an A4 copy. Margins should be <em>"None"</em> for the cleanest layout.
      </p>

      {/* The certificate itself */}
      <article
        id="cert-print-area"
        className="mx-auto bg-white shadow-md print:shadow-none relative"
        style={{
          width:  'min(100%, 794px)',     // ≈ A4 width @ 96dpi
          aspectRatio: '297 / 210',        // A4 landscape
          padding: '4rem 4.5rem',
          border: `2px solid ${hero}`,
        }}
      >
        {/* Decorative top ribbon */}
        <div
          aria-hidden
          className="absolute top-0 left-0 h-2 w-full"
          style={{ background: hero }}
        />
        {/* Corner accents */}
        <div aria-hidden className="absolute top-6 right-6 opacity-70">
          <Award className="h-10 w-10" style={{ color: hero }} strokeWidth={1.2} />
        </div>

        <header className="text-center mb-8">
          <p className="font-pixel text-[0.6rem] tracking-widest uppercase" style={{ color: hero }}>
            ChipuRobo
          </p>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">
            Certificate of {iss.templates.audience === 'teacher' ? 'Recognition' : 'Achievement'}
          </p>
        </header>

        <section className="text-center">
          <p className="text-sm text-gray-600 mb-4">This is to certify that</p>

          <h1
            className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4"
            style={{ borderBottom: `1px dashed ${hero}66`, paddingBottom: '0.5rem', display: 'inline-block' }}
          >
            {recipientName}
          </h1>

          {iss.student?.grade && (
            <p className="text-sm text-gray-600 mb-4">{iss.student.grade}</p>
          )}
          {iss.schools?.name && (
            <p className="text-sm text-gray-600 mb-6">
              {iss.schools.name}
              {iss.schools.county && <> · {iss.schools.county}</>}
            </p>
          )}

          <p className="text-sm text-gray-700 mb-2">has successfully completed</p>

          <h2 className="text-xl sm:text-2xl text-gray-900 my-2">{iss.templates.title}</h2>

          {iss.templates.programme && (
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              {iss.templates.programme}
            </p>
          )}
          {iss.templates.duration_text && (
            <p className="text-sm text-gray-600 mb-2">{iss.templates.duration_text}</p>
          )}
          {iss.templates.criteria_text && (
            <p className="text-sm text-gray-600 max-w-xl mx-auto italic">{iss.templates.criteria_text}</p>
          )}
        </section>

        {/* Footer — date + signature line */}
        <footer className="absolute left-12 right-12 bottom-8 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Issued on</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {new Date(iss.issued_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-1 text-xs uppercase tracking-widest text-gray-500"
                 style={{ minWidth: '180px' }}>
              ChipuRobo
            </div>
            <div className="text-[0.7rem] text-gray-400 mt-0.5">Authorised signatory</div>
          </div>
        </footer>
      </article>

      {iss.notes && (
        <p className="text-sm text-gray-500 max-w-2xl mx-auto print:hidden italic">
          Note: {iss.notes}
        </p>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/dashboard"
      className="inline-flex items-center text-sm text-teal-700 hover:underline"
    >
      <ArrowLeft className="h-4 w-4 mr-1.5" />
      Back to dashboard
    </Link>
  );
}
