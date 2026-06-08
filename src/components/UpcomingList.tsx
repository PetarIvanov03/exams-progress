import type { Assessment, Course } from '../types';
import { upcomingAssessments } from '../utils/calculations';

interface UpcomingListProps {
  assessments: Assessment[];
  courses: Course[];
}

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exam',
  test: 'Test',
  homework: 'HW',
  project: 'Project',
  other: 'Other',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function UpcomingList({ assessments, courses }: UpcomingListProps) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const upcoming = upcomingAssessments(assessments).slice(0, 5);

  if (upcoming.length === 0) {
    return <p className="empty-state">No upcoming assessments.</p>;
  }

  return (
    <ul className="upcoming-list">
      {upcoming.map((a) => {
        const course = courseMap.get(a.course_id);
        return (
          <li key={a.id} className="upcoming-item" style={{ borderLeftColor: course?.color }}>
            <div className="upcoming-item__main">
              <span className="upcoming-item__name">{a.name}</span>
              <span className="badge badge--type">{TYPE_LABELS[a.type] ?? a.type}</span>
            </div>
            <div className="upcoming-item__sub">
              <span className="upcoming-item__course">{course?.name ?? '—'}</span>
              <span className="upcoming-item__date">{formatDate(a.date!)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
