import { products } from "@/data/products";
import ProductCard from "./ProductCard";

const VISIBLE_COUNT = 8;

interface ProductGridProps {
  onOpenModal: () => void;
}

export default function ProductGrid({ onOpenModal }: ProductGridProps) {
  const visibleProducts = products.slice(0, VISIBLE_COUNT);
  const hiddenCount = products.length - VISIBLE_COUNT;

  return (
    <section id="catalogo" className="py-8 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Disponibles ahora en Madrid
          </h2>
          <span className="text-xs text-slate-500">
            {visibleProducts.length} visible • +{hiddenCount} bloqueados
          </span>
        </div>

        {/* Grid with visible products + lock overlay */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {/* Visible products */}
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={onOpenModal}
              />
            ))}
          </div>

          {/* Lock overlay hint */}
          {hiddenCount > 0 && (
            <div className="mt-6 text-center p-6 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
              <div className="text-5xl mb-3">⚡</div>
              <p className="font-extrabold text-lg text-red-900">+{hiddenCount} artículos más se agotan HOY</p>
              <p className="text-sm text-red-700 mt-2 font-semibold">Nuevos cada hora • Se llevan en minutos</p>
              <p className="text-xs text-red-600 mt-3">Acceso a 350+ oportunidades gratis cada mes</p>
              <button
                onClick={onOpenModal}
                className="mt-4 rounded-full bg-red-600 px-8 py-3 text-base font-extrabold text-white hover:bg-red-700 transition-colors shadow-lg hover:-translate-y-0.5"
              >
                Llamar ahora →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
