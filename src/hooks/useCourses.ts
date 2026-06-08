import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';

export function useCourses(session: Session | null) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setCourses(data ?? []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function createCourse(input: Omit<Course, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('courses')
      .insert({ ...input, user_id: session!.user.id })
      .select()
      .single();
    if (error) throw error;
    setCourses((prev) => [...prev, data]);
    return data as Course;
  }

  async function updateCourse(id: string, input: Partial<Omit<Course, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('courses')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setCourses((prev) => prev.map((c) => (c.id === id ? (data as Course) : c)));
    return data as Course;
  }

  async function deleteCourse(id: string) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return { courses, loading, error, createCourse, updateCourse, deleteCourse, refetch: fetch };
}
