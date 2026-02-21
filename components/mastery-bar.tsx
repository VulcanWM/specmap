interface MasteryBarProps {
  red: number
  amber: number
  green: number
  total: number
}

export function MasteryBar({ red, amber, green, total }: MasteryBarProps) {
  if (total === 0) return null

  const redPct = (red / total) * 100
  const amberPct = (amber / total) * 100
  const greenPct = (green / total) * 100
  const unrated = total - red - amber - green
  const unratedPct = (unrated / total) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2.5 rounded-full bg-border overflow-hidden flex">
        {greenPct > 0 && (
          <div
            className="bg-rag-green-active transition-all duration-500"
            style={{ width: `${greenPct}%` }}
          />
        )}
        {amberPct > 0 && (
          <div
            className="bg-rag-amber-active transition-all duration-500"
            style={{ width: `${amberPct}%` }}
          />
        )}
        {redPct > 0 && (
          <div
            className="bg-rag-red-active transition-all duration-500"
            style={{ width: `${redPct}%` }}
          />
        )}
        {unratedPct > 0 && (
          <div
            className="bg-border transition-all duration-500"
            style={{ width: `${unratedPct}%` }}
          />
        )}
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rag-green-active inline-block" />
          {green}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rag-amber-active inline-block" />
          {amber}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rag-red-active inline-block" />
          {red}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-border inline-block" />
          {unrated}
        </span>
      </div>
    </div>
  )
}
