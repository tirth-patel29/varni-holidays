'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import { Printer, Download, ArrowLeft, ExternalLink } from 'lucide-react';

export default function QuotationPdfPreviewPage() {
  const params = useParams();
  const quotationId = params?.id as string;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Quotation PDF Document Preview"
        subtitle="Official server-side generated PDF representation for client printing and dispatch"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Quotations', href: '/admin/quotations' },
          { label: 'Dossier', href: `/admin/quotations/${quotationId}` },
          { label: 'PDF Preview' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/quotations/${quotationId}`}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#CBD5E1] text-xs font-semibold text-[#153650] inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Back to Dossier</span>
            </Link>

            <a
              href={`/api/quotations/${quotationId}/pdf?download=1`}
              className="px-3.5 py-1.5 bg-[#002037] hover:bg-[#153650] text-[#FFFFFF] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} className="text-[#E9B95E]" />
              <span>Download PDF</span>
            </a>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full flex flex-col min-h-[75vh]">
        <div className="flex-1 bg-white border border-[#CBD5E1] shadow-sm flex flex-col overflow-hidden">
          <iframe
            src={`/api/quotations/${quotationId}/pdf`}
            className="w-full h-full min-h-[700px] border-0"
            title="Quotation PDF Preview"
          />
        </div>
      </main>
    </div>
  );
}

