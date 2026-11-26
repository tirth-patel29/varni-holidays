'use client';

import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { CHATBOT_CONFIG } from '@/lib/chatbot/config';

interface ChatbotLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  showGreeting: boolean;
  onDismissGreeting: () => void;
  unreadCount?: number;
}

export default function ChatbotLauncher({
  isOpen,
  onToggle,
  showGreeting,
  onDismissGreeting,
  unreadCount = 0,
}: ChatbotLauncherProps) {
  return (
    <aside
      aria-label="Chatbot Support"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none"
    >
      {/* Floating Greeting Toast */}
      {!isOpen && showGreeting && (
        <div
          role="region"
          aria-label="Chatbot Welcome Greeting"
          className="pointer-events-auto mb-3 max-w-[280px] sm:max-w-xs bg-white text-[#153650] border border-[#E5E8ED] shadow-xl p-3.5 rounded-2xl rounded-br-xs animate-in fade-in slide-in-from-bottom-3 duration-300 relative group transition-all"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismissGreeting();
            }}
            aria-label="Dismiss greeting"
            className="absolute -top-2 -left-2 w-5 h-5 bg-[#718096] text-white hover:bg-[#153650] rounded-full flex items-center justify-center text-[10px] transition-colors shadow-xs"
          >
            <X size={11} />
          </button>

          <div
            onClick={onToggle}
            className="cursor-pointer flex items-start gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#153650] text-[#E9B95E] flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              VH
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#153650]">
                  {CHATBOT_CONFIG.brandName}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#168653] animate-pulse" />
              </div>
              <p className="text-[12px] text-[#4A5568] mt-0.5 leading-snug">
                {CHATBOT_CONFIG.launcherGreeting}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#24689B] group-hover:text-[#153650]">
                <span>Tap to chat with travel desk</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close Varni Holidays Chat' : 'Open Varni Holidays Chat'}
        aria-expanded={isOpen}
        className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#153650] text-white shadow-2xl hover:bg-[#1e4668] active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/80 group focus:outline-none focus:ring-4 focus:ring-[#153650]/30"
      >
        {/* Glow effect on hover */}
        <span className="absolute inset-0 rounded-full bg-[#E9B95E]/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />

        {/* Live Green Online Indicator Badge */}
        {!isOpen && (
          <span
            className="absolute top-0 right-0 w-4 h-4 bg-[#168653] border-2 border-white rounded-full flex items-center justify-center shadow-xs"
            title="Online"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
          </span>
        )}

        {/* Unread Counter Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 bg-[#D54747] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}

        {/* Dynamic Icon */}
        <div className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <X size={26} className="text-white transition-transform rotate-0 group-hover:rotate-90 duration-300" />
          ) : (
            <MessageSquare size={26} className="text-[#E9B95E] transition-transform group-hover:scale-110" />
          )}
        </div>
      </button>
    </aside>
  );
}
