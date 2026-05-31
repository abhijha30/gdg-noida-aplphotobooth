interface GDGLogoProps {
  size?: number;
  className?: string;
}

export function GDGLogo({
  size = 200,
  className = "",
}: GDGLogoProps) {
  return (
    <img
      src="/gdg-noida-logo.png"
      alt="GDG Noida"
      className={className}
      style={{
        width: size,
        height: "auto",
      }}
    />
  );
}

export function GDGColorBar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex h-1.5 rounded-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-gdg-blue" />
      <div className="flex-1 bg-gdg-red" />
      <div className="flex-1 bg-gdg-yellow" />
      <div className="flex-1 bg-gdg-green" />
    </div>
  );
}
