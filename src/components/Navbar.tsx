interface NavbarProps {
  onOpenModal: () => void;
}

export default function Navbar({ onOpenModal }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#1E3A5F] to-[#10B981] bg-clip-text text-transparent">
            FreeFy
          </span>
          <button
            onClick={onOpenModal}
            className="rounded-full bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669] transition-colors shadow-md"
          >
            Llamar ahora
          </button>
        </div>
      </div>
    </nav>
  );
}
