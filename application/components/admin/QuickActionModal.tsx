'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  PlusCircle,
  FileText,
  UserPlus,
  BookmarkCheck,
  CreditCard,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plane,
  Compass,
  Stamp,
  Shield,
} from 'lucide-react';
import { useCrm } from '@/components/crm/CrmContext';
import { createFollowUpAction } from '@/app/actions/crm';
import { createManualBookingAction, recordPaymentAction } from '@/app/actions/phase3';
import { submitFlightEnquiry, submitPackageEnquiry, submitVisaEnquiry } from '@/app/actions/enquiries';

export type QuickActionType =
  | 'enquiry'
  | 'customer'
  | 'booking'
  | 'quotation'
  | 'payment'
  | 'followup';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: QuickActionType;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  initialAction = 'enquiry',
}: QuickActionModalProps) {
  const router = useRouter();
  const { currentUser } = useCrm();
  const [activeTab, setActiveTab] = useState<QuickActionType>(initialAction);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  // 1. Enquiry
  const [enquiryService, setEnquiryService] = useState<'FLIGHT' | 'PACKAGE' | 'VISA'>('FLIGHT');
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryDest, setEnquiryDest] = useState('');
  const [enquiryDate, setEnquiryDate] = useState('');
  const [enquiryPax, setEnquiryPax] = useState('2');
  const [enquiryNotes, setEnquiryNotes] = useState('');

  // 2. Follow-up
  const [followUpLeadId, setFollowUpLeadId] = useState('');
  const [followUpCustomerName, setFollowUpCustomerName] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // 3. Payment
  const [paymentBookingId, setPaymentBookingId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD'>('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');

  // 4. Booking
  const [bookingCustomerName, setBookingCustomerName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingService, setBookingService] = useState<'FLIGHT' | 'PACKAGE' | 'HOTEL' | 'VISA'>('PACKAGE');
  const [bookingTotal, setBookingTotal] = useState('');
  const [bookingPaid, setBookingPaid] = useState('');
  const [bookingDates, setBookingDates] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setLoading(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Submit Quick Enquiry
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName || !enquiryPhone) {
      setErrorMessage('Full name and mobile number are required.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      if (enquiryService === 'FLIGHT') {
        await submitFlightEnquiry({
          name: enquiryName,
          email: enquiryEmail || `${enquiryPhone}@guest.varnitours.com`,
          phone: enquiryPhone,
          destination: enquiryDest || 'General Flight',
          travelDate: enquiryDate || new Date().toISOString().split('T')[0],
          passengers: parseInt(enquiryPax) || 1,
          tripType: 'ROUND_TRIP',
          origin: 'Ahmedabad (AMD)',
          notes: enquiryNotes,
        });
      } else if (enquiryService === 'PACKAGE') {
        await submitPackageEnquiry({
          name: enquiryName,
          email: enquiryEmail || `${enquiryPhone}@guest.varnitours.com`,
          phone: enquiryPhone,
          packageId: 'custom-package',
          packageName: enquiryDest || 'Custom Holiday Inquiry',
          travelDate: enquiryDate || new Date().toISOString().split('T')[0],
          travelers: parseInt(enquiryPax) || 2,
          notes: enquiryNotes,
        });
      } else {
        await submitVisaEnquiry({
          name: enquiryName,
          email: enquiryEmail || `${enquiryPhone}@guest.varnitours.com`,
          phone: enquiryPhone,
          country: enquiryDest || 'UAE',
          visaCategory: 'TOURIST',
          entryType: 'MULTIPLE',
          notes: enquiryNotes,
        });
      }
      setSuccessMessage('Enquiry recorded and dispatched successfully!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Quick Follow-up
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpNotes) {
      setErrorMessage('Follow-up date and reminder notes are required.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await createFollowUpAction(
        followUpLeadId || 'lead_gen_sample',
        followUpDate,
        `${followUpCustomerName ? `[${followUpCustomerName}] ` : ''}${followUpNotes}`,
        currentUser.id
      );
      setSuccessMessage('Follow-up scheduled successfully!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule follow-up.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Quick Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBookingId || !paymentAmount) {
      setErrorMessage('Booking Reference and Payment Amount are required.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await recordPaymentAction({
        bookingId: paymentBookingId,
        amountInr: parseFloat(paymentAmount),
        paymentMethod: (paymentMethod as any) || 'UPI',
        bankTransactionRef: paymentRef || `TXN-${Date.now()}`,
        recordedByUserId: currentUser.id,
      });
      setSuccessMessage('Payment logged successfully in financial ledger!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Quick Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCustomerName || !bookingPhone || !bookingTotal) {
      setErrorMessage('Customer Name, Phone, and Total Amount are required.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const validService: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL' =
        bookingService === 'FLIGHT' || bookingService === 'PACKAGE' || bookingService === 'VISA'
          ? bookingService
          : 'GENERAL';

      await createManualBookingAction({
        customerId: `cust_${Date.now()}`,
        serviceType: validService,
        managedByUserId: currentUser.id,
        travelStartDate: bookingDates || new Date().toISOString().slice(0, 10),
        travelEndDate: bookingDates || new Date().toISOString().slice(0, 10),
        totalAmountInr: parseFloat(bookingTotal),
        initialPaidAmountInr: parseFloat(bookingPaid || '0'),
      });
      setSuccessMessage('Booking reservation created successfully!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#153650]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E5E8ED] w-full max-w-2xl shadow-2xl rounded-none flex flex-col max-h-[90vh] overflow-hidden select-none">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-[#E5E8ED] flex items-center justify-between shrink-0 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#153650] text-[#E9B95E] flex items-center justify-center rounded-none font-bold text-sm">
              +
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-headline">
                Quick Actions Workspace
              </h3>
              <p className="text-[11px] text-[#718096]">
                Fast entry for enquiries, bookings, follow-ups & payments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-[#153650] hover:bg-[#E5E8ED] rounded-none transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Tabs Bar */}
        <div className="flex items-center border-b border-[#E5E8ED] bg-[#FFFFFF] px-3 overflow-x-auto crm-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('enquiry'); resetForm(); }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'enquiry'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <PlusCircle size={14} />
            <span>New Enquiry</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('booking'); resetForm(); }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'booking'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <BookmarkCheck size={14} />
            <span>Create Booking</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('followup'); resetForm(); }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'followup'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <Clock size={14} />
            <span>Schedule Follow-up</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('payment'); resetForm(); }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'payment'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <CreditCard size={14} />
            <span>Record Payment</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F] text-xs flex items-center gap-2 rounded-none">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 rounded-none">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body Viewport */}
        <div className="p-5 overflow-y-auto crm-scrollbar flex-1">
          {/* TAB 1: NEW ENQUIRY */}
          {activeTab === 'enquiry' && (
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#718096] mb-1.5">
                  Travel Service Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryService('FLIGHT')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border rounded-none transition-colors ${
                      enquiryService === 'FLIGHT'
                        ? 'border-[#24689B] bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'border-[#E5E8ED] bg-[#FFFFFF] text-[#667085] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Plane size={13} />
                    <span>Flight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnquiryService('PACKAGE')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border rounded-none transition-colors ${
                      enquiryService === 'PACKAGE'
                        ? 'border-[#7E22CE] bg-[#FAF5FF] text-[#7E22CE]'
                        : 'border-[#E5E8ED] bg-[#FFFFFF] text-[#667085] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Compass size={13} />
                    <span>Tour Package</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnquiryService('VISA')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border rounded-none transition-colors ${
                      enquiryService === 'VISA'
                        ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                        : 'border-[#E5E8ED] bg-[#FFFFFF] text-[#667085] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Stamp size={13} />
                    <span>Visa Assistance</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="e.g. Rajesh Shah"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="e.g. +91 98250 12345"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Destination / Route
                  </label>
                  <input
                    type="text"
                    value={enquiryDest}
                    onChange={(e) => setEnquiryDest(e.target.value)}
                    placeholder="e.g. Dubai, Kerala, Singapore"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={enquiryDate}
                    onChange={(e) => setEnquiryDate(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Passengers / Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={enquiryPax}
                    onChange={(e) => setEnquiryPax(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={enquiryEmail}
                  onChange={(e) => setEnquiryEmail(e.target.value)}
                  placeholder="rajesh@example.com"
                  className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">
                  Special Notes or Requirements
                </label>
                <textarea
                  rows={2}
                  value={enquiryNotes}
                  onChange={(e) => setEnquiryNotes(e.target.value)}
                  placeholder="Meal preferences, budget, hotel star category..."
                  className="w-full p-2.5 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E8ED] text-[#667085] hover:bg-[#F9FAFB] rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#153650] text-[#FFFFFF] hover:bg-[#24689B] rounded-none flex items-center gap-1.5 transition-colors"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Register Enquiry</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE BOOKING */}
          {activeTab === 'booking' && (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingCustomerName}
                    onChange={(e) => setBookingCustomerName(e.target.value)}
                    placeholder="e.g. Anita Desai"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="e.g. +91 99090 12345"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Primary Service
                  </label>
                  <select
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  >
                    <option value="PACKAGE">Tour Package</option>
                    <option value="FLIGHT">Flight Ticket</option>
                    <option value="HOTEL">Hotel Accommodation</option>
                    <option value="VISA">Visa Process</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={bookingTotal}
                    onChange={(e) => setBookingTotal(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Initial Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={bookingPaid}
                    onChange={(e) => setBookingPaid(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">
                  Travel Dates / Details
                </label>
                <input
                  type="text"
                  value={bookingDates}
                  onChange={(e) => setBookingDates(e.target.value)}
                  placeholder="e.g. 15 Dec 2026 - 22 Dec 2026 (Kerala 7D/6N)"
                  className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E8ED] text-[#667085] hover:bg-[#F9FAFB] rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#153650] text-[#FFFFFF] hover:bg-[#24689B] rounded-none flex items-center gap-1.5 transition-colors"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <BookmarkCheck size={13} />}
                  <span>Confirm Booking</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SCHEDULE FOLLOW-UP */}
          {activeTab === 'followup' && (
            <form onSubmit={handleFollowUpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Customer Name / Reference
                  </label>
                  <input
                    type="text"
                    value={followUpCustomerName}
                    onChange={(e) => setFollowUpCustomerName(e.target.value)}
                    placeholder="e.g. Nilesh Patel"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">
                  Follow-up Reminder Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Call to finalize flight timing, confirm visa documentation status..."
                  className="w-full p-2.5 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E8ED] text-[#667085] hover:bg-[#F9FAFB] rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#153650] text-[#FFFFFF] hover:bg-[#24689B] rounded-none flex items-center gap-1.5 transition-colors"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
                  <span>Schedule Reminder</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RECORD PAYMENT */}
          {activeTab === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Booking Reference ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentBookingId}
                    onChange={(e) => setPaymentBookingId(e.target.value)}
                    placeholder="e.g. BK-2026-1049"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  >
                    <option value="BANK_TRANSFER">NEFT / RTGS / IMPS Bank Transfer</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash at Anand HQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#153650] mb-1">
                    Transaction / Bank Reference
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. UTR1234567890 / Cash Receipt 44"
                    className="w-full h-9 px-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E8ED] text-[#667085] hover:bg-[#F9FAFB] rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#153650] text-[#FFFFFF] hover:bg-[#24689B] rounded-none flex items-center gap-1.5 transition-colors"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

