import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Assessment } from '../types';

export function useAssessments(session: Session | null) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('date', { ascending: true, nullsFirst: false });
    if (error) setError(error.message);
    else setAssessments(data ?? []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function createAssessment(input: Omit<Assessment, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('assessments')
      .insert({ ...input, user_id: session!.user.id })
      .select()
      .single();
    if (error) throw error;
    setAssessments((prev) => [...prev, data as Assessment]);
    return data as Assessment;
  }

  async function updateAssessment(id: string, input: Partial<Omit<Assessment, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('assessments')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setAssessments((prev) => prev.map((a) => (a.id === id ? (data as Assessment) : a)));
    return data as Assessment;
  }

  async function deleteAssessment(id: string) {
    const { error } = await supabase.from('assessments').delete().eq('id', id);
    if (error) throw error;
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  }

  return {
    assessments,
    loading,
    error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    refetch: fetch,
  };
}
