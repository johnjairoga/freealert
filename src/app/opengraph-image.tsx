import { ImageResponse } from "next/og";

export const alt = "Píllalo - Cosas gratis cerca de ti";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  const finds = ["Sofá gratis", "Bici eléctrica", "Lavadora", "Muebles IKEA"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #00C978 0%, #00E08A 48%, #D9FFE8 100%)",
          color: "#07110C",
          fontFamily: "Inter, Arial, sans-serif",
          padding: 72,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.42) 0, transparent 22%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.38) 0, transparent 24%)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 56,
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 690 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 104,
                  height: 104,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#FFFFFF",
                  border: "8px solid #07110C",
                  borderRadius: 28,
                  fontSize: 40,
                  fontWeight: 900,
                  boxShadow: "0 18px 40px rgba(7,17,12,0.18)",
                }}
              >
                0€
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 74, fontWeight: 900, letterSpacing: -2 }}>Píllalo</div>
                <div style={{ fontSize: 29, fontWeight: 800, opacity: 0.75 }}>Cosas gratis cerca de ti</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.02, letterSpacing: -1.8 }}>
                Pilla muebles, bicis y electrodomésticos antes que otros.
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 27, fontWeight: 850 }}>
                <span>Madrid</span>
                <span>·</span>
                <span>Alertas al instante</span>
                <span>·</span>
                <span>0€</span>
              </div>
            </div>
          </div>

          <div
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 20,
              transform: "rotate(-3deg)",
            }}
          >
            {finds.map((find, index) => (
              <div
                key={find}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.9)",
                  border: "4px solid rgba(7,17,12,0.12)",
                  borderRadius: 28,
                  padding: "22px 24px",
                  boxShadow: "0 18px 44px rgba(7,17,12,0.16)",
                  transform: `translateX(${index % 2 === 0 ? 0 : 28}px)`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>{find}</div>
                  <div style={{ fontSize: 21, fontWeight: 750, opacity: 0.62 }}>
                    {`Hace ${index * 7 + 6} min · Madrid`}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#07110C",
                    color: "#FFFFFF",
                    fontSize: 25,
                    fontWeight: 900,
                  }}
                >
                  0€
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
