import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Assessment } from '../types';
import { AssessmentRow } from '../components/AssessmentRow';
import { AssessmentModal } from '../components/AssessmentModal';
import { CourseModal } from '../components/CourseModal';
import { ProgressBar } from '../components/ProgressBar';
import { courseAverage, courseProgress } from '../utils/calculations';

interface CoursePageProps {
  courses: Course[];
  assessments: Assessment[];
  onUpdateCourse: (id: string, data: Partial<Omit<Course, 'id' | 'user_id' | 'created_at'>>) => Promise<unknown>;
  onDeleteCourse: (id: string) => Promise<unknown>;
  onCreateAssessment: (data: Omit<Assessment, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
  onUpdateAssessment: (id: string, data: Partial<Omit<Assessment, 'id' | 'user_id' | 'created_at'>>) => Promise<unknown>;
  onDeleteAssessment: (id: string) => Promise<unknown>;
}

type SortKey = 'date' | 'name' | 'weight' | 'grade';

export function CoursePage({
  courses,
  assessments,
  onUpdateCourse,
  onDeleteCourse,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
}: CoursePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessmentModal, setAssessmentModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [courseModal, setCourseModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(true);

  const course = courses.find((c) => c.id === id);
  const courseAssessments = assessments.filter((a) => a.course_id === id);

  if (!course) {
    return <div className="page"><p>Course not found.</p></div>;
  }

  const avg = courseAverage(courseAssessments);
  const progress = courseProgress(courseAssessments);
  const completedWeight = courseAssessments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.weight, 0);
  const totalWeight = courseAssessments.reduce((sum, a) => sum + a.weight, 0);

  const sorted = [...courseAssessments].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'date') cmp = (a.date ?? '').localeCompare(b.date ?? '');
    else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'weight') cmp = a.weight - b.weight;
    else if (sortKey === 'grade') cmp = (a.grade ?? 0) - (b.grade ?? 0);
    return sortAsc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return '';
    return sortAsc ? ' ↑' : ' ↓';
  }

  function handleEditAssessment(a: Assessment) {
    setEditingAssessment(a);
    setAssessmentModal(true);
  }

  function handleAddAssessment() {
    setEditingAssessment(null);
    setAssessmentModal(true);
  }

  async function handleSaveAssessment(data: Omit<Assessment, 'id' | 'user_id' | 'created_at'>) {
    if (editingAssessment) {
      await onUpdateAssessment(editingAssessment.id, data);
    } else {
      await onCreateAssessment(data);
    }
  }

  async function handleDeleteAssessment(assessmentId: string) {
    if (!confirm('Delete this assessment?')) return;
    await onDeleteAssessment(assessmentId);
  }

  async function handleSaveCourse(data: Omit<Course, 'id' | 'user_id' | 'created_at'>) {
    await onUpdateCourse(course!.id, data);
  }

  async function handleDeleteCourse() {
    if (!confirm('Delete this course and all its assessments?')) return;
    await onDeleteCourse(course!.id);
    navigate('/');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="course-header">
          <div className="course-header__accent" style={{ backgroundColor: course.color }} />
          <div>
            <h1 className="page-title">{course.name}</h1>
            <span className="course-header__meta">
              {course.semester} · {course.credits} credits
            </span>
          </div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => setCourseModal(true)} type="button">
            Edit Course
          </button>
          <button className="btn btn--ghost btn--danger" onClick={handleDeleteCourse} type="button">
            Delete Course
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card__label">Average Grade</span>
          <span className={`stat-card__value ${avg !== null && avg < 3 ? 'text-danger' : ''}`}>
            {avg !== null ? avg.toFixed(2) : '—'}
          </span>
        </div>
        <div className="stat-card stat-card--progress">
          <span className="stat-card__label">Progress ({progress.toFixed(0)}%)</span>
          <ProgressBar value={progress} color={course.color} />
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Weight Completed</span>
          <span className="stat-card__value">{completedWeight}% / {totalWeight}%</span>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Assessments</h2>
        <button className="btn btn--primary" onClick={handleAddAssessment} type="button">
          + Add Assessment
        </button>
      </div>

      {courseAssessments.length === 0 ? (
        <p className="empty-state">No assessments yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="assessments-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')} className="th-sortable">Name{sortIndicator('name')}</th>
                <th>Type</th>
                <th onClick={() => toggleSort('weight')} className="th-sortable">Weight{sortIndicator('weight')}</th>
                <th onClick={() => toggleSort('date')} className="th-sortable">Date{sortIndicator('date')}</th>
                <th onClick={() => toggleSort('grade')} className="th-sortable">Grade{sortIndicator('grade')}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <AssessmentRow
                  key={a.id}
                  assessment={a}
                  onEdit={handleEditAssessment}
                  onDelete={handleDeleteAssessment}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assessmentModal && (
        <AssessmentModal
          assessment={editingAssessment}
          courseId={course.id}
          onSave={handleSaveAssessment}
          onClose={() => setAssessmentModal(false)}
        />
      )}

      {courseModal && (
        <CourseModal
          course={course}
          onSave={handleSaveCourse}
          onClose={() => setCourseModal(false)}
        />
      )}
    </div>
  );
}
