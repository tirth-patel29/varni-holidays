'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import {
  MessageSquare,
  Mail,
  Copy,
  Check,
  Eye,
  FileText,
} from 'lucide-react';

export default function MessageTemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const emailTemplates = [
    {
      id: 'enquiry-acknowledgement',
      name: 'Client Enquiry Acknowledgement',
      subject: 'We have received your travel enquiry - Varni Holidays',
      description: 'Dispatched immediately when a customer submits Flight, Package, Visa, or Insurance enquiry.',
      sender: 'noreply@varnitours.com',
      body: `Dear [Customer Name],\n\nThank you for choosing Varni Holidays. We have received your enquiry for [Destination / Service] (Ref: [Reference ID]).\n\nOur senior travel specialist will review your requirements and share an itemized quote shortly.\n\nWarm regards,\nVarni Holidays Anand Team`,
    },
    {
      id: 'admin-lead-notification',
      name: 'Internal Admin Lead Notification',
      subject: 'New Travel Lead Received - [Customer Name]',
      description: 'Sent to varniinternational7@gmail.com with customer phone, destination, and travel dates.',
      sender: 'system@varnitours.com',
      body: `New Lead Logged:\nCustomer: [Name] | Phone: [Phone]\nService: [Service] | Destination: [Destination]\nTravel Date: [Date] | Passengers: [Count]`,
    },
    {
      id: 'booking-confirmation',
      name: 'Booking Confirmation & Voucher Receipt',
      subject: 'Booking Confirmed: [Destination] - Varni Holidays',
      description: 'Sent when travel reservation is confirmed with reference code and itinerary receipt.',
      sender: 'noreply@varnitours.com',
      body: `Dear [Customer Name],\n\nCongratulations! Your travel booking [Booking Reference] has been confirmed.\nTotal Package Price: ₹[Total] | Paid: ₹[Paid]\n\nYour travel vouchers are attached.`,
    },
    {
      id: 'quotation-proposal',
      name: 'Official Quotation Dispatch',
      subject: 'Your Travel Proposal for [Destination] - Varni Holidays',
      description: 'Itemized holiday or flight proposal sent from the CRM Quotation workspace.',
      sender: 'noreply@varnitours.com',
      body: `Dear [Customer Name],\n\nPlease find attached your formal quotation for [Destination]. This estimate is valid until [Expiry Date].`,
    },
  ];

  const whatsAppTemplates = [
    {
      id: 'wa-lead-acknowledgement',
      name: 'WhatsApp Enquiry Acknowledgement',
      category: 'MARKETING / UTILITY',
      body: 'Namaste {{1}}, thank you for contacting Varni Holidays Anand. Our team has received your {{2}} enquiry and is reviewing the best fares. For urgent assistance, reply to this chat.',
    },
    {
      id: 'wa-booking-confirmed',
      name: 'WhatsApp Booking Confirmation',
      category: 'UTILITY',
      body: 'Dear {{1}}, your booking {{2}} for {{3}} is confirmed! Our operations desk has finalized your reservation. View vouchers: {{4}}',
    },
    {
      id: 'wa-quotation-ready',
      name: 'WhatsApp Quotation Ready',
      category: 'MARKETING',
      body: 'Hi {{1}}, your custom holiday estimate for {{2}} is ready! Total estimate: INR {{3}}. View proposal: {{4}}',
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Approved Communication Templates"
        subtitle="Standardized message templates for Resend Transactional Email and Meta WhatsApp Cloud API"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'Templates' },
        ]}
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-8 max-w-7xl mx-auto w-full">
        {/* EMAIL TEMPLATES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E8ED] pb-3">
            <Mail size={16} className="text-[#1D4ED8]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#153650] font-mono">
              Resend Transactional Email Templates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map((t) => (
              <div key={t.id} className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-[#153650]">{t.name}</span>
                    <button
                      onClick={() => copyToClipboard(t.body, t.id)}
                      className="text-[#718096] hover:text-[#153650] p-1"
                      title="Copy template body"
                    >
                      {copiedId === t.id ? <Check size={14} className="text-[#168653]" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#718096] mb-3">{t.description}</p>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs font-mono text-[#334155] whitespace-pre-wrap rounded-none">
                    {t.body}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E8ED] flex justify-between items-center text-[10px] text-[#718096] font-mono">
                  <span>Sender: {t.sender}</span>
                  <span className="text-[#168653] font-bold">ACTIVE TEMPLATE</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHATSAPP TEMPLATES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E8ED] pb-3">
            <MessageSquare size={16} className="text-[#15803D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#153650] font-mono">
              Meta WhatsApp Cloud API Templates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whatsAppTemplates.map((t) => (
              <div key={t.id} className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-xs text-[#153650]">{t.name}</span>
                    <button
                      onClick={() => copyToClipboard(t.body, t.id)}
                      className="text-[#718096] hover:text-[#153650] p-1"
                      title="Copy template body"
                    >
                      {copiedId === t.id ? <Check size={14} className="text-[#168653]" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-mono text-[#14532D] whitespace-pre-wrap rounded-none">
                    {t.body}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E8ED] flex justify-between items-center text-[10px] text-[#718096] font-mono">
                  <span>Category: {t.category}</span>
                  <span className="text-[#15803D] font-bold">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

