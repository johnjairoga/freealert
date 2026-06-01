import Image from "next/image";
import { productDataMeta, products } from "@/data/products";

interface HeroProps {
  onOpenModal: () => void;
}

export default function Hero({ onOpenModal }: HeroProps) {
  const freshCount = products.filter((product) => !product.timeAgo.includes("día")).length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-[#D9FFE8] py-10 sm:py-14">
      {/* Background decoration blobs */}
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-100 opacity-30 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-100 opacity-30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Left: Text content */}
          <div>
            {/* Live badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-[#07110C]">
              <span className="h-2 w-2 rounded-full bg-[#00C978] animate-pulse" />
              En directo · Madrid
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Consigue muebles y electrodomésticos{" "}
              <span className="text-[#00A965]">
                gratis en España
              </span>
            </h1>

            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Armarios, sofás, lavadoras, bicicletas. Detectamos publicaciones reales para que llegues antes.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href="#catalogo"
                className="rounded-full bg-[#00C978] px-8 py-3.5 text-base font-extrabold text-[#07110C] hover:bg-[#00B86F] transition-all shadow-lg hover:-translate-y-0.5"
              >
                Ver oportunidades disponibles →
              </a>
              <a
                href="#como-funciona"
                className="rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cómo funciona
              </a>
            </div>

            {/* Stats bar */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-600">
              <span>🔥 <strong className="text-slate-900">{productDataMeta.count || products.length}</strong> oportunidades</span>
              <span className="text-slate-300">|</span>
              <span>⚡ <strong className="text-slate-900">{freshCount}</strong> recientes</span>
              <span className="text-slate-300">|</span>
              <span>📍 <strong className="text-slate-900">Madrid</strong></span>
            </div>
          </div>

          {/* Right: Product grid collage (desktop only) */}
          <div className="hidden lg:grid grid-cols-3 gap-3">
            {/* Real product images - first 9 products */}
            {products.slice(0, 9).map((product, i) => (
              <div
                key={product.id}
                className="relative h-32 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1 + i % 2)}deg)`,
                }}
                onClick={onOpenModal}
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 180px, 0px"
                  priority={i < 3}
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
