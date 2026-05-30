interface GDGLogoProps {
  size?: number;
  className?: string;
}

export function GDGLogo({ size = 40, className = "" }: GDGLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* < bracket */}
      <text
        x="8"
        y="29"
        fontFamily="'Exo 2', sans-serif"
        fontWeight="900"
        fontSize="26"
        fill="#4285F4"
      >
        &lt;
      </text>
      {/* > bracket */}
      <text
        x="22"
        y="29"
        fontFamily="'Exo 2', sans-serif"
        fontWeight="900"
        fontSize="26"
        fill="#34A853"
      >
        &gt;
      </text>
      {/* GDG color dots */}
      <circle cx="6" cy="6" r="3" fill="#4285F4" />
      <circle cx="14" cy="6" r="3" fill="#EA4335" />
      <circle cx="22" cy="6" r="3" fill="#FBBC04" />
      <circle cx="30" cy="6" r="3" fill="#34A853" />
    </svg>
  );
}

export function GDGColorBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-1.5 rounded-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-gdg-blue" />
      <div className="flex-1 bg-gdg-red" />
      <div className="flex-1 bg-gdg-yellow" />
      <div className="flex-1 bg-gdg-green" />
    </div>
  );
}
