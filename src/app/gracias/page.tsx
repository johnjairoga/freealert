"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/data/products";

type CheckoutIntent =
  | {
      kind: "product";
      productId: number;
      title: string;
      image: string;
      location: string;
      timeAgo: string;
      source?: string;
      sourceUrl?: string;
      savedAt: string;
    }
  | {
      kind: "radar";
      savedAt: string;
    };

function readIntent() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("pillalo:checkout-intent");
    return raw ? (JSON.parse(raw) as CheckoutIntent) : null;
  } catch {
    return null;
  }
}

export default function GraciasPage() {
  const [intent] = useState<CheckoutIntent | null>(() => readIntent());

  const selectedProduct = useMemo(() => {
    if (intent?.kind !== "product") return products[0];
    return products.find((product) => product.id === intent.productId) || {
      id: intent.productId,
      title: intent.title,
      image: intent.image,
      location: intent.location,
      timeAgo: intent.timeAgo,
      badge: "Acceso",
      badgeType: "available" as const,
      source: intent.source,
      sourceUrl: intent.sourceUrl,
      isReal: true,
    };
  }, [intent]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="text-sm font-extrabold text-[#00A965]">
            Píllalo
          </Link>
          <span className="rounded-full bg-[#DFFFEF] px-3 py-1 text-xs font-black text-[#00A965]">
            Acceso activo
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-wide text-[#00A965]">
            Siguiente paso
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight">
            Reclama este hallazgo ahora
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Abre la publicación original, confirma que sigue disponible y escribe al anunciante para coordinar la recogida. Los artículos gratis pueden desaparecer rápido.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.title}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
                priority
              />
              <span className="absolute right-3 top-3 rounded-full bg-[#07110C] px-3 py-1 text-xs font-black text-white">
                0€
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-black leading-tight">
                {selectedProduct.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {selectedProduct.location} · {selectedProduct.timeAgo}
              </p>
            </div>
          </div>

          {selectedProduct.sourceUrl ? (
            <a
              href={selectedProduct.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-xl bg-[#00C978] px-4 py-3.5 text-center text-sm font-extrabold text-[#07110C] shadow-lg transition-colors hover:bg-[#00B86F]"
            >
              Abrir publicación original →
            </a>
          ) : (
            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
              No encontramos el enlace original en este navegador. Vuelve al radar y abre el producto otra vez.
            </div>
          )}

          <div className="mt-5 grid gap-2.5">
            {[
              "Mensaje sugerido: Hola, me interesa. ¿Sigue disponible para recoger hoy?",
              "Si no responde, vuelve al radar y reclama otro parecido.",
              "No pagues nada fuera de la app: estos hallazgos deben ser gratis.",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
