import { LEVEL_CHOICE_LABEL, type LevelChoice } from './levels';

// Primary / secondary filter. The library runs to well over a hundred lessons,
// so a teacher needs to cut it down to the learners in front of them.
export function LevelFilter({
  value, onChange, counts,
}: {
  value: LevelChoice;
  onChange: (v: LevelChoice) => void;
  counts?: Partial<Record<LevelChoice, number>>;
}) {
  const options: LevelChoice[] = ['all', 'primary', 'secondary'];
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by delivery track">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          className={value === o ? 'badge-teal' : 'badge-gray'}
          onClick={() => onChange(o)}
        >
          {LEVEL_CHOICE_LABEL[o]}{counts?.[o] !== undefined ? ` (${counts[o]})` : ''}
        </button>
      ))}
    </div>
  );
}
