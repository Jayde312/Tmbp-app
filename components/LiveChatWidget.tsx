"use client";

import { useState } from "react";

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.9 3.2 18.5 20c-.26 1.19-.97 1.48-1.97.92l-5.43-4-2.62 2.52c-.29.29-.53.53-1.09.53l.39-5.52 10.05-9.08c.44-.39-.1-.61-.68-.22L4.73 12.2l-5.38-1.68c-1.17-.37-1.19-1.17.24-1.73L20.62.81c.98-.36 1.84.24 1.28 2.39Z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function ChatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

interface LiveChatWidgetProps {
  /** Livechat Telegram URL (e.g. https://t.me/yourhandle) */
  telegramUrl: string;
  /** Livechat WhatsApp URL (e.g. https://wa.me/1234567890) */
  whatsappUrl: string;
  agentName: string;
  /** Toggle the Telegram button on/off. Defaults to true. */
  telegramEnabled?: boolean;
  /** Toggle the WhatsApp button on/off. Defaults to true. */
  whatsappEnabled?: boolean;
}

export default function LiveChatWidget({
  telegramUrl,
  whatsappUrl,
  agentName,
  telegramEnabled = true,
  whatsappEnabled = true,
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayName =
    agentName && agentName.trim() !== "" ? agentName : "our support team";

  const hasTelegram = telegramEnabled && telegramUrl.trim() !== "";
  const hasWhatsApp = whatsappEnabled && whatsappUrl.trim() !== "";

  // Nothing configured → render nothing
  if (!hasTelegram && !hasWhatsApp) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .lc-widget {
              position: fixed;
              right: 24px;
              bottom: 24px;
              z-index: 100;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 16px;
              font-family: var(--font-body), sans-serif;
            }

            .lc-card {
              width: 300px;
              background: #0f1d38;
              border: 1px solid rgba(45, 212, 191, 0.2);
              border-radius: 16px;
              padding: 20px;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
              backdrop-filter: blur(12px);
              color: #e0f2f1;
              position: relative;
              transform-origin: bottom right;
              animation: lc-popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @keyframes lc-popIn {
              0%   { opacity: 0; transform: scale(0.9) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }

            .lc-close {
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(255, 255, 255, 0.05);
              border: none;
              color: #A2C2BF;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .lc-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

            .lc-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            }

            .lc-avatar {
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: linear-gradient(135deg, #2dd4bf, #0ea5e9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              flex-shrink: 0;
              box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
            }

            .lc-title {
              font-size: 15px;
              font-weight: 700;
              color: #fff;
              margin-bottom: 2px;
              line-height: 1.2;
            }

            .lc-subtitle {
              font-size: 12px;
              color: #2dd4bf;
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 600;
            }
            .lc-subtitle::before {
              content: "";
              width: 6px;
              height: 6px;
              background: #4ade80;
              border-radius: 50%;
              display: inline-block;
            }

            .lc-body {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 12px;
              padding: 14px;
              margin-bottom: 16px;
              border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .lc-message {
              margin: 0;
              font-size: 14px;
              line-height: 1.5;
              color: #e0f2f1;
            }
            .lc-message strong { color: #2dd4bf; }

            .lc-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              width: 100%;
              padding: 14px;
              color: white;
              border-radius: 12px;
              text-decoration: none;
              font-size: 14px;
              font-weight: 700;
              transition: all 0.2s;
              border: none;
              cursor: pointer;
            }
            .lc-btn + .lc-btn { margin-top: 10px; }

            .lc-btn--telegram {
              background: #229ED9;
              box-shadow: 0 4px 14px rgba(34, 158, 217, 0.4);
            }
            .lc-btn--telegram:hover {
              background: #1b88bd;
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(34, 158, 217, 0.5);
            }

            .lc-btn--whatsapp {
              background: #25D366;
              box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
            }
            .lc-btn--whatsapp:hover {
              background: #1eb455;
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
            }

            .lc-trigger {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: linear-gradient(135deg, #2dd4bf, #0ea5e9);
              color: white;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 30px rgba(45, 212, 191, 0.4);
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              position: relative;
              z-index: 101;
            }
            .lc-trigger:hover {
              transform: scale(1.05);
              box-shadow: 0 12px 35px rgba(45, 212, 191, 0.5);
            }

            .lc-trigger.is-open {
              background: #0f1d38;
              border: 1px solid rgba(45, 212, 191, 0.3);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .lc-trigger.is-open:hover { background: #132444; }

            .lc-pulse {
              position: absolute;
              top: 0; left: 0;
              width: 100%; height: 100%;
              border-radius: 50%;
              background: rgba(45, 212, 191, 0.4);
              z-index: -1;
              animation: lc-pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            }
            .lc-trigger.is-open .lc-pulse { display: none; }

            @keyframes lc-pulse-ring {
              0%        { transform: scale(0.8); opacity: 0.8; }
              80%, 100% { transform: scale(1.4); opacity: 0;   }
            }

            @media (max-width: 480px) {
              .lc-widget { right: 16px; bottom: 16px; }
              .lc-card   { width: calc(100vw - 40px); max-width: 320px; }
              .lc-trigger{ width: 56px; height: 56px; }
            }
          `,
        }}
      />

      <div className="lc-widget">
        {isOpen && (
          <div className="lc-card">
            <button
              className="lc-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat menu"
            >
              <CloseIcon />
            </button>

            <div className="lc-header">
              <div className="lc-avatar">
                <ChatIcon size={22} />
              </div>
              <div>
                <div className="lc-title">Live Support</div>
                <div className="lc-subtitle">Usually replies instantly</div>
              </div>
            </div>

            <div className="lc-body">
              <p className="lc-message">
                Chat with <strong>{displayName}</strong> — pick your preferred app below.
              </p>
            </div>

            {hasTelegram && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lc-btn lc-btn--telegram"
                onClick={() => setIsOpen(false)}
              >
                <TelegramIcon size={18} />
                <span>Message on Telegram</span>
              </a>
            )}

            {hasWhatsApp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lc-btn lc-btn--whatsapp"
                onClick={() => setIsOpen(false)}
              >
                <WhatsAppIcon size={18} />
                <span>Message on WhatsApp</span>
              </a>
            )}
          </div>
        )}

        <button
          className={`lc-trigger ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open live chat options"
        >
          {isOpen ? <CloseIcon size={24} /> : <ChatIcon size={26} />}
          <span className="lc-pulse" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
