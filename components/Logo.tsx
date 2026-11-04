// components/Logo.tsx
//
// Usage examples:
//   <Logo />                          — wordmark, dark theme
//   <Logo theme="light" />            — light background variant
//   <Logo size={52} className="..." />

interface LogoProps {
  theme?: "dark" | "light";
  className?: string;
}

export default function Logo({
  theme = "dark",
  className,
}: LogoProps) {
  const primary = theme === "light" ? "#0d9488" : "#2dd4bf";   // "TSM Team" text
  const sub     = theme === "light" ? "#9a7830" : "#C9A84C";   // tagline text

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      aria-label="TSM Team — The Smart Money Blueprint"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Primary wordmark */}
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: primary,
            lineHeight: 1,
            textShadow: theme === "dark" ? "0 0 12px rgba(45,212,191,0.3)" : "none",
          }}
        >
          TSM Team
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 7.5,
            fontWeight: 500,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            color: sub,
            lineHeight: 1,
            opacity: 0.85,
          }}
        >
          The Smart Money Blueprint
        </span>
      </div>
    </div>
  );
}
