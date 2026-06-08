import { describe, it, expect } from 'vitest';
import {
  courseAverage,
  courseProgress,
  overallAverage,
  upcomingAssessments,
} from './calculations';
import type { Assessment, Course } from '../types';

const base: Omit<Assessment, 'id' | 'grade' | 'status' | 'date'> = {
  user_id: 'u1',
  course_id: 'c1',
  name: 'Test',
  type: 'exam',
  weight: 50,
  notes: '',
  created_at: '2024-01-01',
};

function makeAssessment(overrides: Partial<Assessment>): Assessment {
  return {
    ...base,
    id: 'a1',
    grade: null,
    status: 'upcoming',
    date: null,
    ...overrides,
  };
}

describe('courseAverage', () => {
  it('returns null when no assessments', () => {
    expect(courseAverage([])).toBeNull();
  });

  it('returns null when no completed assessments', () => {
    expect(courseAverage([makeAssessment({ status: 'upcoming' })])).toBeNull();
  });

  it('returns null when completed but grade is null', () => {
    expect(
      courseAverage([makeAssessment({ status: 'completed', grade: null })])
    ).toBeNull();
  });

  it('computes weighted average', () => {
    const a = makeAssessment({ id: 'a1', status: 'completed', grade: 6, weight: 60 });
    const b = makeAssessment({ id: 'a2', status: 'completed', grade: 4, weight: 40 });
    // (6*60 + 4*40) / (60+40) = (360+160)/100 = 5.2
    expect(courseAverage([a, b])).toBeCloseTo(5.2);
  });

  it('ignores non-completed assessments', () => {
    const a = makeAssessment({ id: 'a1', status: 'completed', grade: 5, weight: 100 });
    const b = makeAssessment({ id: 'a2', status: 'upcoming', grade: 2, weight: 100 });
    expect(courseAverage([a, b])).toBeCloseTo(5);
  });
});

describe('courseProgress', () => {
  it('returns 0 for empty', () => {
    expect(courseProgress([])).toBe(0);
  });

  it('returns 0 when none completed', () => {
    expect(courseProgress([makeAssessment({ status: 'upcoming' })])).toBe(0);
  });

  it('returns 100 when all completed', () => {
    const a = makeAssessment({ id: 'a1', status: 'completed' });
    const b = makeAssessment({ id: 'a2', status: 'completed' });
    expect(courseProgress([a, b])).toBe(100);
  });

  it('returns 50 for half completed', () => {
    const a = makeAssessment({ id: 'a1', status: 'completed' });
    const b = makeAssessment({ id: 'a2', status: 'upcoming' });
    expect(courseProgress([a, b])).toBe(50);
  });
});

describe('overallAverage', () => {
  const courses: Course[] = [
    { id: 'c1', user_id: 'u1', name: 'Math', semester: '1', credits: 6, color: '#000', created_at: '' },
    { id: 'c2', user_id: 'u1', name: 'CS', semester: '1', credits: 4, color: '#000', created_at: '' },
  ];

  it('returns null when no averages available', () => {
    expect(overallAverage(courses, new Map())).toBeNull();
  });

  it('computes credit-weighted average', () => {
    const map = new Map<string, Assessment[]>([
      ['c1', [makeAssessment({ course_id: 'c1', status: 'completed', grade: 6, weight: 100 })]],
      ['c2', [makeAssessment({ course_id: 'c2', status: 'completed', grade: 4, weight: 100 })]],
    ]);
    // (6*6 + 4*4) / (6+4) = (36+16)/10 = 5.2
    expect(overallAverage(courses, map)).toBeCloseTo(5.2);
  });
});

describe('upcomingAssessments', () => {
  it('returns empty for no upcoming', () => {
    expect(upcomingAssessments([makeAssessment({ status: 'completed' })])).toHaveLength(0);
  });

  it('excludes assessments without date', () => {
    expect(upcomingAssessments([makeAssessment({ status: 'upcoming', date: null })])).toHaveLength(0);
  });

  it('sorts by date ascending', () => {
    const a = makeAssessment({ id: 'a1', status: 'upcoming', date: '2024-03-01' });
    const b = makeAssessment({ id: 'a2', status: 'upcoming', date: '2024-01-01' });
    const result = upcomingAssessments([a, b]);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-03-01');
  });
});
