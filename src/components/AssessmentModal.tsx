import { useState, useEffect } from 'react';
import type { Assessment, AssessmentType, AssessmentStatus } from '../types';

interface AssessmentModalProps {
  assessment?: Assessment | null;
  courseId: string;
  onSave: (data: Omit<Assessment, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}

const DEFAULTS = {
  name: '',
  type: 'exam' as AssessmentType,
  weight: 20,
  date: '',
  grade: '',
  status: 'upcoming' as AssessmentStatus,
  notes: '',
};

export function AssessmentModal({ assessment, courseId, onSave, onClose }: AssessmentModalProps) {
  const [name, setName] = useState(DEFAULTS.name);
  const [type, setType] = useState<AssessmentType>(DEFAULTS.type);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [date, setDate] = useState(DEFAULTS.date);
  const [grade, setGrade] = useState<string>(DEFAULTS.grade);
  const [status, setStatus] = useState<AssessmentStatus>(DEFAULTS.status);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assessment) {
      setName(assessment.name);
      setType(assessment.type);
      setWeight(assessment.weight);
      setDate(assessment.date ?? '');
      setGrade(assessment.grade !== null ? String(assessment.grade) : '');
      setStatus(assessment.status);
      setNotes(assessment.notes);
    } else {
      setName(DEFAULTS.name);
      setType(DEFAULTS.type);
      setWeight(DEFAULTS.weight);
      setDate(DEFAULTS.date);
      setGrade(DEFAULTS.grade);
      setStatus(DEFAULTS.status);
      setNotes(DEFAULTS.notes);
    }
  }, [assessment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const gradeNum = grade === '' ? null : Number(grade);
    if (gradeNum !== null && (gradeNum < 2 || gradeNum > 6)) {
      setError('Grade must be between 2 and 6.');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        course_id: courseId,
        name,
        type,
        weight,
        date: date || null,
        grade: gradeNum,
        status,
        notes,
      });
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
        <h2 className="modal__title">{assessment ? 'Edit Assessment' : 'Add Assessment'}</h2>
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
          <div className="form-row">
            <label className="form-label">
              Type
              <select
                className="form-input"
                value={type}
                onChange={(e) => setType(e.target.value as AssessmentType)}
              >
                <option value="exam">Exam</option>
                <option value="test">Test</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="form-label">
              Status
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssessmentStatus)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              Weight (%)
              <input
                className="form-input"
                type="number"
                min={0}
                max={100}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
              />
            </label>
            <label className="form-label">
              Grade (2–6)
              <input
                className="form-input"
                type="number"
                min={2}
                max={6}
                step={0.01}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
          <label className="form-label">
            Date
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="form-label">
            Notes
            <textarea
              className="form-input form-input--textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
