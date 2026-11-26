'use client';

import React, { useState, useEffect } from 'react';
import ChatbotLauncher from './ChatbotLauncher';
import ChatbotWindow from './ChatbotWindow';

const STORAGE_KEY = 'varni_chatbot_state_v1';

export default function WebsiteChatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showGreeting, setShowGreeting] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isOpen === 'boolean') {
          setIsOpen(parsed.isOpen);
        }
        if (typeof parsed.greetingDismissed === 'boolean' && parsed.greetingDismissed) {
          setShowGreeting(false);
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isOpen, greetingDismissed: !showGreeting })
      );
    } catch {
      // Ignore storage errors
    }
  }, [isOpen, showGreeting, mounted]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0);
      setShowGreeting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  const handleDismissGreeting = () => {
    setShowGreeting(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating launcher trigger */}
      <ChatbotLauncher
        isOpen={isOpen}
        onToggle={handleToggle}
        showGreeting={showGreeting}
        onDismissGreeting={handleDismissGreeting}
        unreadCount={unreadCount}
      />

      {/* Floating chat window */}
      <ChatbotWindow
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />
    </>
  );
}
