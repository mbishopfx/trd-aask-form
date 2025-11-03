import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { performAIAnalysis } from '@/lib/services';
import { JobApplication } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the application
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Perform AI analysis
    const analysis = await performAIAnalysis(application as JobApplication);

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('ai_analyses')
      .insert([
        {
          application_id: id,
          research_summary: analysis.research_summary,
          linkedin_analysis: analysis.linkedin_analysis,
          qualification_category: analysis.qualification_category,
          qualification_reason: analysis.qualification_reason
        }
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
      return Response.json(
        { error: 'Failed to save analysis', message: saveError.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: 'Analysis completed successfully',
        analysis: savedAnalysis
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

