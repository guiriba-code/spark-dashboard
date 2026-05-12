import { useState, useMemo } from 'react'
import type { Permission, RoleHolder } from '../types'
import permissionsData from '../data/permissions.json'

const permissions = permissionsData as Permission[]

// ── Colour helpers ──────────────────────────────────────────────────────────
const CONC_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  LOW:    { bg: '#001a00', text: '#00ff41', border: '#00ff41' },
  MEDIUM: { bg: '#1a1400', text: '#ffcc00', border: '#ffcc00' },
  HIGH:   { bg: '#1a0000', text: '#ff4444', border: '#ff4444' },
}

const SEC_COLOR: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: '#001a00', text: '#00ff41' },
  MEDIUM: { bg: '#1a1400', text: '#ffcc00' },
  LOW:    { bg: '#1a0000', text: '#ff4444' },
}

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  Contract: { bg: '#001a00', text: '#00ff41' },
  Multisig: { bg: '#001a1a', text: '#00ccff' },
  EOA:      { bg: '#1a0000', text: '#ff4444' },
}

function truncateAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function etherscanUrl(address: string, network: string) {
  if (!address) return ''
  switch (network) {
    case 'base':     return `https://basescan.org/address/${address}`
    case 'arbitrum': return `https://arbiscan.io/address/${address}`
    default:         return `https://etherscan.io/address/${address}`
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────
function ConcentrationBadge({ level }: { level: string }) {
  const c = CONC_COLOR[level] ?? CONC_COLOR.HIGH
  return (
    <span style={{
      fontFamily: 'Courier New, monospace', fontSize: 9, fontWeight: 700,
      padding: '2px 6px', border: `1px solid ${c.border}`,
      background: c.bg, color: c.text, letterSpacing: 1,
    }}>{level}</span>
  )
}

function SecurityBadge({ level }: { level: string | null }) {
  if (!level) return <span style={{ color: '#3a3a6a', fontFamily: 'Courier New, monospace', fontSize: 9 }}>UNKNOWN</span>
  const c = SEC_COLOR[level] ?? SEC_COLOR.LOW
  return (
    <span style={{
      fontFamily: 'Courier New, monospace', fontSize: 9, fontWeight: 700,
      padding: '1px 5px', border: `1px solid ${c.text}`,
      background: c.bg, color: c.text, letterSpacing: 1,
    }}>{level}</span>
  )
}

function TypeBadge({ type, threshold }: { type: string | null; threshold: string | null }) {
  if (!type) return <span style={{ color: '#3a3a6a', fontFamily: 'Courier New, monospace', fontSize: 9 }}>TBD</span>
  const c = TYPE_COLOR[type] ?? TYPE_COLOR.Contract
  const label = type === 'Multisig' && threshold ? `MULTISIG ${threshold}` : type.toUpperCase()
  return (
    <span style={{
      fontFamily: 'Courier New, monospace', fontSize: 9, fontWeight: 700,
      padding: '1px 5px', border: `1px solid ${c.text}`,
      background: c.bg, color: c.text, letterSpacing: 1,
    }}>{label}</span>
  )
}

function HolderRow({ holder, network }: { holder: RoleHolder; network: string }) {
  const url = holder.address ? etherscanUrl(holder.address, network) : ''
  return (
    <tr style={{ borderTop: '1px solid #1a1a3a' }}>
      <td style={{ padding: '4px 8px', fontFamily: 'Courier New, monospace', fontSize: 10, color: '#ffffff' }}>
        {holder.label}
        {holder.note && (
          <span style={{ display: 'block', fontSize: 8, color: '#3a3a6a', marginTop: 2 }}>⚠ {holder.note}</span>
        )}
      </td>
      <td style={{ padding: '4px 8px' }}>
        {holder.address ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={holder.address}
            style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#00ccff', textDecoration: 'none' }}
          >
            {truncateAddr(holder.address)} ↗
          </a>
        ) : (
          <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#3a3a6a' }}>not enumerable</span>
        )}
      </td>
      <td style={{ padding: '4px 8px' }}>
        <TypeBadge type={holder.type} threshold={holder.safeThreshold} />
      </td>
      <td style={{ padding: '4px 8px' }}>
        <SecurityBadge level={holder.securityLevel} />
      </td>
    </tr>
  )
}

// ── BY ROLE view ─────────────────────────────────────────────────────────────
function RoleCard({ permission }: { permission: Permission }) {
  const [open, setOpen] = useState(false)
  const totalHolders = permission.contracts.reduce((s, c) => s + c.holders.length, 0)
  const hasUnknowns  = permission.contracts.some(c => c.holders.some(h => !h.address))

  return (
    <div style={{
      marginBottom: 10,
      borderTop: '2px solid #808080', borderLeft: '2px solid #808080',
      borderRight: '2px solid #202020', borderBottom: '2px solid #202020',
      background: '#0a0a1e',
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          cursor: 'pointer',
          background: open
            ? 'linear-gradient(90deg,#0a0a3a 0%,#0f0f2e 100%)'
            : 'transparent',
        }}
      >
        <span style={{ color: '#3a3a6a', fontSize: 12, userSelect: 'none' }}>{open ? '▼' : '▶'}</span>
        <span style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 9,
          color: '#00ccff', flex: 1, letterSpacing: 0.5,
        }}>{permission.name}</span>
        <ConcentrationBadge level={permission.concentration} />
        <span style={{
          fontFamily: 'Courier New, monospace', fontSize: 8, color: '#808080',
          marginLeft: 6,
        }}>{permission.mechanism}</span>
        <span style={{
          fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a',
          background: '#0f0f1e', padding: '1px 5px', border: '1px solid #1a1a3a',
          marginLeft: 4,
        }}>
          {totalHolders} holder{totalHolders !== 1 ? 's' : ''}
          {hasUnknowns ? ' ⚠' : ''}
        </span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #1a1a3a' }}>
          {/* Granted by */}
          <div style={{
            padding: '6px 14px', background: '#06060f',
            fontFamily: 'Courier New, monospace', fontSize: 9,
            color: '#808080', borderBottom: '1px solid #1a1a3a',
          }}>
            <span style={{ color: '#3a3a6a' }}>GRANTED BY: </span>
            {permission.grantedBy}
          </div>

          {/* Contract groups */}
          {permission.contracts.map((rc, i) => (
            <div key={i} style={{ borderBottom: '1px solid #1a1a3a' }}>
              {/* Contract sub-header */}
              <div style={{
                padding: '5px 14px', background: '#080816',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#4a4a8a' }}>CONTRACT:</span>
                <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#c0c0f0', fontWeight: 700 }}>
                  {rc.contractName}
                </span>
                <span style={{
                  fontFamily: 'Courier New, monospace', fontSize: 8,
                  color: '#3a3a5a', background: '#0f0f1e',
                  padding: '1px 4px', border: '1px solid #1a1a3a',
                }}>
                  {rc.network}
                </span>
              </div>

              {rc.holders.length === 0 ? (
                <div style={{ padding: '6px 14px', fontFamily: 'Courier New, monospace', fontSize: 9, color: '#3a3a6a' }}>
                  No current holders — role inactive
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#06060f' }}>
                      {['HOLDER', 'ADDRESS', 'TYPE', 'SECURITY'].map(h => (
                        <th key={h} style={{
                          padding: '3px 8px', textAlign: 'left',
                          fontFamily: 'Courier New, monospace', fontSize: 8,
                          color: '#3a3a6a', letterSpacing: 1, fontWeight: 400,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rc.holders.map((h, j) => (
                      <HolderRow key={j} holder={h} network={rc.network} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── BY CONTRACT view ──────────────────────────────────────────────────────────
function ContractPermissionsView() {
  const [openContracts, setOpenContracts] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setOpenContracts(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Build contractId → { contractName, network, roles[] } map
  const byContract = useMemo(() => {
    const map = new Map<string, { contractName: string; network: string; key: string; roles: { permission: Permission; holders: RoleHolder[] }[] }>()
    for (const perm of permissions) {
      for (const rc of perm.contracts) {
        const key = `${rc.contractId}::${rc.network}`
        if (!map.has(key)) {
          map.set(key, { contractName: rc.contractName, network: rc.network, key, roles: [] })
        }
        map.get(key)!.roles.push({ permission: perm, holders: rc.holders })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.contractName.localeCompare(b.contractName))
  }, [])

  return (
    <div>
      {byContract.map(({ contractName, network, key, roles }) => {
        const isOpen = openContracts.has(key)
        const totalHolders = roles.reduce((s, r) => s + r.holders.length, 0)
        return (
          <div key={key} style={{
            marginBottom: 8,
            borderTop: '2px solid #808080', borderLeft: '2px solid #808080',
            borderRight: '2px solid #202020', borderBottom: '2px solid #202020',
            background: '#0a0a1e',
          }}>
            <div
              onClick={() => toggle(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                cursor: 'pointer',
                background: isOpen ? 'linear-gradient(90deg,#0a0a3a 0%,#0f0f2e 100%)' : 'transparent',
              }}
            >
              <span style={{ color: '#3a3a6a', fontSize: 12 }}>{isOpen ? '▼' : '▶'}</span>
              <span style={{
                fontFamily: 'Courier New, monospace', fontSize: 10, color: '#c0c0f0',
                fontWeight: 700, flex: 1,
              }}>{contractName}</span>
              <span style={{
                fontFamily: 'Courier New, monospace', fontSize: 8,
                color: '#3a3a5a', background: '#0f0f1e',
                padding: '1px 4px', border: '1px solid #1a1a3a',
              }}>{network}</span>
              <span style={{
                fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a',
                background: '#0f0f1e', padding: '1px 5px', border: '1px solid #1a1a3a',
                marginLeft: 4,
              }}>{roles.length} role{roles.length !== 1 ? 's' : ''} · {totalHolders} holder{totalHolders !== 1 ? 's' : ''}</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: '1px solid #1a1a3a' }}>
                {roles.map(({ permission, holders }, ri) => (
                  <div key={ri} style={{ borderBottom: '1px solid #0f0f2a' }}>
                    <div style={{
                      padding: '5px 14px', background: '#06060f',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                        color: '#00ccff',
                      }}>{permission.name}</span>
                      <ConcentrationBadge level={permission.concentration} />
                      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a', marginLeft: 'auto' }}>
                        {permission.mechanism}
                      </span>
                    </div>
                    {holders.length === 0 ? (
                      <div style={{ padding: '6px 14px', fontFamily: 'Courier New, monospace', fontSize: 9, color: '#3a3a6a' }}>
                        No current holders — role inactive
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#080816' }}>
                            {['HOLDER', 'ADDRESS', 'TYPE', 'SECURITY'].map(h => (
                              <th key={h} style={{
                                padding: '3px 8px', textAlign: 'left',
                                fontFamily: 'Courier New, monospace', fontSize: 8,
                                color: '#3a3a6a', letterSpacing: 1, fontWeight: 400,
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {holders.map((hld, j) => (
                            <HolderRow key={j} holder={hld} network={network} />
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function PermissionsTab() {
  const [view, setView] = useState<'role' | 'contract'>('role')
  const [search, setSearch] = useState('')

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions
    const q = search.toLowerCase()
    return permissions.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.mechanism.toLowerCase().includes(q) ||
      p.contracts.some(c =>
        c.contractName.toLowerCase().includes(q) ||
        c.holders.some(h =>
          h.label.toLowerCase().includes(q) ||
          (h.address ?? '').toLowerCase().includes(q)
        )
      )
    )
  }, [search])

  // Summary stats
  const totalHolders = useMemo(() => {
    const seen = new Set<string>()
    for (const p of permissions) for (const c of p.contracts) for (const h of c.holders) if (h.address) seen.add(h.address)
    return seen.size
  }, [])

  const lowSecCount = useMemo(() =>
    permissions.reduce((s, p) =>
      s + p.contracts.reduce((s2, c) =>
        s2 + c.holders.filter(h => h.securityLevel === 'LOW').length, 0), 0)
  , [])

  return (
    <div style={{
      fontFamily: 'Courier New, monospace',
      background: '#06060f',
      minHeight: '100%',
      padding: '16px 20px',
    }}>
      {/* Title bar */}
      <div style={{
        background: 'linear-gradient(90deg,#000080 0%,#1084d0 100%)',
        padding: '6px 12px', marginBottom: 14,
        borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #404040', borderBottom: '2px solid #404040',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#ffffff' }}>
          PERMISSIONS &amp; ACCESS CONTROL
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Courier New, monospace', fontSize: 8, color: '#c0d8ff' }}>
          Spark Protocol — Ethereum Mainnet / Base / Arbitrum
        </span>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'ROLES MAPPED', value: permissions.length, color: 'green' as const, sub: 'across all contracts' },
          { label: 'UNIQUE HOLDERS', value: totalHolders, color: 'green' as const, sub: 'distinct addresses' },
          { label: 'LOW SECURITY', value: lowSecCount, color: lowSecCount > 0 ? 'red' as const : 'green' as const, sub: 'holders score LOW' },
          { label: 'MECHANISMS', value: 3, color: 'yellow' as const, sub: 'OZ / Ownable / Ward' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#0f0f1e',
            borderTop: '2px solid #808080', borderLeft: '2px solid #808080',
            borderRight: '2px solid #202020', borderBottom: '2px solid #202020',
            padding: '8px 12px',
          }}>
            <div style={{
              fontFamily: 'Courier New, monospace', fontSize: 8,
              color: '#3a3a6a', letterSpacing: 1, marginBottom: 4,
            }}>{stat.label}</div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 16,
              color: stat.color === 'red' ? '#ff4444' : stat.color === 'yellow' ? '#ffcc00' : '#00ff41',
            }}>{stat.value}</div>
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a', marginTop: 4 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {/* View toggle */}
        {(['role', 'contract'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              fontFamily: 'Courier New, monospace', fontSize: 9, letterSpacing: 1,
              padding: '4px 12px', cursor: 'pointer',
              background: view === v ? '#00aacc' : '#0f0f1e',
              color: view === v ? '#000000' : '#808080',
              borderTop:    view === v ? '2px solid #ffffff' : '2px solid #404040',
              borderLeft:   view === v ? '2px solid #ffffff' : '2px solid #404040',
              borderRight:  view === v ? '2px solid #404040' : '2px solid #808080',
              borderBottom: view === v ? '2px solid #404040' : '2px solid #808080',
            }}
          >
            BY {v.toUpperCase()}
          </button>
        ))}

        {/* Search */}
        <input
          type="text"
          placeholder="Search role, contract, holder or address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, fontFamily: 'Courier New, monospace', fontSize: 9,
            background: '#06060f', color: '#c0c0f0',
            borderTop: '2px solid #404040', borderLeft: '2px solid #404040',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            padding: '4px 10px', outline: 'none',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              fontFamily: 'Courier New, monospace', fontSize: 9,
              background: '#1a0000', color: '#ff4444',
              border: '1px solid #ff4444', padding: '3px 8px', cursor: 'pointer',
            }}
          >✕ CLEAR</button>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 14, padding: '6px 10px',
        background: '#06060f', border: '1px solid #1a1a3a',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a' }}>CONCENTRATION:</span>
        {[['LOW','#00ff41'],['MEDIUM','#ffcc00'],['HIGH','#ff4444']].map(([l, c]) => (
          <span key={l} style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: c as string }}>● {l}</span>
        ))}
        <span style={{ color: '#1a1a3a' }}>|</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a' }}>TYPE:</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#00ff41' }}>CONTRACT</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#00ccff' }}>MULTISIG N-of-M</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#ff4444' }}>EOA</span>
        <span style={{ color: '#1a1a3a' }}>|</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a' }}>SECURITY:</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#00ff41' }}>HIGH</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#ffcc00' }}>MEDIUM</span>
        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 8, color: '#ff4444' }}>LOW</span>
      </div>

      {/* Content */}
      {view === 'role' ? (
        <div>
          {filteredPermissions.map(p => <RoleCard key={p.id} permission={p} />)}
          {filteredPermissions.length === 0 && (
            <div style={{ color: '#3a3a6a', fontFamily: 'Courier New, monospace', fontSize: 10, textAlign: 'center', marginTop: 40 }}>
              No results for "{search}"
            </div>
          )}
        </div>
      ) : (
        <ContractPermissionsView />
      )}

      {/* Footer */}
      <div style={{
        marginTop: 20, padding: '6px 10px', borderTop: '1px solid #1a1a3a',
        fontFamily: 'Courier New, monospace', fontSize: 8, color: '#2a2a4a',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>SPARK PROTOCOL — PERMISSION REGISTRY · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
        <span>Safe API · Etherscan · spark-permissions-guide.md</span>
      </div>
    </div>
  )
}
