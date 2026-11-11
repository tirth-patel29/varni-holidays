'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function BusinessProfilePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Varni Holidays Business Profile & Operations Headquarters"
        subtitle="Official enterprise credentials, Anand corporate address, verified contact channels, and operating hours"
        breadcrumbs={[
          { label: 'Settings & Team', href: '/admin/users' },
          { label: 'Business Profile' },
        ]}
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Corporate Profile Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
              Corporate Headquarters (Anand, Gujarat)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-[#24689B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#153650] block">Official Trading Name</span>
                  <span className="text-[#667085]">Varni Holidays (Varni International Tours & Travels)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#24689B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#153650] block">Registered Office Address</span>
                  <p className="text-[#4A5568] leading-relaxed">
                    {COMPANY_CONTACT.address.full}
                  </p>
                  <p className="text-[#718096] text-[11px] mt-0.5 font-mono">
                    Landmark: {COMPANY_CONTACT.address.landmark}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#24689B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#153650] block">Consultation Hours</span>
                  <span className="text-[#4A5568]">{COMPANY_CONTACT.hours.display}</span>
                  <p className="text-[11px] text-[#718096]">Emergency flight & consular support available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support Endpoints */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
              Public Contact & Dispatch Channels
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#24689B] shrink-0" />
                <div>
                  <span className="font-bold text-[#153650] block">Office Landline / Helpline</span>
                  <span className="font-mono text-[#153650]">{COMPANY_CONTACT.phone.display}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#15803D] shrink-0" />
                <div>
                  <span className="font-bold text-[#153650] block">Official WhatsApp Business Desk</span>
                  <span className="font-mono text-[#153650]">{COMPANY_CONTACT.whatsapp.display}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#24689B] shrink-0" />
                <div>
                  <span className="font-bold text-[#153650] block">Customer Service Email</span>
                  <span className="font-mono text-[#153650]">{COMPANY_CONTACT.email.primary}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe size={16} className="text-[#24689B] shrink-0" />
                <div>
                  <span className="font-bold text-[#153650] block">Public Travel Portal</span>
                  <a
                    href="https://varnitours.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#24689B] hover:underline inline-flex items-center gap-1"
                  >
                    <span>varnitours.com</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

