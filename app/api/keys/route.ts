import { NextResponse } from 'next/server';
import { getAllKeyStatuses } from '@/lib/api-keys';

export async function GET() {
  const statuses = await getAllKeyStatuses();
  return NextResponse.json(statuses);
}
