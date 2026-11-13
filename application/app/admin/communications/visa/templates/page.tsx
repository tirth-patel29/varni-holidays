'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import { VISA_EMAIL_TEMPLATES, renderVisaEmail } from '@/lib/visa/templates';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Code,
  Eye,
  Copy,
  Check,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

const DYNAMIC_VARIABLES = [
  { key: '{{customer_name}}', desc: 'Primary applicant full name', sample: 'Rameshchandra Patel' },
  { key: '{{customer_email}}', desc: 'Applicant contact email address', sample: 'ramesh.patel@example.com' },
  { key: '{{customer_phone}}', desc: 'Applicant phone or WhatsApp', sample: '+91 98250 12345' },
  { key: '{{destination_country}}', desc: 'Destination consular authority', sample: 'Canada' },
  { key: '{{visa_type}}', desc: 'Specific visa classification', sample: 'Tourist / Visitor Visa (10-Year Multiple Entry)' },
  { key: '{{application_reference}}', desc: 'Unique Varni Holidays reference ID', sample: 'VH-VIS-202611-0001' },
  { key: '{{official_reference}}', desc: 'Consular / VFS / Portal tracking number', sample: 'VFS-CAN-2026-9812' },
  { key: '{{inquiry_date}}', desc: 'Registration date (DD/MM/YYYY)', sample: '14/11/2026' },
  { key: '{{document_received_date}}', desc: 'Document receipt timestamp', sample: '15/11/2026' },
  { key: '{{submission_date}}', desc: 'Embassy lodgement timestamp', sample: '18/11/2026' },
  { key: '{{approval_date}}', desc: 'Official approval timestamp', sample: '25/11/2026' },
  { key: '{{decision_date}}', desc: 'Consular decision timestamp', sample: '25/11/2026' },
  { key: '{{employee_name}}', desc: 'Assigned counselor name', sample: 'Ananya Joshi' },
  { key: '{{employee_phone}}', desc: 'Counselor direct contact', sample: '+91 94260 45678' },
  { key: '{{company_name}}', desc: 'Official travel agency name', sample: 'Varni Holidays' },
  { key: '{{company_address}}', desc: 'Anand HQ physical address', sample: 'Near Ganesh Crossing, Anand, Gujarat 388001' },
  { key: '{{additional_message}}', desc: 'Counselor custom instructions safely appended', sample: 'Please bring original property valuations for your file.' },
];

export default function VisaTemplatesCatalogPage() {
  const [selectedCode, setSelectedCode] = useState<string>('INQUIRY_RECEIVED');
  const [previewMode, setPreviewMode] = useState<'HTML' | 'TEXT'>('HTML');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sampleCustomNote, setSampleCustomNote] = useState('');

  const currentTemplate = VISA_EMAIL_TEMPLATES[selectedCode] || VISA_EMAIL_TEMPLATES.INQUIRY_RECEIVED;

  const rendered = renderVisaEmail(
    selectedCode,
    {
      customer_name: 'Rameshchandra Patel',
      customer_email: 'ramesh.patel@example.com',
      customer_phone: '+91 98250 12345',
      destination_country: 'Canada',
      visa_type: 'Tourist / Visitor Visa (10-Year Multiple Entry)',
      application_reference: 'VH-VIS-202611-0001',
      official_reference: 'VFS-CAN-2026-9812',
      inquiry_date: new Date().toISOString(),
      document_received_date: new Date().toISOString(),
      submission_date: new Date().toISOString(),
      approval_date: new Date().toISOString(),
      decision_date: new Date().toISOString(),
      employee_name: 'Ananya Joshi',
      employee_phone: '+91 94260 45678',
    },
    sampleCustomNote
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: 'Communications', href: '/admin/communications' },
            { label: 'Visa Management', href: '/admin/communications/visa' },
            { label: 'Email Templates' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#E9B95E] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Automated Client Communication Engine
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650]">
              Visa Email Templates Catalog
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              7 professionally authored, responsive email templates adhering strictly to Varni Holidays brand standards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/communications/visa"
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Visa Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 7 Templates Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.values(VISA_EMAIL_TEMPLATES).map((tmpl) => {
            const isSelected = selectedCode === tmpl.code;

            return (
              <button
                key={tmpl.code}
                onClick={() => setSelectedCode(tmpl.code)}
                className={`p-3 text-left border rounded-none transition-all shadow-xs ${
                  isSelected
                    ? 'border-[#153650] bg-[#153650] text-[#FFFFFF] ring-1 ring-[#153650]'
                    : 'border-[#E5E8ED] bg-[#FFFFFF] hover:border-[#CBD5E1] text-[#172B45]'
                }`}
              >
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-[#E9B95E]' : 'text-[#718096]'}`}>
                  {tmpl.code}
                </div>
                <div className="text-xs font-bold truncate">
                  {tmpl.title.split(' — ')[1] || tmpl.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* 2-Column Template Details & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (1 Col): Template Metadata & Variables Reference */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold block mb-1">
                  Active Template
                </span>
                <h2 className="text-base font-bold text-[#153650] font-headline">
                  {currentTemplate.title}
                </h2>
                <p className="text-xs text-[#718096] mt-1">
                  {currentTemplate.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Default Subject Line
                </span>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E5E8ED] text-xs font-mono font-bold text-[#153650] break-words">
                  {currentTemplate.defaultSubject}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Operational Purpose
                </span>
                <p className="text-xs text-[#4A5568] leading-relaxed bg-[#F8F6F0] p-3 border border-[#E5E8ED]">
                  {currentTemplate.purpose}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Test Counselor Note in Preview
                </label>
                <textarea
                  rows={2}
                  placeholder="Type sample message here to see it render live in the preview..."
                  value={sampleCustomNote}
                  onChange={(e) => setSampleCustomNote(e.target.value)}
                  className="w-full p-2 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>
            </div>

            {/* Dynamic Tokens Guide */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs space-y-3">
              <div className="border-b border-[#E5E8ED] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                  Supported Dynamic Tokens
                </span>
                <span className="text-[10px] text-[#718096]">Click to copy</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto crm-scrollbar">
                {DYNAMIC_VARIABLES.map((v) => (
                  <div
                    key={v.key}
                    onClick={() => handleCopy(v.key, v.key)}
                    className="p-2 bg-[#F8FAFC] hover:bg-[#F1F3F5] border border-[#E5E8ED] rounded-none cursor-pointer transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-bold text-[#24689B] truncate">
                        {v.key}
                      </div>
                      <div className="text-[10px] text-[#718096] truncate">
                        {v.desc}
                      </div>
                    </div>
                    {copiedKey === v.key ? (
                      <span className="text-[10px] text-[#168653] font-bold">Copied!</span>
                    ) : (
                      <Copy size={11} className="text-[#A0AEC0]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (2 Cols): Live HTML / Plain Text Render */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
              {/* Preview Bar */}
              <div className="bg-[#002037] text-[#FFFFFF] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#E9B95E] font-bold">
                    Live Render Preview
                  </div>
                  <div className="text-xs font-bold text-[#FFFFFF] mt-0.5 truncate">
                    Subject: {rendered.subject}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewMode('HTML')}
                    className={`px-3 py-1 text-xs font-bold rounded-none transition-colors ${
                      previewMode === 'HTML'
                        ? 'bg-[#E9B95E] text-[#002037]'
                        : 'bg-white/10 text-[#FFFFFF] hover:bg-white/20'
                    }`}
                  >
                    Responsive HTML
                  </button>
                  <button
                    onClick={() => setPreviewMode('TEXT')}
                    className={`px-3 py-1 text-xs font-bold rounded-none transition-colors ${
                      previewMode === 'TEXT'
                        ? 'bg-[#E9B95E] text-[#002037]'
                        : 'bg-white/10 text-[#FFFFFF] hover:bg-white/20'
                    }`}
                  >
                    Plain Text
                  </button>
                </div>
              </div>

              {/* Render Container */}
              <div className="p-6 bg-[#F8F6F0] min-h-[550px] overflow-y-auto crm-scrollbar">
                {previewMode === 'HTML' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: rendered.html }}
                    className="shadow-sm"
                  />
                ) : (
                  <pre className="text-xs font-mono text-[#172B45] whitespace-pre-wrap bg-[#FFFFFF] p-6 border border-[#E5E8ED] shadow-sm leading-relaxed max-w-2xl mx-auto">
                    {rendered.text}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

