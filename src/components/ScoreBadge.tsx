import type { ScoreColor } from '../types'

interface ScoreBadgeProps {
  score: number
  color: ScoreColor
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const colorMap: Record<ScoreColor, string> = {
  red:    'bg-[#2a0000] text-[#ff3333] border border-[#ff3333]/30',
  yellow: 'bg-[#2a1a00] text-[#ffcc00] border border-[#ffcc00]/30',
  green:  'bg-[#002200] text-[#00ff41] border border-[#00ff41]/30',
}

const sizeMap = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-none',
  md: 'text-xs    px-2   py-0.5 rounded-none font-bold',
  lg: 'text-sm    px-3   py-1   rounded-none font-bold',
}

export function ScoreBadge({ score, color, label, size = 'md' }: ScoreBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${colorMap[color]} ${sizeMap[size]}`}
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {label && <span className="font-sans opacity-70" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>{label}</span>}
      {score.toFixed(score % 1 === 0 ? 0 : 1)}
    </span>
  )
}

interface DotIndicatorProps {
  color: ScoreColor
}

export function DotIndicator({ color }: DotIndicatorProps) {
  const dotColor = { red: '#ff3333', yellow: '#ffcc00', green: '#00ff41' }[color]
  return (
    <span
      className="inline-block w-2 h-2 flex-shrink-0"
      style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
    />
  )
}
