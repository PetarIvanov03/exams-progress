import type { Assessment } from '../types';

interface AssessmentRowProps {
  assessment: Assessment;
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  missed: 'Missed',
};

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exam',
  test: 'Test',
  homework: 'HW',
  project: 'Project',
  other: 'Other',
};

export function AssessmentRow({ assessment, onEdit, onDelete }: AssessmentRowProps) {
  const { name, type, weight, date, grade, status } = assessment;

  return (
    <tr className={`assessment-row assessment-row--${status}`}>
      <td>{name}</td>
      <td><span className="badge badge--type">{TYPE_LABELS[type] ?? type}</span></td>
      <td>{weight}%</td>
      <td>{formatDate(date)}</td>
      <td className={grade !== null && grade < 3 ? 'text-danger' : ''}>
        {grade !== null ? grade.toFixed(2) : '—'}
      </td>
      <td>
        <span className={`badge badge--status badge--${status}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </td>
      <td className="assessment-row__actions">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onEdit(assessment)}
          type="button"
        >
          Edit
        </button>
        <button
          className="btn btn--ghost btn--sm btn--danger"
          onClick={() => onDelete(assessment.id)}
          type="button"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
