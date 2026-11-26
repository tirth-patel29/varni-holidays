'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  RotateCcw,
  Bot,
  User,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Calendar,
  CreditCard,
  FileText,
  BookmarkCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Plane,
  Palmtree,
  FileCheck2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  buttons?: Array<{ id: string; title: string }>;
  timestamp: string;
}

export default function WhatsAppSimulatorPage() {
  const [phoneNumber, setPhoneNumber] = useState('919876543210');
  const [customerName, setCustomerName] = useState('Rajesh Patel');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial greeting
  useEffect(() => {
    resetChat(false);
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const res = await fetch('/api/crm/bookings');
      const data = await res.json();
      if (data.success && data.bookings) {
        setRecentBookings(data.bookings.slice(0, 5));
      }
    } catch (e) {
      console.warn('Failed to fetch bookings:', e);
    }
  };

  const sendMessage = async (textToSend: string, actionId?: string) => {
    if (!textToSend.trim() && !actionId) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          senderName: customerName,
          text: textToSend,
          actionId,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply.text,
          buttons: data.reply.buttons,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setSessionInfo(data.sessionState);
        fetchRecentBookings();
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async (notifyBackend = true) => {
    if (notifyBackend) {
      await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, resetSession: true }),
      });
    }

    setMessages([
      {
        id: 'bot_init',
        sender: 'bot',
        text: `🌴 *NAMASTE & WELCOME TO VARNI HOLIDAYS!*\n_Your Gateway to Joyful Holidays_ ✈️\n📍 *Anand, Gujarat*\n\nHello *${customerName}*! How can we assist your travel plans today?\n\n1️⃣ 🏖️ *Book Tour Package / Instant Kerala Quote*\n2️⃣ ✈️ *Book / Enquire Flights*\n3️⃣ 🛂 *Visa Assistance*\n4️⃣ 🔍 *Track Booking / Enquiry Status*\n5️⃣ 📞 *Speak with Travel Expert / Office Details*\n\n💡 _Reply with a number (1-5) or type your requirement naturally!_`,
        buttons: [
          { id: 'menu_package', title: '🏖️ Tour Packages' },
          { id: 'menu_flight', title: '✈️ Flight Booking' },
          { id: 'menu_status', title: '🔍 Track Status' },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSessionInfo({ flow: 'IDLE', step: 'START' });
  };

  // Simulates a proactive notification arriving on the customer's phone
  const injectSimulatedNotification = (title: string, content: string) => {
    const notifyMsg: ChatMessage = {
      id: `notify_${Date.now()}`,
      sender: 'bot',
      text: `${title}\n\n${content}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, notifyMsg]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111317] border border-[#2A2E34] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Interactive Bot
            </span>
            <span className="text-xs text-[#969CA5]">Meta Cloud API + State Machine</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F4F2] mt-1 flex items-center gap-2">
            WhatsApp Conversational Travel Desk
          </h1>
          <p className="text-sm text-[#969CA5] mt-0.5">
            Full automated booking engine, pricing calculation, CRM lead generation, and customer notification dispatcher.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/employee/bookings"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#1D2127] hover:bg-[#252A32] text-[#F4F4F2] border border-[#2A2E34] flex items-center gap-1.5 transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#E9B95E]" />
            View Bookings
          </Link>
          <button
            onClick={() => resetChat(true)}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Bot Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mobile WhatsApp Mockup (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md bg-[#0C1317] border border-[#2A2E34] rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[700px]">
            {/* Phone Top Speaker/Camera Bar */}
            <div className="bg-[#1F2C34] pt-2 pb-1 px-6 flex justify-between items-center text-[11px] text-[#8696A0]">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-full" />
              <span>5G 100%</span>
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-[#1F2C34] text-white px-4 py-3 flex items-center justify-between border-b border-[#2A2E34]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
                  🌴
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-[#E9EDEF]">VARNI HOLIDAYS</span>
                    <span className="bg-emerald-500 text-white rounded-full p-0.5 text-[9px] leading-none">✓</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Official Business Account • online</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[#AEBAC1]">
                <Video className="w-4 h-4 cursor-pointer hover:text-white" />
                <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Chat Bubble Area with WhatsApp Wallpaper Pattern */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B141A]"
              style={{
                backgroundImage: `radial-gradient(#111B21 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            >
              {/* Encrypted Disclaimer */}
              <div className="text-center my-2">
                <span className="bg-[#182229] text-[#FFD279] text-[10px] px-3 py-1 rounded-md shadow-sm border border-[#222E35]">
                  🔒 Messages are end-to-end encrypted with Varni Holidays.
                </span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-[#005C4B] text-[#E9EDEF] rounded-tr-none'
                        : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none border border-[#2A3942]'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                        msg.sender === 'user' ? 'text-[#8696A0]' : 'text-[#8696A0]'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>

                  {/* Quick Reply Buttons (rendered if bot included them) */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="mt-2 space-y-1 w-[85%]">
                      {msg.buttons.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => sendMessage(btn.title, btn.id)}
                          className="w-full text-center py-2 px-3 text-xs font-semibold bg-[#202C33] hover:bg-[#2A3942] text-emerald-400 border border-[#2A3942] rounded-xl shadow-sm transition-colors active:scale-95"
                        >
                          {btn.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 bg-[#202C33] text-[#8696A0] text-xs px-3 py-2 rounded-xl w-32 border border-[#2A3942]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>typing...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
              className="bg-[#202C33] p-2.5 flex items-center gap-2 border-t border-[#2A3942]"
            >
              <input
                type="text"
                placeholder="Type a message or number..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#2A3942] text-white text-xs px-4 py-2.5 rounded-full placeholder-[#8696A0] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Bot Controls, Scenario Shortcuts & Notifications Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Profile & Identity */}
          <div className="bg-[#111317] border border-[#2A2E34] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#F4F4F2] flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-[#E9B95E]" />
              Traveler Session Profile
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#969CA5] block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#17191D] border border-[#2A2E34] rounded-lg px-3 py-2 text-[#F4F4F2] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[#969CA5] block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#17191D] border border-[#2A2E34] rounded-lg px-3 py-2 text-[#F4F4F2] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {sessionInfo && (
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-2.5 text-[11px] font-mono text-[#969CA5] flex items-center justify-between">
                <span>Active Flow: <strong className="text-emerald-400">{sessionInfo.flow}</strong></span>
                <span>Step: <strong className="text-[#E9B95E]">{sessionInfo.step}</strong></span>
              </div>
            )}
          </div>

          {/* Quick Flow Shortcuts */}
          <div className="bg-[#111317] border border-[#2A2E34] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#F4F4F2] flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#E9B95E]" />
              Quick Conversational Scenarios
            </h2>
            <p className="text-xs text-[#969CA5]">
              Click any button below to immediately trigger end-to-end bot interactions:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => sendMessage('1', 'menu_package')}
                className="w-full text-left p-3 rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Palmtree className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-[#F4F4F2]">1. Book Kerala Package & Quote</div>
                    <div className="text-[10px] text-[#969CA5]">Select tier, passenger count, instant price & booking creation</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#969CA5] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => sendMessage('2', 'menu_flight')}
                className="w-full text-left p-3 rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plane className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-semibold text-[#F4F4F2]">2. Book Flight Enquiry</div>
                    <div className="text-[10px] text-[#969CA5]">Route (AMD to DXB/LHR), trip type, dates & cabin class</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#969CA5] group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => sendMessage('3', 'menu_visa')}
                className="w-full text-left p-3 rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-[#F4F4F2]">3. Enquire Visa Assistance</div>
                    <div className="text-[10px] text-[#969CA5]">Schengen, UK, USA, Dubai tourist & business visas</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#969CA5] group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => sendMessage('4', 'menu_status')}
                className="w-full text-left p-3 rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookmarkCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-[#F4F4F2]">4. Track Booking & Reference ID</div>
                    <div className="text-[10px] text-[#969CA5]">Search status by reference code or customer phone</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#969CA5] group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => sendMessage('5', 'menu_agent')}
                className="w-full text-left p-3 rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-[#F4F4F2]">5. Anand Office & Urgent Callback</div>
                    <div className="text-[10px] text-[#969CA5]">Flag priority ticket in CRM for immediate human assistance</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#969CA5] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Customer Notifications Simulator */}
          <div className="bg-[#111317] border border-[#2A2E34] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#F4F4F2] flex items-center gap-2 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-emerald-400" />
              Simulate Outbound Customer Alerts
            </h2>
            <p className="text-xs text-[#969CA5]">
              Preview how automated updates dispatched from the CRM look to the customer on WhatsApp:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  injectSimulatedNotification(
                    '✅ *BOOKING CONFIRMED — VARNI HOLIDAYS*',
                    `Great news, *${customerName}*! Your booking \`VH-BKG-202611-0001\` is now *CONFIRMED*.\nAll accommodations and AC Innova Crysta transfers have been booked.\n\n💰 Total: ₹41,400\n💳 Paid: ₹20,700 (Advance Received)\n⚠️ Balance: ₹20,700`
                  )
                }
                className="p-2.5 text-left rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] text-[#F4F4F2] transition-colors"
              >
                <span className="block font-semibold text-emerald-400 mb-0.5">✅ Booking Confirmed</span>
                <span className="text-[10px] text-[#969CA5]">Status update alert</span>
              </button>

              <button
                onClick={() =>
                  injectSimulatedNotification(
                    '💳 *PAYMENT RECEIPT — VARNI HOLIDAYS*',
                    `Dear *${customerName}*, we have verified your payment of *₹20,700* via HDFC Bank Transfer.\n\n🎫 Booking Ref: \`VH-BKG-202611-0001\`\n🔖 Txn UTR: \`HDFC98234190\`\n📊 Balance Remaining: ₹20,700\n\nOfficial receipt updated on file.`
                  )
                }
                className="p-2.5 text-left rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] text-[#F4F4F2] transition-colors"
              >
                <span className="block font-semibold text-blue-400 mb-0.5">💳 Payment Receipt</span>
                <span className="text-[10px] text-[#969CA5]">Advance receipt alert</span>
              </button>

              <button
                onClick={() =>
                  injectSimulatedNotification(
                    '📋 *CUSTOM TOUR QUOTATION READY*',
                    `Dear *${customerName}*, your custom itinerary proposal \`VH-QUO-202611-0012\` is ready for review.\n\nTotal: *₹54,800*\nValid until: 30 Nov 2026\n\n👉 View Online: https://varniholidays.com/quotation/quo-123`
                  )
                }
                className="p-2.5 text-left rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] text-[#F4F4F2] transition-colors"
              >
                <span className="block font-semibold text-[#E9B95E] mb-0.5">📋 Quotation Ready</span>
                <span className="text-[10px] text-[#969CA5]">Online proposal link</span>
              </button>

              <button
                onClick={() =>
                  injectSimulatedNotification(
                    '✈️ *BON VOYAGE — TRIP HAS BEGUN!*',
                    `Dear *${customerName}*, your Kerala tour is officially underway!\n\nDriver: Suresh Nair (+91 94471 23456)\nVehicle: Innova Crysta (KL-07-CD-1234)\n\nOur 24x7 travel desk is available at +91 63570 50505.`
                  )
                }
                className="p-2.5 text-left rounded-xl bg-[#17191D] hover:bg-[#1D2127] border border-[#2A2E34] text-[#F4F4F2] transition-colors"
              >
                <span className="block font-semibold text-purple-400 mb-0.5">✈️ Bon Voyage</span>
                <span className="text-[10px] text-[#969CA5]">Voucher & Driver info</span>
              </button>
            </div>
          </div>

          {/* Recent CRM Bookings & Real-Time Sync View */}
          <div className="bg-[#111317] border border-[#2A2E34] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#F4F4F2] flex items-center gap-2 uppercase tracking-wider">
                <BookmarkCheck className="w-4 h-4 text-[#E9B95E]" />
                Live CRM Bookings
              </h2>
              <span className="text-[10px] text-[#969CA5]">Auto-syncs from Bot</span>
            </div>

            <div className="space-y-2">
              {recentBookings.length === 0 ? (
                <div className="text-xs text-[#969CA5] py-2">No bookings recorded yet. Use the bot to create one!</div>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-[#17191D] border border-[#2A2E34] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F4F4F2] flex items-center gap-2">
                        <span>{b.bookingReference}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#969CA5]">{b.customerName} • {b.serviceType} • ₹{b.totalAmountInr.toLocaleString('en-IN')}</div>
                    </div>
                    <Link
                      href={`/employee/bookings/${b.id}`}
                      className="text-[#969CA5] hover:text-[#E9B95E] p-1.5 transition-colors"
                      title="Open in CRM"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

