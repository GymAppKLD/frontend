interface PlaceholderProps {
  title: string;
  subtitle?: string;
}

export default function Placeholder({ title, subtitle }: PlaceholderProps) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-sub">{subtitle}</p>}
        </div>
      </div>
      <div className="card">
        <p style={{ color: "var(--muted)" }}>Em construção — próxima fase.</p>
      </div>
    </>
  );
}