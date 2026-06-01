const steps = [
  { number: "01", icon: "📍", title: "Detectamos artículos gratis", desc: "Monitorizamos cientos de fuentes en tiempo real para encontrar objetos gratuitos en Madrid." },
  { number: "02", icon: "⚡", title: "Publicamos al instante", desc: "En segundos publicamos la info: qué es, dónde está y hace cuánto tiempo lleva disponible." },
  { number: "03", icon: "🔔", title: "Tú recibes la alerta", desc: "Te notificamos de inmediato para que puedas ser el primero en reclamarlo." },
  { number: "04", icon: "🗺️", title: "Ves la ubicación exacta", desc: "Con tu suscripción activa, accedes a la dirección completa del artículo." },
  { number: "05", icon: "🎉", title: "¡Lo consigues gratis!", desc: "Ve a buscarlo y quédatelo. Así de sencillo. Sin coste para el artículo." },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-3 text-center text-3xl font-bold text-slate-900">
          Cómo funciona
        </h2>
        <p className="mb-10 text-center text-slate-500">
          En 5 pasos sencillos desde el artículo hasta tu casa
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-1/2 hidden lg:block h-px w-full bg-slate-200 transform -translate-x-1/2" />
              )}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00C978] text-2xl shadow-lg">
                {step.icon}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#07110C] border border-[#00C978]">
                  {step.number.slice(-1)}
                </span>
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
