import { useState, useEffect } from 'react';
import type { Course } from '../types';

interface CourseModalProps {
  course?: Course | null;
  onSave: (data: Omit<Course, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}

const DEFAULTS = { name: '', semester: '', credits: 6, color: '#6366f1' };

export function CourseModal({ course, onSave, onClose }: CourseModalProps) {
  const [name, setName] = useState(DEFAULTS.name);
  const [semester, setSemester] = useState(DEFAULTS.semester);
  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [color, setColor] = useState(DEFAULTS.color);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setSemester(course.semester);
      setCredits(course.credits);
      setColor(course.color);
    } else {
      setName(DEFAULTS.name);
      setSemester(DEFAULTS.semester);
      setCredits(DEFAULTS.credits);
      setColor(DEFAULTS.color);
    }
  }, [course]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({ name, semester, credits, color });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{course ? 'Edit Course' : 'Add Course'}</h2>
        <form onSubmit={handleSubmit} className="modal__form">
          <label className="form-label">
            Name
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="form-label">
            Semester
            <input
              className="form-input"
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. 2024/2025 S1"
              required
            />
          </label>
          <label className="form-label">
            Credits
            <input
              className="form-input"
              type="number"
              min={1}
              max={30}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              required
            />
          </label>
          <label className="form-label">
            Color
            <input
              className="form-input form-input--color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal__actions">
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
