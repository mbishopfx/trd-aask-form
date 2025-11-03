import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';

    // Fetch all applications
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to fetch applications', message: error.message },
        { status: 500 }
      );
    }

    if (format === 'csv') {
      // Export as CSV
      const fields = [
        'id',
        'name',
        'email',
        'phone',
        'address',
        'education_level',
        'pay_range',
        'certificates',
        'linkedin',
        'additional_notes',
        'status',
        'created_at',
        'updated_at'
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(data || []);

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="applications_${new Date().toISOString()}.csv"`
        }
      });
    } else if (format === 'excel') {
      // Export as Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Applications');

      // Add headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Education Level', key: 'education_level', width: 20 },
        { header: 'Pay Range', key: 'pay_range', width: 15 },
        { header: 'Certificates', key: 'certificates', width: 40 },
        { header: 'LinkedIn', key: 'linkedin', width: 40 },
        { header: 'Additional Notes', key: 'additional_notes', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Updated At', key: 'updated_at', width: 20 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      (data || []).forEach((app) => {
        worksheet.addRow(app);
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="applications_${new Date().toISOString()}.xlsx"`
        }
      });
    } else {
      return Response.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

