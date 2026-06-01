import Image from "next/image";

interface NavbarProps {
  onOpenModal: () => void;
}

export default function Navbar({ onOpenModal }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/app-icon.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
              priority
            />
            <span className="text-2xl font-extrabold text-[#07110C]">
              Píllalo
            </span>
          </div>
          <button
            onClick={onOpenModal}
            className="rounded-full bg-[#00C978] px-4 py-2 text-sm font-bold text-[#07110C] hover:bg-[#00B86F] transition-colors shadow-md"
          >
            Activar alertas
          </button>
        </div>
      </div>
    </nav>
  );
}
