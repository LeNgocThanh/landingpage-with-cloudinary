'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Cấu hình thông tin liên hệ ────────────────────────────────────────────
const CONTACT_CONFIG = {
  zaloPhone: '0966880820',                          // ← Thay số Zalo
  facebookPageUrl: 'https://www.facebook.com/share/14U4dvEbHb1/?mibextid=wwXIfr', // ← Thay link fanpage
  facebookMessengerUrl: 'https://m.me/your-page',    // ← Thay link Messenger
  googleMapsUrl: 'https://maps.app.goo.gl/BB99sDHzrXrMN5PY9', // ← Thay địa chỉ
};

const ITEMS = [
  {
    id: 'zalo',
    label: 'Zalo',
    color: '#0068FF',
    shadow: 'rgba(0,104,255,0.45)',
    href: () => `https://zalo.me/${CONTACT_CONFIG.zaloPhone}`,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <path d="M16 2C8.268 2 2 8.268 2 16C2 19.314 3.097 22.376 4.984 24.822L2.5 30.5L8.5 28.2C10.794 29.664 13.297 30.5 16 30.5C23.732 30.5 30 24.232 30 16.5C30 8.768 23.732 2.5 16 2.5L16 2Z" fill="white"/>
        <path d="M9 13.5H14M9 16H12.5M19.5 13.5C19.5 13.5 25.5 13.5 25.5 16C25.5 18.5 19.5 18.5 19.5 18.5H25.5M19.5 13.5V18.5" stroke="#0068FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bg: '#0068FF',
  },
  {
    id: 'fanpage',
    label: 'Fanpage',
    color: '#1877F2',
    shadow: 'rgba(24,119,242,0.45)',
    href: () => CONTACT_CONFIG.facebookPageUrl,
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M20 4H17C14.791 4 13 5.791 13 8V11H10V15H13V28H17V15H20L21 11H17V8C17 7.448 17.448 7 18 7H21V4H20Z"/>
      </svg>
    ),
    bg: '#1877F2',
  },
  {
    id: 'messenger',
    label: 'Nhắn tin',
    color: '#0099FF',
    shadow: 'rgba(0,153,255,0.45)',
    href: () => CONTACT_CONFIG.facebookMessengerUrl,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <path d="M16 3C8.82 3 3 8.41 3 15C3 18.59 4.72 21.8 7.42 23.98V28L11.44 25.8C12.88 26.24 14.41 26.48 16 26.48C23.18 26.48 29 21.07 29 14.48C29 7.89 23.18 3 16 3Z" fill="white"/>
        <path d="M8.5 18.5L13.5 13L17 16.5L22 13L17 18.5L13.5 15L8.5 18.5Z" fill="#0099FF"/>
      </svg>
    ),
    bg: 'linear-gradient(135deg, #00B2FF, #006AFF)',
  },
  {
    id: 'maps',
    label: 'Tìm đường',
    color: '#EA4335',
    shadow: 'rgba(234,67,53,0.45)',
    href: () => CONTACT_CONFIG.googleMapsUrl,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <path d="M16 3C11.029 3 7 7.029 7 12C7 18.5 16 29 16 29C16 29 25 18.5 25 12C25 7.029 20.971 3 16 3Z" fill="white"/>
        <circle cx="16" cy="12" r="3" fill="#EA4335"/>
      </svg>
    ),
    bg: '#EA4335',
  },
];

// Góc bung ra (từ 90° đến 180° — bung lên-trái)
const ANGLES = [105, 140, 165, 195];

interface ContactSpeedDialProps {
  // Có thể dùng standalone hoặc controlled từ ngoài
  isOpen?: boolean;
  onToggle?: () => void;
  // Standalone mode: tự quản lý state
  standalone?: boolean;
}

export default function ContactSpeedDial({
  isOpen: controlledOpen,
  onToggle,
  standalone = true,
}: ContactSpeedDialProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isOpen = standalone ? internalOpen : (controlledOpen ?? false);
  const toggle = standalone ? () => setInternalOpen(o => !o) : (onToggle ?? (() => {}));

  // Click outside để đóng
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        standalone ? setInternalOpen(false) : onToggle?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, standalone, onToggle]);

  const RADIUS = 76; // px, khoảng cách từ nút chính

  return (
    <div ref={ref} className="fixed bottom-6 right-5 z-50" style={{ width: 56, height: 56 }}>

      {/* Backdrop mờ nhẹ khi mở */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={toggle}
        />
      )}

      {/* Các nút con */}
      {ITEMS.map((item, i) => {
        const angleDeg = ANGLES[i];
        const rad = (angleDeg * Math.PI) / 180;
        const x = isOpen ? -Math.cos(rad) * RADIUS : 0;
        const y = isOpen ? -Math.sin(rad) * RADIUS : 0;

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              bottom: 0,
              right: 0,
              width: 48,
              height: 48,
              transform: `translate(${x}px, ${y}px)`,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? 'auto' : 'none',
              transition: `transform 320ms cubic-bezier(0.34,1.56,0.64,1) ${i * 45}ms, opacity 220ms ease ${i * 45}ms`,
              zIndex: 10,
            }}
          >
            {/* Label tooltip */}
            <span
              className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold text-white px-2.5 py-1 rounded-full pointer-events-none select-none"
              style={{
                background: item.color,
                boxShadow: `0 2px 10px ${item.shadow}`,
                opacity: isOpen ? 1 : 0,
                transition: `opacity 180ms ease ${i * 45 + 120}ms`,
              }}
            >
              {item.label}
            </span>

            {/* Icon button */}
            <a
              href={item.href()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => standalone ? setInternalOpen(false) : onToggle?.()}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95"
              style={{
                background: item.bg,
                boxShadow: `0 4px 18px ${item.shadow}`,
              }}
              aria-label={item.label}
            >
              {item.icon}
            </a>
          </div>
        );
      })}

      {/* Nút chính */}
      <button
        onClick={toggle}
        aria-label="Liên hệ"
        className="w-14 h-14 rounded-full flex items-center justify-center text-white relative z-20 transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #374151, #1f2937)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: isOpen
            ? '0 6px 24px rgba(0,0,0,0.35)'
            : '0 6px 24px rgba(99,102,241,0.55)',
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}
      >
        {/* Animate giữa icon chat và X */}
        <span
          className="absolute transition-all duration-300"
          style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}
        >
          {/* Chat bubble icon */}
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </span>
        <span
          className="absolute transition-all duration-300"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)' }}
        >
          {/* X icon */}
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </span>
      </button>

      {/* Label "Liên hệ" khi đóng */}
      {!isOpen && (
        <span
          className="absolute -top-7 right-0 text-xs font-semibold text-white px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap"
          style={{
            background: 'rgba(99,102,241,0.88)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}
        >
          Liên hệ
        </span>
      )}
    </div>
  );
}
