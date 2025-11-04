import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Generate unique filename
    const filename = `qr-${Date.now()}.png`;
    const filepath = `employment-forms/${filename}`;

    // Upload to Supabase storage bucket 'aask'
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('aask')
      .upload(filepath, qrCodeBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return Response.json(
        { error: 'Failed to upload QR code', message: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('aask')
      .getPublicUrl(filepath);

    const publicUrl = publicUrlData.publicUrl;

    // Save metadata to database
    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .insert([
        {
          title: 'AASK Employment Application Form',
          url,
          qr_code_url: publicUrl,
          qr_code_data: publicUrl, // Store URL here too for backward compatibility
          page_type: 'employment_form'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to save QR code metadata', message: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: 'QR code generated successfully',
        qr_code: {
          ...data,
          public_url: publicUrl
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('QR generation error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the most recent QR code
    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to fetch QR code', message: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        qr_code: data || null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('QR fetch error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

