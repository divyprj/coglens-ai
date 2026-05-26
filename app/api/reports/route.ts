import { NextResponse } from 'next/server';
import { getReports } from '@/lib/supabase/reports';

export async function GET() {
  const reports = await getReports();
  return NextResponse.json(reports);
}
