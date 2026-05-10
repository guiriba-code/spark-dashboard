import { useState } from 'react'

import layers    from './data/layers.json'
import contracts from './data/contracts.json'
import functions from './data/functions.json'
import top30     from './data/top30.json'

import type { Layer, Contract, SparkFunction, Top30Entry } from './types'
import { OverviewTab  } from './components/OverviewTab'
import { InsecureTab  } from './components/InsecureTab'
import { Top30Tab     } from './components/Top30Tab'
import { SummaryTab   } from './components/SummaryTab'

const typedLayers    = layers    as Layer[]
const typedContracts = contracts as Contract[]
const typedFunctions = functions as SparkFunction[]
const typedTop30     = top30     as Top30Entry[]

type Tab = 'overview' | 'summary' | 'insecure' | 'top30'

const TABS: { id: Tab; label: string; shortcut: string }[] = [
  { id: 'overview', label: 'NODE MAP',             shortcut: 'F1' },
  { id: 'summary',  label: 'SUMMARY BY LAYER',     shortcut: 'F2' },
  { id: 'insecure', label: 'MOST INSECURE',         shortcut: 'F3' },
  { id: 'top30',    label: 'TOP 30 BY RELEVANCE',   shortcut: 'F4' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a10',
        color: '#e0e0ff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── DESKTOP CHROME ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a10 100%)',
          borderBottom: '2px solid #1a1a3a',
        }}
      >
        {/* Menu bar (title bar style) */}
        <div
          style={{
            background: 'linear-gradient(90deg, #000080 0%, #0000a0 60%, #000060 100%)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pixel "icon" */}
            <div
              style={{
                width: 16,
                height: 16,
                background: 'repeating-linear-gradient(45deg, #ff3333 0px, #ff3333 2px, #4040ff 2px, #4040ff 4px)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                color: '#ffffff',
                letterSpacing: 1,
              }}
            >
              SPARK PROTOCOL — RISK DASHBOARD v1.0
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {['_', '□', '×'].map(btn => (
              <span
                key={btn}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 14,
                  background: '#c0c0c0',
                  color: '#000',
                  fontFamily: 'Courier New',
                  fontSize: 10,
                  fontWeight: 'bold',
                  borderTop:    '1px solid #fff',
                  borderLeft:   '1px solid #fff',
                  borderRight:  '1px solid #404040',
                  borderBottom: '1px solid #404040',
                  cursor: 'pointer',
                }}
              >
                {btn}
              </span>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingLeft: 8, paddingTop: 4, gap: 2 }}>
          {TABS.map(tab => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 7,
                  padding: active ? '6px 14px 7px' : '5px 12px 5px',
                  background: active ? '#0f0f1e' : '#070710',
                  color: active ? '#e0e0ff' : '#9090c0',
                  border: 'none',
                  borderTop:    `2px solid ${active ? '#dfdfdf' : '#808080'}`,
                  borderLeft:   `2px solid ${active ? '#dfdfdf' : '#808080'}`,
                  borderRight:  `2px solid ${active ? '#404040' : '#202020'}`,
                  borderBottom: active ? `2px solid #0f0f1e` : '2px solid #404040',
                  cursor: 'pointer',
                  position: 'relative',
                  marginBottom: active ? -2 : 0,
                  zIndex: active ? 1 : 0,
                  outline: 'none',
                }}
              >
                {tab.label}
                <span
                  style={{
                    marginLeft: 6,
                    fontFamily: 'Courier New',
                    fontSize: 8,
                    color: active ? '#9090c0' : '#4040a0',
                  }}
                >
                  [{tab.shortcut}]
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          padding: 16,
          maxWidth: 1300,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            layers={typedLayers}
            contracts={typedContracts}
            functions={typedFunctions}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryTab
            layers={typedLayers}
            contracts={typedContracts}
          />
        )}
        {activeTab === 'insecure' && (
          <InsecureTab
            functions={typedFunctions}
            contracts={typedContracts}
          />
        )}
        {activeTab === 'top30' && (
          <Top30Tab
            top30={typedTop30}
            functions={typedFunctions}
            contracts={typedContracts}
          />
        )}
      </main>

      {/* ── STATUS BAR ── */}
      <div
        style={{
          borderTop: '2px solid #1a1a3a',
          background: '#0a0a10',
          padding: '3px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Courier New',
            fontSize: 9,
            color: '#6060a0',
          }}
        >
          Score = (Access + Limits + Verifiability + Delay) − 2 &nbsp;|&nbsp;
          10 = most secure · 2 = least secure &nbsp;|&nbsp;
          Relevance = (sum criteria − 5) / 5 × 9 + 1
        </span>
        <span
          style={{
            fontFamily: 'Courier New',
            fontSize: 9,
            color: '#6060a0',
          }}
        >
          {new Date().toLocaleDateString('en-US')} &nbsp;|&nbsp;
          <a
            href="https://spark.fi"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4040ff', textDecoration: 'none' }}
          >
            spark.fi ↗
          </a>
        </span>
      </div>
    </div>
  )
}
