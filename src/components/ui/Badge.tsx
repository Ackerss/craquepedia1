export function Badge({ color, children, solid = false }: { color: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <span
      className="badge"
      style={solid ? { background: color, color: "white" } : { background: `${color}1a`, color }}
    >
      {children}
    </span>
  );
}

export function Dot({ color }: { color: string }) {
  return <span className="inline-block size-2 rounded-full" style={{ background: color }} />;
}
