import { Construction } from 'lucide-react';

/** Placeholder for nav links whose pages haven't been built yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="px-6 sm:px-10 py-12 max-w-2xl">
      <div className="card p-8 text-center">
        <Construction className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h1 className="mb-2">{title}</h1>
        <p className="text-sm text-gray-600">
          This screen isn't built yet. Use Supabase Studio
          (<a href="http://localhost:54323" target="_blank" rel="noreferrer"
              className="text-teal-700 hover:underline">http://localhost:54323</a>)
          to inspect the data in the meantime.
        </p>
      </div>
    </div>
  );
}
