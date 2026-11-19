/* Diagramas de campo/quadra com a posição do atleta marcada. Usado nos currículos e no portfólio. */

type Pt = [number, number];

const FUTEBOL: Record<string, Pt> = {
  goleiro: [60, 166],
  zagueiro: [60, 142],
  "lateral direito": [102, 128],
  "lateral esquerdo": [18, 128],
  volante: [60, 116],
  "meio-campista": [60, 96],
  "meia atacante": [60, 70],
  "ponta direita": [102, 52],
  "ponta esquerda": [18, 52],
  "segundo atacante": [60, 46],
  centroavante: [60, 26],
};

const FUTSAL: Record<string, Pt> = {
  goleiro: [60, 166],
  fixo: [60, 136],
  "ala direita": [100, 96],
  "ala esquerda": [20, 96],
  universal: [60, 96],
  pivô: [60, 46],
};

const VOLEI: Record<string, Pt> = {
  "levantador(a)": [94, 152],
  "oposto(a)": [94, 112],
  "ponteiro(a)": [26, 112],
  central: [60, 108],
  líbero: [26, 154],
};

const BASQUETE: Record<string, Pt> = {
  "armador (pg)": [60, 118],
  "ala-armador (sg)": [100, 92],
  "ala (sf)": [20, 78],
  "ala-pivô (pf)": [86, 52],
  "pivô (c)": [44, 36],
};

const HANDEBOL: Record<string, Pt> = {
  goleiro: [60, 14],
  pivô: [60, 50],
  "armador central": [60, 92],
  "armador esquerdo": [26, 84],
  "armador direito": [94, 84],
  "ponta esquerda": [10, 30],
  "ponta direita": [110, 30],
};

const MAPS: Record<string, Record<string, Pt>> = {
  futebol: FUTEBOL,
  futsal: FUTSAL,
  volei: VOLEI,
  basquete: BASQUETE,
  handebol: HANDEBOL,
};

export function hasDiagram(sport: string, keys: string[]) {
  const m = MAPS[sport];
  return !!m && keys.some((k) => m[k]);
}

function Markers({ dots, accent }: { dots: Pt[]; accent: string }) {
  return (
    <>
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 0 ? 12 : 9} fill={accent} opacity=".35" />
          <circle cx={x} cy={y} r={i === 0 ? 6.5 : 4.8} fill={i === 0 ? "#fbbf24" : "#ffffff"} stroke="#0b1220" strokeWidth="1.2" />
        </g>
      ))}
    </>
  );
}

const LINE = { fill: "none", stroke: "rgba(255,255,255,.85)", strokeWidth: 1.2 } as const;

export function CourtDiagram({ sport, keys, accent, className = "h-full w-full" }: { sport: string; keys: string[]; accent: string; className?: string }) {
  const map = MAPS[sport];
  if (!map) return null;
  const dots = keys.map((k) => map[k]).filter((x): x is Pt => !!x);
  if (sport === "futebol")
    return (
      <svg viewBox="0 0 120 180" className={className}>
        <rect width="120" height="180" rx="6" fill="#15803d" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} y={i * 20} width="120" height="10" fill="#16a34a" opacity=".55" />
        ))}
        <g {...LINE}>
          <rect x="5" y="5" width="110" height="170" />
          <line x1="5" y1="90" x2="115" y2="90" />
          <circle cx="60" cy="90" r="14" />
          <rect x="30" y="5" width="60" height="24" />
          <rect x="45" y="5" width="30" height="9" />
          <rect x="30" y="151" width="60" height="24" />
          <rect x="45" y="166" width="30" height="9" />
        </g>
        <Markers dots={dots} accent={accent} />
      </svg>
    );
  if (sport === "futsal")
    return (
      <svg viewBox="0 0 120 180" className={className}>
        <rect width="120" height="180" rx="6" fill="#1d4ed8" />
        <rect x="5" y="5" width="110" height="170" fill="#2563eb" />
        <g {...LINE}>
          <rect x="5" y="5" width="110" height="170" />
          <line x1="5" y1="90" x2="115" y2="90" />
          <circle cx="60" cy="90" r="13" />
          <path d="M30 5a30 30 0 0 0 60 0M30 175a30 30 0 0 1 60 0" />
        </g>
        <Markers dots={dots} accent={accent} />
      </svg>
    );
  if (sport === "volei")
    return (
      <svg viewBox="0 0 120 180" className={className}>
        <rect width="120" height="180" rx="6" fill="#c2410c" />
        <rect x="8" y="8" width="104" height="164" fill="#ea580c" />
        <rect x="8" y="90" width="104" height="82" fill="#f97316" opacity=".6" />
        <g {...LINE}>
          <rect x="8" y="8" width="104" height="164" />
          <line x1="8" y1="62" x2="112" y2="62" />
          <line x1="8" y1="118" x2="112" y2="118" />
        </g>
        <line x1="2" y1="90" x2="118" y2="90" stroke="#fff" strokeWidth="3" />
        <Markers dots={dots} accent={accent} />
      </svg>
    );
  if (sport === "basquete")
    return (
      <svg viewBox="0 0 120 180" className={className}>
        <rect width="120" height="180" rx="6" fill="#b45309" />
        <rect x="5" y="5" width="110" height="170" fill="#d97706" />
        <g {...LINE}>
          <rect x="5" y="5" width="110" height="170" />
          <rect x="42" y="5" width="36" height="58" />
          <circle cx="60" cy="63" r="14" />
          <path d="M14 5v28a46 46 0 0 0 92 0V5" />
          <path d="M46 175a14 14 0 0 1 28 0" />
        </g>
        <circle cx="60" cy="14" r="4" fill="none" stroke="#fff" strokeWidth="1.6" />
        <Markers dots={dots} accent={accent} />
      </svg>
    );
  // handebol
  return (
    <svg viewBox="0 0 120 180" className={className}>
      <rect width="120" height="180" rx="6" fill="#4338ca" />
      <rect x="5" y="5" width="110" height="170" fill="#6366f1" />
      <path d="M10 5a50 42 0 0 0 100 0Z" fill="#4f46e5" />
      <g {...LINE}>
        <rect x="5" y="5" width="110" height="170" />
        <path d="M10 5a50 42 0 0 0 100 0" />
        <path d="M0 5a60 60 0 0 0 120 0" strokeDasharray="4 3" />
        <line x1="5" y1="175" x2="115" y2="175" />
      </g>
      <rect x="50" y="2" width="20" height="4" fill="#fff" />
      <Markers dots={dots} accent={accent} />
    </svg>
  );
}
