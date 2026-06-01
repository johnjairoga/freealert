"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Cómo consigues la información de objetos gratuitos?",
    a: "Monitorizamos múltiples fuentes públicas en Madrid: grupos de Facebook, tablones de Wallapop con precio 0, Idealista y anuncios en portales vecinales. Todo de forma automática y en tiempo real.",
  },
  {
    q: "¿Los artículos son realmente gratuitos?",
    a: "Sí. Solo publicamos artículos marcados explícitamente como gratuitos por sus dueños. No cobramos nada por el artículo en sí — la suscripción es únicamente para acceder a la información de ubicación.",
  },
  {
    q: "¿Puedo cancelar mi suscripción cuando quiera?",
    a: "Por supuesto. No hay permanencia ni penalización. Puedes cancelar desde tu panel de usuario con un clic, en cualquier momento. Si cancelas, mantienes el acceso hasta el final del período ya pagado.",
  },
  {
    q: "¿Solo funcionáis en Madrid?",
    a: "De momento sí, Madrid es nuestra ciudad de lanzamiento. Estamos trabajando para expandirnos a Barcelona, Valencia y Sevilla próximamente. Únete ahora para ser el primero en saberlo.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
          Preguntas frecuentes
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 overflow-hidden bg-white"
            >
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                {faq.q}
                <span className={`ml-4 shrink-0 text-[#00A965] transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
