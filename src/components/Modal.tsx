"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const benefits = [
    "🔗 Dirección completa de cada artículo",
    "📱 Contacto directo del donante (teléfono/WhatsApp)",
    "⏰ Nuevos artículos cada hora",
    "🏘️ Canal privado en Telegram con 1.200+ usuarios",
    "✋ Cancela cuando quieras, sin permanencia",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-xl transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Urgency header */}
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          ⚠️ <strong>Los artículos se agotan rápido — accede ahora</strong>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Acceso completo a todos los artículos gratis
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          <strong>Recibe:</strong> Dirección completa + contacto del donante para cada artículo disponible en tu zona.
        </p>

        {/* Benefits */}
        <ul className="mt-5 space-y-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white text-xs font-bold">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
          <div className="text-3xl font-extrabold text-slate-900">
            4,99 <span className="text-lg font-semibold text-slate-500">€/mes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Cancela cuando quieras · Sin permanencia</p>
        </div>

        {/* CTA */}
        <a
          href="https://buy.stripe.com/bJeaEZ0KcfCx6ju25tbfO0g"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center rounded-xl bg-[#10B981] py-3.5 text-sm font-bold text-white hover:bg-[#059669] transition-colors shadow-lg"
        >
          Llamar ahora por 4,99€/mes →
        </a>

        {/* Trust signals */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>💳 Pago 100% seguro (Stripe)</span>
          <span>✋ Cancela cuando quieras</span>
          <span>📱 Telegram privado</span>
        </div>
      </div>
    </div>
  );
}
