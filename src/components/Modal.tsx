"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Product, products } from "@/data/products";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const onboardingSteps = [
  {
    id: "intent",
    title: "¿Qué quieres pillar?",
    subtitle: "Armamos tu radar según lo que más te conviene.",
    options: ["Montar mi piso", "Ahorrar dinero", "Revender", "Reutilizar"],
  },
  {
    id: "category",
    title: "¿Qué buscas primero?",
    subtitle: "Priorizamos los hallazgos que desaparecen más rápido.",
    options: ["Muebles", "Electrodomésticos", "Bicis", "Bebé", "Electrónica"],
  },
  {
    id: "distance",
    title: "¿Hasta dónde te moverías?",
    subtitle: "Las mejores oportunidades no siempre están a dos calles.",
    options: ["Caminando", "10 min en coche", "Si vale la pena", "Depende del objeto"],
  },
];

const benefits = [
  "Dirección completa de cada artículo",
  "Contacto directo del donante por teléfono o WhatsApp",
  "Nuevos artículos cada hora",
  "Cancela cuando quieras, sin permanencia",
];

const CHECKOUT_URL = "https://buy.stripe.com/bJeaEZ0KcfCx6ju25tbfO0g";

export default function Modal({ isOpen, onClose, product }: ModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const questionStep = step > 0 && step <= onboardingSteps.length;
  const resultStep = onboardingSteps.length + 1;
  const paywallStep = onboardingSteps.length + 2;
  const currentStep = questionStep ? onboardingSteps[step - 1] : undefined;
  const selectedAnswer = currentStep ? answers[currentStep.id] : "";
  const canContinue = !currentStep || Boolean(selectedAnswer);
  const previewProducts = products.slice(0, 4);
  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const showEmailError = emailTouched && !isEmailValid;

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const summary = useMemo(() => {
    const category = answers.category || "Muebles";
    const intent = answers.intent || "Ahorrar dinero";
    const distance = answers.distance || "Si vale la pena";

    return { category, intent, distance };
  }, [answers]);

  const selectAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const goNext = () => {
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, paywallStep));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const buildCheckout = () => {
    const prefix = product ? `product_${product.id}` : "radar";
    const checkoutReference = `${prefix}_${Date.now().toString(36)}`;
    const checkoutUrl = new URL(CHECKOUT_URL);
    checkoutUrl.searchParams.set("prefilled_email", normalizedEmail);
    checkoutUrl.searchParams.set("client_reference_id", checkoutReference);

    const intent = product
      ? {
          kind: "product",
          email: normalizedEmail,
          checkoutReference,
          productId: product.id,
          title: product.title,
          image: product.image,
          location: product.location,
          timeAgo: product.timeAgo,
          source: product.source,
          sourceUrl: product.sourceUrl,
          savedAt: new Date().toISOString(),
        }
      : {
          kind: "radar",
          email: normalizedEmail,
          checkoutReference,
          savedAt: new Date().toISOString(),
        };

    window.localStorage.setItem("pillalo:checkout-intent", JSON.stringify(intent));
    return checkoutUrl.toString();
  };

  const handleCheckout = () => {
    setEmailTouched(true);
    if (!isEmailValid) return;

    window.location.href = buildCheckout();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-slate-600"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {product && (
          <div className="pt-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                  priority
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#00C978] px-3 py-1 text-xs font-black text-[#07110C] shadow-sm">
                  Disponible ahora
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-[#07110C] px-3 py-1 text-xs font-black text-white shadow-sm">
                  0€
                </span>
              </div>
              <div className="p-4">
                <h2 className="pr-7 text-2xl font-black leading-tight text-slate-950">
                  {product.title}
                </h2>
                <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                  <span>📍 {product.location}</span>
                  <span>{product.timeAgo}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <strong>Este hallazgo puede desaparecer pronto.</strong> Desbloquea los datos para reclamarlo y activa alertas para productos similares.
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-slate-950">
              Reclama este producto y los próximos parecidos
            </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
              El acceso incluye el enlace original y los detalles para intentar reclamar este hallazgo, además de alertas instantáneas cuando aparezcan oportunidades similares.
            </p>

            <div className="mt-5 grid gap-2.5">
              {[
                "Enlace real de la publicación",
                "Zona y detalles publicados para coordinar recogida",
                "Alertas de productos similares en Madrid",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00C978] text-xs font-black text-[#07110C]">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-slate-900">
                4,99 <span className="text-lg font-semibold text-slate-500">€/mes</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Este producto + alertas similares · Cancela cuando quieras</p>
            </div>

            <div className="mt-5">
              <label htmlFor="checkout-email-product" className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email para tu acceso
              </label>
              <input
                id="checkout-email-product"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-950 outline-none transition-colors ${
                  showEmailError
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white focus:border-[#00C978] focus:bg-emerald-50/30"
                }`}
              />
              {showEmailError && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  Escribe un email válido para enviarte el acceso.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 block w-full rounded-xl bg-[#00C978] py-3.5 text-center text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F]"
            >
              Reclamarlo →
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Pago seguro con Stripe · Sin permanencia
            </p>
            {product.sourceUrl && (
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Fuente real detectada en {product.source}
              </p>
            )}
          </div>
        )}

        {!product && step === 0 && (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#DFFFEF] via-white to-emerald-50 px-4 pb-5 pt-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(0,201,120,0.24),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(0,224,138,0.22),transparent_28%)]" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#00A965]">
                    Gratis cerca
                  </span>
                  <span className="text-xs font-bold text-slate-500">Madrid</span>
                </div>

                <div className="relative mx-auto h-52 max-w-[310px]">
                  <div className="absolute left-2 top-3 z-10 w-36 rotate-[-5deg] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 animate-float-slow">
                    <div className="relative h-24 w-full">
                      <Image
                        src={previewProducts[0].image}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="max-w-20 truncate text-xs font-black text-slate-950">
                        {previewProducts[0].title}
                      </span>
                      <span className="rounded-full bg-[#DFFFEF] px-2 py-0.5 text-[10px] font-black text-[#00A965]">
                        GRATIS
                      </span>
                    </div>
                  </div>

                  <div className="absolute right-0 top-10 z-20 w-40 rotate-[4deg] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-float-soft">
                    <div className="relative h-28 w-full">
                      <Image
                        src={previewProducts[1].image}
                        alt=""
                        fill
                        sizes="170px"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="max-w-20 truncate text-xs font-black text-slate-950">
                        {previewProducts[1].title}
                      </span>
                      <span className="rounded-full bg-[#DFFFEF] px-2 py-0.5 text-[10px] font-black text-[#00A965]">
                        GRATIS
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-10 z-30 w-44 rotate-[-2deg] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-float-slow">
                    <div className="absolute right-2 top-2 z-10 rounded-full bg-[#07110C] px-2.5 py-1 text-xs font-black text-white shadow-lg">
                      0€
                    </div>
                    <div className="relative h-28 w-full">
                      <Image
                        src={previewProducts[3].image}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="max-w-24 truncate text-xs font-black text-slate-950">
                        {previewProducts[3].title}
                      </span>
                      <span className="rounded-full bg-[#DFFFEF] px-2 py-0.5 text-[10px] font-black text-[#00A965]">
                        HOY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pr-7">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950">
                Pilla cosas gratis antes de que desaparezcan
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Muebles, bicis y electrodomésticos cerca de ti. Creamos un radar según lo que buscas.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 px-2 py-3">
                <p className="text-lg font-black text-slate-950">14</p>
                <p className="text-[11px] font-bold text-slate-500">hallazgos</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-2 py-3">
                <p className="text-lg font-black text-slate-950">3</p>
                <p className="text-[11px] font-bold text-slate-500">hoy</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-2 py-3">
                <p className="text-lg font-black text-slate-950">0€</p>
                <p className="text-[11px] font-bold text-slate-500">precio</p>
              </div>
            </div>

            <button
              onClick={goNext}
              className="mt-6 w-full rounded-xl bg-[#00C978] px-4 py-3.5 text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F]"
            >
              Ver qué puedo pillar →
            </button>
          </>
        )}

        {!product && questionStep && currentStep && (
          <>
            <div className="mb-5 flex items-center gap-2 pr-8">
              {onboardingSteps.map((item, index) => (
                <span
                  key={item.id}
                  className={`h-2 flex-1 rounded-full ${
                    index < step ? "bg-[#00C978]" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#00A965]">
              Radar personal
            </p>
            <h2 className="pr-7 text-2xl font-extrabold leading-tight text-slate-950">
              {currentStep.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {currentStep.subtitle}
            </p>

            <div className="mt-6 grid gap-2.5">
              {currentStep.options.map((option) => {
                const isSelected = selectedAnswer === option;

                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(currentStep.id, option)}
                    className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                      isSelected
                        ? "border-[#00C978] bg-emerald-50 text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                        isSelected
                          ? "border-[#00C978] bg-[#00C978] text-[#07110C]"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={goNext}
                disabled={!canContinue}
                className="flex-1 rounded-xl bg-[#00C978] px-4 py-3 text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {!product && step === resultStep && (
          <>
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">
              <strong>Tu radar está listo.</strong> Encontramos oportunidades que encajan contigo.
            </div>

            <h2 className="pr-7 text-2xl font-extrabold leading-tight text-slate-950">
              {summary.category} gratis cerca de Madrid
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Priorizaremos hallazgos para <strong>{summary.intent.toLowerCase()}</strong> y radio <strong>{summary.distance.toLowerCase()}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Encontramos
                  </p>
                  <p className="mt-1 text-4xl font-black text-slate-950">14</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#00A965]">3 nuevas hoy</p>
                  <p className="text-xs text-slate-500">Se reclaman rápido</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700">
                <span className="rounded-lg bg-white px-2 py-2">Sofás</span>
                <span className="rounded-lg bg-white px-2 py-2">Bicis</span>
                <span className="rounded-lg bg-white px-2 py-2">Lavadoras</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={goBack}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Atrás
              </button>
              <button
                onClick={goNext}
                className="flex-1 rounded-xl bg-[#00C978] px-4 py-3 text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F]"
              >
                Activar radar →
              </button>
            </div>
          </>
        )}

        {!product && step === paywallStep && (
          <div className="pt-8">
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 pr-8 text-sm text-amber-800">
              <strong>Los artículos se agotan rápido.</strong> Activa alertas instantáneas para llegar antes.
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Acceso completo a tu radar de hallazgos
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              <strong>Recibe:</strong> dirección completa + contacto del donante para cada artículo disponible en tu zona.
            </p>

            <ul className="mt-5 space-y-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00C978] text-[#07110C] text-xs font-bold">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-slate-900">
                4,99 <span className="text-lg font-semibold text-slate-500">€/mes</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Cancela cuando quieras · Sin permanencia</p>
            </div>

            <div className="mt-5">
              <label htmlFor="checkout-email-radar" className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email para activar tu radar
              </label>
              <input
                id="checkout-email-radar"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-950 outline-none transition-colors ${
                  showEmailError
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white focus:border-[#00C978] focus:bg-emerald-50/30"
                }`}
              />
              {showEmailError && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  Escribe un email válido para enviarte el acceso.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 block w-full rounded-xl bg-[#00C978] py-3.5 text-center text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F]"
            >
              Activar alertas por 4,99€/mes →
            </button>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
              <span>💳 Pago 100% seguro (Stripe)</span>
              <span>✋ Cancela cuando quieras</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
