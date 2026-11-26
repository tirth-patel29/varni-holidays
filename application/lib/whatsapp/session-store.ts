/**
 * VARNI HOLIDAYS - WhatsApp Bot Session Store
 * Tracks active conversational state and context per user phone number.
 */

import { WhatsAppSessionData, BotFlowType } from './types';

class WhatsAppSessionStore {
  private sessions: Map<string, WhatsAppSessionData> = new Map();
  private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  public getSession(phone: string): WhatsAppSessionData {
    const cleanPhone = phone.replace(/\D/g, '');
    const now = Date.now();
    const existing = this.sessions.get(cleanPhone);

    if (existing) {
      if (now - existing.lastActivityAt > this.SESSION_TTL_MS) {
        // Session expired, start fresh
        return this.resetSession(cleanPhone);
      }
      existing.lastActivityAt = now;
      return existing;
    }

    const newSession: WhatsAppSessionData = {
      phone: cleanPhone,
      flow: 'IDLE',
      step: 'START',
      data: {},
      lastActivityAt: now,
    };
    this.sessions.set(cleanPhone, newSession);
    return newSession;
  }

  public updateSession(
    phone: string,
    updates: Partial<Omit<WhatsAppSessionData, 'phone'>>
  ): WhatsAppSessionData {
    const cleanPhone = phone.replace(/\D/g, '');
    const current = this.getSession(cleanPhone);
    const updated: WhatsAppSessionData = {
      ...current,
      ...updates,
      phone: cleanPhone,
      data: {
        ...current.data,
        ...(updates.data || {}),
      },
      lastActivityAt: Date.now(),
    };
    this.sessions.set(cleanPhone, updated);
    return updated;
  }

  public resetSession(phone: string, keepCustomerIdentity: boolean = true): WhatsAppSessionData {
    const cleanPhone = phone.replace(/\D/g, '');
    const existing = this.sessions.get(cleanPhone);
    const newSession: WhatsAppSessionData = {
      phone: cleanPhone,
      customerName: keepCustomerIdentity ? existing?.customerName : undefined,
      customerEmail: keepCustomerIdentity ? existing?.customerEmail : undefined,
      flow: 'IDLE',
      step: 'START',
      data: {},
      lastActivityAt: Date.now(),
    };
    this.sessions.set(cleanPhone, newSession);
    return newSession;
  }

  public setFlow(
    phone: string,
    flow: BotFlowType,
    step: string = 'START',
    initialData: Record<string, any> = {}
  ): WhatsAppSessionData {
    return this.updateSession(phone, {
      flow,
      step,
      data: initialData,
    });
  }
}

// Global singleton instance
export const waSessionStore = new WhatsAppSessionStore();

