import scrapedProducts from "./scraped-products.json";
import marketplaceProducts from "./marketplace-products.json";

export type BadgeType = 'new' | 'hot' | 'urgent' | 'available' | 'time';
export type ProductQuality = "high" | "medium" | "low";

export interface Product {
  id: number;
  title: string;
  image: string;
  location: string;
  timeAgo: string;
  badge: string;
  badgeType: BadgeType;
  source?: string;
  sourceUrl?: string;
  description?: string;
  detectedAt?: string;
  quality?: ProductQuality;
  isReal?: boolean;
}

const fallbackProducts: Product[] = [
  {
    id: 1,
    title: "Bici eléctrica Dakota",
    image: "/images/bicicleta electrica dakota.jpg",
    location: "Madrid",
    timeAgo: "hace 6 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 2,
    title: "Sofá gris GRATIS",
    image: "/images/sofa.jpg",
    location: "Madrid",
    timeAgo: "hace 18 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
  {
    id: 3,
    title: "Refrigerador (solo recogida, funciona congelador)",
    image: "/images/refrigerador solo recogida.jpg",
    location: "Madrid",
    timeAgo: "hace 7 min",
    badge: "Disponible ahora",
    badgeType: "available",
  },
  {
    id: 4,
    title: "Lavadora-secadora (retirar mañana)",
    image: "/images/lavadora secadora.jpg",
    location: "Madrid",
    timeAgo: "hace 26 min",
    badge: "Última oportunidad",
    badgeType: "urgent",
  },
  {
    id: 5,
    title: "Armario, cama y cajoneras IKEA",
    image: "/images/armario cama y cajonera.jpg",
    location: "Madrid",
    timeAgo: "hace 5 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 6,
    title: "Cama y colchón 200x90 GRATIS",
    image: "/images/cama.jpg",
    location: "Madrid",
    timeAgo: "hace 11 min",
    badge: "Disponible ahora",
    badgeType: "available",
  },
  {
    id: 7,
    title: "Espejo rectangular grande",
    image: "/images/espejo rectangular grande.jpg",
    location: "Madrid",
    timeAgo: "hace 3 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 8,
    title: "Zapatera y muebles para salón",
    image: "/images/zapatera muebles para salon.jpg",
    location: "Getafe, Madrid",
    timeAgo: "hace 2 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
  {
    id: 9,
    title: "Vitrina de madera gratis",
    image: "/images/vitrina gratis.jpg",
    location: "Madrid",
    timeAgo: "hace 12 min",
    badge: "Última oportunidad",
    badgeType: "urgent",
  },
  {
    id: 10,
    title: "Mesa de comedor 6 personas",
    image: "/images/mesa de comedor.jpg",
    location: "Madrid",
    timeAgo: "hace 22 min",
    badge: "Disponible ahora",
    badgeType: "available",
  },
  {
    id: 11,
    title: "Maleta grande GRATIS",
    image: "https://picsum.photos/seed/maleta/400/300",
    location: "Madrid",
    timeAgo: "hace 25 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
  {
    id: 12,
    title: "Sofá cama (regalo)",
    image: "https://picsum.photos/seed/sofacama/400/300",
    location: "Madrid",
    timeAgo: "hace 18 min",
    badge: "Última oportunidad",
    badgeType: "urgent",
  },
  {
    id: 13,
    title: "Mesa auxiliar verde se regala",
    image: "https://picsum.photos/seed/mesa-verde/400/300",
    location: "Valdemoro, Madrid",
    timeAgo: "hace 30 min",
    badge: "Último",
    badgeType: "urgent",
  },
  {
    id: 14,
    title: "Sofá gris",
    image: "https://picsum.photos/seed/sofa/400/300",
    location: "Madrid",
    timeAgo: "hace 35 min",
    badge: "Disponible",
    badgeType: "available",
  },
  {
    id: 15,
    title: "Mesa de comedor 6 personas",
    image: "https://picsum.photos/seed/mesa-comedor/400/300",
    location: "Madrid",
    timeAgo: "hace 22 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 16,
    title: "Colchón gratis",
    image: "https://picsum.photos/seed/colchon/400/300",
    location: "Madrid",
    timeAgo: "hace 40 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
  {
    id: 17,
    title: "Coche por piezas",
    image: "https://picsum.photos/seed/coche-piezas/400/300",
    location: "Miraflores de la Sierra, Madrid",
    timeAgo: "hace 45 min",
    badge: "Última oportunidad",
    badgeType: "urgent",
  },
  {
    id: 18,
    title: "Cama y colchón 200x90 GRATIS",
    image: "https://picsum.photos/seed/cama/400/300",
    location: "Madrid",
    timeAgo: "hace 11 min",
    badge: "Disponible ahora",
    badgeType: "available",
  },
  {
    id: 19,
    title: "Artículos variados gratis",
    image: "https://picsum.photos/seed/articulos/400/300",
    location: "Madrid",
    timeAgo: "hace 33 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 20,
    title: "Lavadora-secadora (retirar mañana)",
    image: "https://picsum.photos/seed/lavadora/400/300",
    location: "Madrid",
    timeAgo: "hace 26 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
  {
    id: 21,
    title: "Cama nido",
    image: "https://picsum.photos/seed/cama-nido/400/300",
    location: "San Sebastián de los Reyes, Madrid",
    timeAgo: "hace 50 min",
    badge: "Última oportunidad",
    badgeType: "urgent",
  },
  {
    id: 22,
    title: "Variedad en pulseras",
    image: "https://picsum.photos/seed/pulseras/400/300",
    location: "Madrid",
    timeAgo: "hace 15 min",
    badge: "Disponible",
    badgeType: "available",
  },
  {
    id: 23,
    title: "Bici eléctrica Dakota",
    image: "https://picsum.photos/seed/bici-electrica/400/300",
    location: "Madrid",
    timeAgo: "hace 6 min",
    badge: "Nuevo",
    badgeType: "new",
  },
  {
    id: 24,
    title: "Artículos mudanza",
    image: "https://picsum.photos/seed/mudanza/400/300",
    location: "Ocaña, Madrid",
    timeAgo: "hace 42 min",
    badge: "Muy solicitado",
    badgeType: "hot",
  },
];

const marketplaceRealProducts = marketplaceProducts.products as Product[];
const scrapedRealProducts = scrapedProducts.products as Product[];
const activeFeed = marketplaceRealProducts.length > 0 ? marketplaceProducts : scrapedProducts;
const realProducts = marketplaceRealProducts.length > 0 ? marketplaceRealProducts : scrapedRealProducts;

export const products: Product[] = realProducts.length > 0 ? realProducts : fallbackProducts;
export const productDataMeta = {
  source: activeFeed.source,
  sourceUrl: activeFeed.sourceUrl,
  generatedAt: activeFeed.generatedAt,
  count: activeFeed.count,
  isLive: realProducts.length > 0,
};
