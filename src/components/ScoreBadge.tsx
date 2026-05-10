import type { ScoreColor } from '../types'

interface ScoreBadgeProps {
  score: number
  color: ScoreColor
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  red: 'bg-[#3f1212] text-[#ef4444] border border-[#ef4444]/30',
  yellow: 'bg-[#3f2d0a] text-[#f59e0b] border border-[#f59e0b]/30',
  green: 'bg-[#0d2e1a] text-[#22c55e] border border-[#22c55e]/30',
}

const sizeMap = {
  sm: 'text-xs px-1.5 py-0.5 rounded',
  md: 'text-sm px-2 py-0.5 rounded-md font-semibold',
  lg: 'text-base px-3 py-1 rounded-md font-bold',
}

export function ScoreBadge({ score, color, label, size = 'md' }: ScoreBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono tabular-nums ${colorMap[color]} ${sizeMap[size]}`}>
      {label && <span className="font-sans font-normal opacity-70">{label}</span>}
      {score.toFixed(score % 1 === 0 ? 0 : 1)}
    </span>
  )
}

interface DotIndicatorProps {
  color: ScoreColor
}

export function DotIndicator({ color }: DotIndicatorProps) {
  const dotColor = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' }[color]
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}80` }}
    />
  )
}
