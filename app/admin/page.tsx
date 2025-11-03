'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { JobApplication, AIAnalysis } from '@/lib/types';

interface ApplicationWithAnalysis extends JobApplication {
  analysis: AIAnalysis | null;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [applications, setApplications] = useState<ApplicationWithAnalysis[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithAnalysis | null>(
    null
  );
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Check authentication from session storage
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword === 'TRDAASK') {
      setIsAuthenticated(true);
      fetchApplications();
      fetchQRCode();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TRDAASK') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminPassword', password);
      fetchApplications();
      fetchQRCode();
    } else {
      toast.error('Invalid password');
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/applications', {
        headers: {
          Authorization: `Bearer TRDAASK`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await fetch('/api/admin/qr', {
        headers: {
          Authorization: `Bearer TRDAASK`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.qr_code) {
          setQrCode(data.qr_code.qr_code_data);
        }
      }
    } catch (error) {
      console.error('QR fetch error:', error);
    }
  };

  const generateQRCode = async () => {
    const url = window.location.origin;
    setLoading(true);

    try {
      const response = await fetch('/api/admin/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer TRDAASK`
        },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr_code.qr_code_data);
        toast.success('QR code generated successfully');
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const analyzeApplication = async (id: string) => {
    setAnalyzing(id);

    try {
      const response = await fetch(`/api/admin/analyze/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer TRDAASK`
        }
      });

      if (response.ok) {
        toast.success('Analysis completed successfully');
        await fetchApplications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze application');
    } finally {
      setAnalyzing(null);
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/export?format=${format}`, {
        headers: {
          Authorization: `Bearer TRDAASK`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString()}.${
          format === 'excel' ? 'xlsx' : 'csv'
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `aask-employment-qr-${new Date().toISOString()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR code downloaded');
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AASK Physical Therapy Logo"
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="mb-6 text-center text-2xl font-bold">
            AASK Rehab & Physical Therapy
          </h1>
          <h2 className="mb-4 text-center text-lg text-gray-600">
            Admin Panel Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AASK Physical Therapy Logo"
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold">AASK Rehab & Physical Therapy</h1>
              <p className="text-gray-600">Employment Applications Admin Panel</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('adminPassword');
            }}
          >
            Logout
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex flex-wrap gap-3">
            <Button onClick={() => exportData('csv')} disabled={loading}>
              Export CSV
            </Button>
            <Button onClick={() => exportData('excel')} disabled={loading}>
              Export Excel
            </Button>
            <Button onClick={generateQRCode} disabled={loading}>
              Generate QR Code
            </Button>
            <Button onClick={fetchApplications} variant="outline">
              Refresh
            </Button>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* QR Code Display */}
        {qrCode && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-semibold">QR Code</h2>
            <div className="flex items-start gap-4">
              <img
                src={qrCode}
                alt="Application Form QR Code"
                className="h-48 w-48 rounded border"
              />
              <div className="flex-1">
                <p className="mb-2 text-sm text-gray-600">
                  Scan this QR code to access the employment application form.
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  URL: {window.location.origin}
                </p>
                <Button onClick={downloadQRCode} size="sm">
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-4">
            <h2 className="text-xl font-semibold">
              Applications ({filteredApplications.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Education
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Pay Range
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-4 py-3 text-sm">{app.name}</td>
                      <td className="px-4 py-3 text-sm">{app.email}</td>
                      <td className="px-4 py-3 text-sm">{app.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        {app.education_level}
                      </td>
                      <td className="px-4 py-3 text-sm">{app.pay_range}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            app.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          {app.analysis ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                            >
                              View Analysis
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeApplication(app.id);
                              }}
                              disabled={analyzing === app.id}
                            >
                              {analyzing === app.id
                                ? 'Analyzing...'
                                : 'Analyze'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Detail Modal */}
        {selectedApp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setSelectedApp(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="mb-2 font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>{' '}
                      {selectedApp.email}
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>{' '}
                      {selectedApp.phone}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="mb-2 font-semibold">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Education:</span>{' '}
                      {selectedApp.education_level}
                    </div>
                    <div>
                      <span className="text-gray-600">Pay Range:</span>{' '}
                      {selectedApp.pay_range}
                    </div>
                    {selectedApp.certificates && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Certificates:</span>
                        <p className="mt-1 whitespace-pre-wrap">
                          {selectedApp.certificates}
                        </p>
                      </div>
                    )}
                    {selectedApp.linkedin && (
                      <div className="col-span-2">
                        <span className="text-gray-600">LinkedIn:</span>
                        <a
                          href={selectedApp.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {selectedApp.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedApp.additional_notes && (
                  <div>
                    <h3 className="mb-2 font-semibold">Additional Notes</h3>
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedApp.additional_notes}
                    </p>
                  </div>
                )}

                {/* AI Analysis */}
                {selectedApp.analysis && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-3 font-semibold text-blue-900">
                      AI Analysis
                    </h3>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-blue-900">
                        Qualification:
                      </span>
                      <span
                        className={`ml-2 rounded-full px-3 py-1 text-sm ${
                          selectedApp.analysis.qualification_category ===
                          'QUALIFIED'
                            ? 'bg-green-100 text-green-800'
                            : selectedApp.analysis.qualification_category ===
                                'UNQUALIFIED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedApp.analysis.qualification_category}
                      </span>
                    </div>

                    {selectedApp.analysis.qualification_reason && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-blue-900">
                          Reason:
                        </span>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedApp.analysis.qualification_reason}
                        </p>
                      </div>
                    )}

                    {selectedApp.analysis.research_summary && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-blue-900">
                          Analysis Summary:
                        </span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                          {selectedApp.analysis.research_summary}
                        </p>
                      </div>
                    )}

                    {selectedApp.analysis.linkedin_analysis && (
                      <div>
                        <span className="text-sm font-medium text-blue-900">
                          LinkedIn Analysis:
                        </span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                          {selectedApp.analysis.linkedin_analysis}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Analyzed:{' '}
                      {new Date(
                        selectedApp.analysis.analyzed_at
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!selectedApp.analysis && (
                    <Button
                      onClick={() => analyzeApplication(selectedApp.id)}
                      disabled={analyzing === selectedApp.id}
                    >
                      {analyzing === selectedApp.id
                        ? 'Analyzing...'
                        : 'Run AI Analysis'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

