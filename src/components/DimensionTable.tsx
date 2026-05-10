import { getScoreColor } from '../types'
import type { SparkFunction } from '../types'
import { ScoreBadge } from './ScoreBadge'

interface DimensionTableProps {
  fn: SparkFunction
}

const dimensionLabels: Record<string, string> = {
  access:       'Access',
  limitsScore:  'Limits',
  verifiability:'Verifiability',
  delayScore:   'Delay',
}

const dimensionDesc: Record<string, Record<number, string>> = {
  access: {
    1: 'Single key / bot / direct role without delay',
    2: 'Multisig or role with grouped access',
    3: 'On-chain Timelock + governance OR permissionless',
  },
  limitsScore: {
    1: 'No limits — unprotected financial exposure',
    2: 'Partial or bypassable limits',
    3: 'Strict limits OR no financial exposure (N/A)',
  },
  verifiability: {
    1: 'No validation — arbitrary calldata / address / amount',
    2: 'Partial validation (some parameters)',
    3: 'Deterministic or validates all inputs',
  },
  delayScore: {
    1: 'Delay required — none exists',
    2: 'Partial delay (rate limit / multisig)',
    3: 'Timelock present OR not required (N/A)',
  },
}

export function DimensionTable({ fn }: DimensionTableProps) {
  const dimensions = [
    { key: 'access',        value: fn.access        },
    { key: 'limitsScore',   value: fn.limitsScore   },
    { key: 'verifiability', value: fn.verifiability },
    { key: 'delayScore',    value: fn.delayScore    },
  ] as const

  return (
    <div style={{ border: '1px solid #1a1a3a', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: '#0a0a18', borderBottom: '1px solid #1a1a3a' }}>
            {['DIMENSION', 'SCORE', 'ASSESSMENT'].map(h => (
              <th
                key={h}
                style={{
                  textAlign: h === 'SCORE' ? 'center' : 'left',
                  padding: '5px 8px',
                  fontFamily: 'Courier New',
                  fontSize: 8,
                  color: '#9090c0',
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dimensions.map(({ key, value }) => (
            <tr
              key={key}
              style={{ borderBottom: '1px solid #1a1a3a' }}
            >
              <td
                style={{
                  padding: '5px 8px',
                  fontFamily: 'Courier New',
                  fontSize: 10,
                  color: '#e0e0ff',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {dimensionLabels[key]}
              </td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <ScoreBadge
                  score={value}
                  color={getScoreColor(value === 3 ? 10 : value === 2 ? 5 : 2)}
                  size="sm"
                />
              </td>
              <td
                style={{
                  padding: '5px 8px',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontSize: 10,
                  color: '#9090c0',
                }}
              >
                {dimensionDesc[key][value]}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#0a0a18' }}>
            <td
              style={{
                padding: '5px 8px',
                fontFamily: 'Courier New',
                fontSize: 10,
                color: '#e0e0ff',
                fontWeight: 'bold',
              }}
            >
              Final Score
            </td>
            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
              <ScoreBadge score={fn.score} color={getScoreColor(fn.score)} size="sm" />
            </td>
            <td
              style={{
                padding: '5px 8px',
                fontFamily: 'Courier New',
                fontSize: 9,
                color: '#9090c0',
              }}
            >
              ({fn.access}+{fn.limitsScore}+{fn.verifiability}+{fn.delayScore})−2 = {fn.score}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
