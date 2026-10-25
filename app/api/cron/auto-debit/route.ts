// app/api/cron/auto-debit/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Verifikasi cron secret agar endpoint tidak bisa diakses sembarangan
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // 1. Otorisasi Request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Eksekusi fungsi di Supabase menggunakan Admin Client
    const { data, error } = await supabaseAdmin.rpc('execute_due_auto_debits');

    if (error) {
      console.error('Error executing auto debits:', error);
      return NextResponse.json(
        { error: 'Failed to execute auto debits', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Auto debits executed successfully',
      data,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}