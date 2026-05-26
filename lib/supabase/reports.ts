/**
 * CogLens — Report Persistence (Supabase, optional)
 *
 * All functions gracefully no-op if Supabase is not configured.
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';
import type { VerificationResult } from '@/lib/types';

export async function saveReport(
  result: VerificationResult
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        file_name: result.document.fileName,
        trust_score: result.trustScore,
        claims: result.claims,
        summary: result.summary,
        processing_time: result.processingTime,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase save error:', error.message);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Failed to save report:', err);
    return null;
  }
}

export async function getReports(): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase fetch error:', error.message);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

export async function getReport(
  id: string
): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
