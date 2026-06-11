import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CertificateIssuance, CertificateTemplate, School, ClubMember } from '../lib/database.types';
import { ArrowLeft, Printer, Award } from 'lucide-react';
import { SkeletonBlock } from './components/Skeletons';

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

  const issuanceQuery = useQuery({
    queryKey: ['issuance', issuanceId],
    queryFn: async (): Promise<FullIssuance> => {
      const { data, error } = await supabase
        .from('certificate_issuances')
        .select(`
          *,
          templates:template_id ( * ),
          schools:school_id ( id, name, county ),
          student:student_id ( id, full_name, grade )
        `)
        .eq('id', issuanceId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Certificate not found.');
      return data as unknown as FullIssuance;
    },
    enabled: !!issuanceId,
  });
  const iss = issuanceQuery.data ?? null;

  // Pull teacher name separately if the recipient is a teacher (admin-only RPC;
  // school leads see null and the cert falls back to '—' / 'Teacher').
  const teacherQuery = useQuery({
    queryKey: ['school-leads'],
    queryFn: async (): Promise<Array<{ user_id: string; full_name: string | null }>> => {
      const { data, error } = await supabase.rpc('admin_list_school_leads');
      if (error) throw new Error(error.message);
      return data as Array<{ user_id: string; full_name: string | null }>;
    },
    enabled: !!iss?.teacher_id,
  });
  const teacherName = (iss?.teacher_id && teacherQuery.data)
    ? (teacherQuery.data.find((l) => l.user_id === iss.teacher_id)?.full_name ?? null)
    : null;

  const err = issuanceQuery.error?.message ?? null;

  if (err) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-2xl">
        <BackLink />
        <div role="alert" className="card p-6 mt-4 text-sm text-red-700 bg-red-50 border-red-200">{err}</div>
      </div>
    );
  }

  if (!iss || !iss.templates) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <BackLink />
        <div className="flex items-center justify-center mt-6">
          <SkeletonBlock label="Loading certificate" width="100%" height="60vh" />
        </div>
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
          <Printer className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Print / Save as PDF
        </button>
      </div>

      <p className="text-sm text-gray-600 print:hidden">
        Click <strong>Print / Save as PDF</strong> — in the print dialog choose <em>"Save as PDF"</em>
        {' '}as the destination to download an A4 copy. Margins should be <em>"None"</em> for the cleanest layout.
      </p>

      {/* The certificate itself.
          Padding and font sizes scale down on phones via clamp() so the
          cert remains legible even on a 360px screen, then expands cleanly
          when printed on A4. */}
      <article
        id="cert-print-area"
        className="mx-auto bg-white shadow-md print:shadow-none relative overflow-hidden"
        style={{
          width:  'min(100%, 1123px)',                // ≈ A4 landscape width @ 96dpi
          aspectRatio: '297 / 210',                    // A4 landscape
          padding: 'clamp(1.25rem, 4vw, 3.25rem) clamp(1.5rem, 5vw, 4rem)',
          // Outer ornamental double-frame
          outline: `1px solid ${hero}`,
          outlineOffset: 'clamp(-14px, -1.2vw, -8px)',
          border: `clamp(4px, 0.7vw, 8px) solid ${hero}`,
          background: `
            radial-gradient(circle at top right, ${hero}0d, transparent 40%),
            radial-gradient(circle at bottom left, ${hero}0d, transparent 40%),
            #fffdf8
          `,
        }}
      >
        {/* Corner ornaments — small SVG flourishes in each corner */}
        <CornerOrnament position="tl" color={hero} />
        <CornerOrnament position="tr" color={hero} />
        <CornerOrnament position="bl" color={hero} />
        <CornerOrnament position="br" color={hero} />

        {/* Top medallion */}
        <div className="text-center relative" style={{ marginBottom: '1.5rem' }}>
          <div
            className="inline-flex items-center justify-center rounded-full shadow-sm mb-4"
            style={{
              width: 64, height: 64,
              background: `linear-gradient(135deg, ${hero} 0%, ${hero}cc 100%)`,
              border: `3px solid #fff`,
              boxShadow: `0 0 0 2px ${hero}`,
            }}
          >
            <Award className="h-8 w-8 text-white" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <p
            className="font-pixel text-[0.7rem] tracking-[0.4em] uppercase"
            style={{ color: hero }}
          >
            ChipuRobo
          </p>
          <p
            className="font-serif text-xl mt-2"
            style={{ color: '#1f2937', letterSpacing: '0.08em' }}
          >
            Certificate of {iss.templates.audience === 'teacher' ? 'Recognition' : 'Achievement'}
          </p>
          <div
            className="mx-auto mt-3"
            style={{
              width: 80, height: 2,
              background: `linear-gradient(90deg, transparent, ${hero}, transparent)`,
            }}
          />
        </div>

        <section className="text-center" style={{ paddingTop: '0.5rem' }}>
          <p className="text-sm text-gray-500 italic mb-3">This is to certify that</p>

          <h1
            className="font-serif text-gray-900"
            style={{
              fontSize: '3.5rem',
              lineHeight: 1.1,
              letterSpacing: '0.01em',
              marginBottom: '0.75rem',
            }}
          >
            {recipientName}
          </h1>

          <div
            className="mx-auto"
            style={{
              width: 240, height: 1,
              background: `linear-gradient(90deg, transparent, ${hero}88, transparent)`,
              marginBottom: '1.25rem',
            }}
          />

          {(iss.student?.grade || iss.schools?.name) && (
            <p className="text-sm text-gray-600 mb-5">
              {iss.student?.grade && <span>{iss.student.grade}</span>}
              {iss.student?.grade && iss.schools?.name && <span> · </span>}
              {iss.schools?.name}
              {iss.schools?.county && <span> · {iss.schools.county}</span>}
            </p>
          )}

          <p className="text-sm text-gray-700 mb-2">has successfully completed</p>

          <h2
            className="font-serif text-gray-900"
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              margin: '0.5rem 0',
            }}
          >
            {iss.templates.title}
          </h2>

          {iss.templates.programme && (
            <p
              className="text-[0.7rem] uppercase tracking-[0.3em] mb-3"
              style={{ color: hero }}
            >
              {iss.templates.programme}
            </p>
          )}

          {(iss.templates.duration_text || iss.templates.criteria_text) && (
            <div className="max-w-xl mx-auto">
              {iss.templates.duration_text && (
                <p className="text-sm text-gray-600 mb-2">{iss.templates.duration_text}</p>
              )}
              {iss.templates.criteria_text && (
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  {iss.templates.criteria_text}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Footer — date + signature line + decorative seal */}
        <footer
          className="absolute left-16 right-16 flex items-end justify-between gap-6"
          style={{ bottom: '3.25rem' }}
        >
          <div>
            <div
              className="text-[0.65rem] uppercase tracking-[0.25em]"
              style={{ color: hero }}
            >
              Issued on
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1 font-serif">
              {new Date(iss.issued_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>

          {/* Decorative seal */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72, height: 72,
              border: `2px dashed ${hero}80`,
              opacity: 0.85,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56, height: 56,
                background: `${hero}15`,
                border: `1px solid ${hero}`,
              }}
            >
              <span
                className="font-pixel text-[0.55rem] tracking-widest"
                style={{ color: hero }}
              >
                CR
              </span>
            </div>
          </div>

          <div className="text-right">
            <div
              className="pt-1 text-[0.65rem] uppercase tracking-[0.25em]"
              style={{
                minWidth: 220,
                borderTop: `1px solid ${hero}80`,
                color: hero,
              }}
            >
              ChipuRobo
            </div>
            <div className="text-[0.65rem] text-gray-500 mt-0.5 italic">
              Authorised signatory
            </div>
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
      <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
      Back to dashboard
    </Link>
  );
}

// Decorative SVG flourish for each corner of the certificate.
// Position styling places it in the right corner; the SVG renders
// the same artwork rotated based on position.
function CornerOrnament({
  position, color,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}) {
  const pos: React.CSSProperties = {
    position: 'absolute',
    width: 70, height: 70,
    pointerEvents: 'none',
  };
  if (position === 'tl') { pos.top = 14;    pos.left = 14;  }
  if (position === 'tr') { pos.top = 14;    pos.right = 14; pos.transform = 'scaleX(-1)'; }
  if (position === 'bl') { pos.bottom = 14; pos.left = 14;  pos.transform = 'scaleY(-1)'; }
  if (position === 'br') { pos.bottom = 14; pos.right = 14; pos.transform = 'scale(-1, -1)'; }

  return (
    <svg style={pos} viewBox="0 0 64 64" aria-hidden="true">
      {/* L-shaped corner frame with arc + dots */}
      <path
        d="M4 4 L4 30 M4 4 L30 4"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
      <path
        d="M8 8 L8 22 M8 8 L22 8"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
        opacity={0.6}
      />
      <circle cx={4} cy={4} r={2.5} fill={color} />
      <circle cx={30} cy={4} r={1.5} fill={color} opacity={0.7} />
      <circle cx={4} cy={30} r={1.5} fill={color} opacity={0.7} />
      <path
        d="M16 4 Q 16 16 4 16"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
        opacity={0.5}
      />
    </svg>
  );
}
