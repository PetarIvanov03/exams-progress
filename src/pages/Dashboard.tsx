import { useState } from 'react';
import type { Course, Assessment } from '../types';
import { CourseCard } from '../components/CourseCard';
import { CourseModal } from '../components/CourseModal';
import { UpcomingList } from '../components/UpcomingList';
import { overallAverage, courseProgress } from '../utils/calculations';

interface DashboardProps {
  courses: Course[];
  assessments: Assessment[];
  onCreateCourse: (data: Omit<Course, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
  onUpdateCourse: (id: string, data: Partial<Omit<Course, 'id' | 'user_id' | 'created_at'>>) => Promise<unknown>;
  onDeleteCourse: (id: string) => Promise<unknown>;
}

function getThisWeekUpcoming(assessments: Assessment[]): number {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  return assessments.filter((a) => {
    if (a.status !== 'upcoming' || !a.date) return false;
    const d = new Date(a.date);
    return d >= now && d <= weekEnd;
  }).length;
}

export function Dashboard({
  courses,
  assessments,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
}: DashboardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const assessmentMap = new Map<string, Assessment[]>();
  for (const course of courses) {
    assessmentMap.set(
      course.id,
      assessments.filter((a) => a.course_id === course.id)
    );
  }

  const avg = overallAverage(courses, assessmentMap);
  const completedCount = assessments.filter((a) => a.status === 'completed').length;
  const upcomingThisWeek = getThisWeekUpcoming(assessments);

  const allProgress = courses.reduce((sum, c) => {
    return sum + courseProgress(assessmentMap.get(c.id) ?? []);
  }, 0);
  const avgProgress = courses.length > 0 ? allProgress / courses.length : 0;

  function handleEdit(course: Course) {
    setEditingCourse(course);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingCourse(null);
    setModalOpen(true);
  }

  async function handleSave(data: Omit<Course, 'id' | 'user_id' | 'created_at'>) {
    if (editingCourse) {
      await onUpdateCourse(editingCourse.id, data);
    } else {
      await onCreateCourse(data);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this course and all its assessments?')) return;
    await onDeleteCourse(id);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn--primary" onClick={handleAdd} type="button">
          + Add Course
        </button>
      </div>

      <div className="metric-cards">
        <div className="metric-card">
          <span className="metric-card__label">Overall Average</span>
          <span className={`metric-card__value ${avg !== null && avg < 3 ? 'text-danger' : ''}`}>
            {avg !== null ? avg.toFixed(2) : '—'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Completed Assessments</span>
          <span className="metric-card__value">{completedCount} / {assessments.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Upcoming This Week</span>
          <span className="metric-card__value">{upcomingThisWeek}</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Avg Progress</span>
          <span className="metric-card__value">{avgProgress.toFixed(0)}%</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="courses-section">
          <h2 className="section-title">Courses</h2>
          {courses.length === 0 ? (
            <p className="empty-state">No courses yet. Add one to get started.</p>
          ) : (
            <div className="course-cards-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  assessments={assessmentMap.get(course.id) ?? []}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section className="upcoming-section">
          <h2 className="section-title">Upcoming</h2>
          <UpcomingList assessments={assessments} courses={courses} />
        </section>
      </div>

      {modalOpen && (
        <CourseModal
          course={editingCourse}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
