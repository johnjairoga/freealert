export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-[#1E3A5F] to-[#10B981] bg-clip-text text-transparent">
            FreeFy
          </span>
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <a href="/aviso-legal" className="hover:text-slate-900 transition-colors">Aviso Legal</a>
            <a href="/privacidad" className="hover:text-slate-900 transition-colors">Privacidad</a>
            <a href="/terminos" className="hover:text-slate-900 transition-colors">Términos</a>
            <a href="mailto:hola@freefy.es" className="hover:text-slate-900 transition-colors">Contacto</a>
          </nav>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FreeFy · Madrid, España
          </p>
        </div>
      </div>
    </footer>
  );
}
