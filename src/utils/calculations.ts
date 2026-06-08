import type { Assessment, Course } from '../types';

export function courseAverage(assessments: Assessment[]): number | null {
  const completed = assessments.filter(
    (a) => a.status === 'completed' && a.grade !== null
  );
  if (completed.length === 0) return null;
  const totalWeight = completed.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return null;
  const weighted = completed.reduce((sum, a) => sum + a.grade! * a.weight, 0);
  return weighted / totalWeight;
}

export function courseProgress(assessments: Assessment[]): number {
  if (assessments.length === 0) return 0;
  const completed = assessments.filter((a) => a.status === 'completed').length;
  return (completed / assessments.length) * 100;
}

export function overallAverage(
  courses: Course[],
  assessmentMap: Map<string, Assessment[]>
): number | null {
  let totalCredits = 0;
  let weightedSum = 0;
  for (const course of courses) {
    const avg = courseAverage(assessmentMap.get(course.id) ?? []);
    if (avg !== null) {
      weightedSum += avg * course.credits;
      totalCredits += course.credits;
    }
  }
  if (totalCredits === 0) return null;
  return weightedSum / totalCredits;
}

export function upcomingAssessments(assessments: Assessment[]): Assessment[] {
  return assessments
    .filter((a) => a.status === 'upcoming' && a.date !== null)
    .sort((a, b) => a.date!.localeCompare(b.date!));
}
