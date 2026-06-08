import { Link } from 'react-router-dom';
import type { Course, Assessment } from '../types';
import { courseAverage, courseProgress } from '../utils/calculations';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: Course;
  assessments: Assessment[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export function CourseCard({ course, assessments, onEdit, onDelete }: CourseCardProps) {
  const avg = courseAverage(assessments);
  const progress = courseProgress(assessments);
  const completed = assessments.filter((a) => a.status === 'completed').length;

  return (
    <div className="course-card" style={{ borderLeftColor: course.color }}>
      <div className="course-card__header">
        <Link to={`/course/${course.id}`} className="course-card__name">
          {course.name}
        </Link>
        <div className="course-card__actions">
          <button className="btn btn--ghost btn--sm" onClick={() => onEdit(course)} type="button">
            Edit
          </button>
          <button
            className="btn btn--ghost btn--sm btn--danger"
            onClick={() => onDelete(course.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="course-card__meta">
        <span>{course.semester}</span>
        <span>{course.credits} credits</span>
      </div>
      <ProgressBar value={progress} color={course.color} />
      <div className="course-card__stats">
        <span>{completed}/{assessments.length} done</span>
        <span className={avg !== null && avg < 3 ? 'text-danger' : ''}>
          {avg !== null ? `Avg: ${avg.toFixed(2)}` : 'No grades yet'}
        </span>
      </div>
    </div>
  );
}
