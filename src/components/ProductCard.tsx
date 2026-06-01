import Image from "next/image";
import { Product } from "@/data/products";

const badgeStyles: Record<Product['badgeType'], string> = {
  new: "bg-green-100 text-green-700",
  hot: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
  available: "bg-emerald-100 text-emerald-700",
  time: "bg-cyan-100 text-cyan-700",
};

interface ProductCardProps {
  product: Product;
  onOpenModal: () => void;
}

export default function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const hasImage = Boolean(product.image);

  return (
    <article
      onClick={onOpenModal}
      className="group cursor-pointer rounded-lg bg-white shadow-sm border border-slate-100 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 flex-shrink-0">
        {hasImage ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-black text-[#00A965]">
            0€
          </div>
        )}
        <span className={`absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shadow-sm ${badgeStyles[product.badgeType]}`}>
          {product.badge}
        </span>
      </div>
      <div className="p-3 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="min-h-[2.5rem] font-extrabold text-slate-900 text-sm leading-tight line-clamp-2">
            {product.title}
          </h3>
          <div className="mt-2 grid gap-1 text-xs text-slate-500">
            <span className="flex min-w-0 items-center gap-1">
              <span aria-hidden="true">📍</span>
              <span className="truncate">{product.location}</span>
            </span>
            <span className="font-semibold text-slate-600">{product.timeAgo}</span>
          </div>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpenModal();
          }}
          className="mt-3 w-full rounded-lg bg-[#00C978] px-2 py-2.5 text-[11px] font-extrabold leading-none text-[#07110C] hover:bg-[#00B86F] transition-colors shadow-sm"
        >
          Reclamarlo
        </button>
      </div>
    </article>
  );
}
