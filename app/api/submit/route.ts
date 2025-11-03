import { employmentFormSchema } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the form data
    const parsedBody = employmentFormSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Invalid form data', message: parsedBody.error.message },
        { status: 400 }
      );
    }

    // Insert the application into the database
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .insert([
        {
          name: parsedBody.data.name,
          email: parsedBody.data.email,
          phone: parsedBody.data.phone,
          address: parsedBody.data.address,
          pay_range: parsedBody.data.pay_range,
          education_level: parsedBody.data.education_level,
          certificates: parsedBody.data.certificates || null,
          linkedin: parsedBody.data.linkedin || null,
          additional_notes: parsedBody.data.additional_notes || null,
          status: 'new'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to submit application', message: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: 'Application submitted successfully',
        application: data[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submission error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
