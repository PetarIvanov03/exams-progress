export type AssessmentType = 'exam' | 'test' | 'homework' | 'project' | 'other';
export type AssessmentStatus = 'upcoming' | 'completed' | 'missed';

export interface Course {
  id: string;
  user_id: string;
  name: string;
  semester: string;
  credits: number;
  color: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  type: AssessmentType;
  weight: number;
  date: string | null;
  grade: number | null;
  status: AssessmentStatus;
  notes: string;
  created_at: string;
}
