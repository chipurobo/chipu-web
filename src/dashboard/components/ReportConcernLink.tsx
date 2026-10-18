import { Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ReportConcernLink({
  lessonId,
  className = 'btn-secondary',
}: {
  lessonId?: string | null;
  className?: string;
}) {
  const to = lessonId
    ? `/dashboard/report-concern?lessonId=${encodeURIComponent(lessonId)}`
    : '/dashboard/report-concern';

  return (
    <Link to={to} className={className}>
      <Flag className="h-4 w-4" aria-hidden="true" />
      Report a concern
      {lessonId && <span className="sr-only"> about this lesson</span>}
    </Link>
  );
}
