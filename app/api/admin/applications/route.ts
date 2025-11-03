import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search by name or email if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to fetch applications', message: error.message },
        { status: 500 }
      );
    }

    // Get AI analyses for each application
    const applicationsWithAnalysis = await Promise.all(
      (data || []).map(async (app) => {
        const { data: analysis } = await supabaseAdmin
          .from('ai_analyses')
          .select('*')
          .eq('application_id', app.id)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...app,
          analysis: analysis || null
        };
      })
    );

    return Response.json(
      { applications: applicationsWithAnalysis },
      { status: 200 }
    );
  } catch (error) {
    console.error('Applications fetch error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

