import { useState } from 'react'
import { Shield, AlertTriangle, TrendingUp, Zap, ExternalLink } from 'lucide-react'

import layers from './data/layers.json'
import contracts from './data/contracts.json'
import functions from './data/functions.json'
import top30 from './data/top30.json'

import type { Layer, Contract, SparkFunction, Top30Entry } from './types'
import { OverviewTab } from './components/OverviewTab'
import { InsecureTab } from './components/InsecureTab'
import { Top30Tab } from './components/Top30Tab'

const typedLayers = layers as Layer[]
const typedContracts = contracts as Contract[]
const typedFunctions = functions as SparkFunction[]
const typedTop30 = top30 as Top30Entry[]

type Tab = 'overview' | 'insecure' | 'top30'

const tabs = [
  { id: 'overview' as Tab, label: 'Visão Geral', icon: <Shield size={15} /> },
  { id: 'insecure' as Tab, label: 'Mais Inseguras', icon: <AlertTriangle size={15} /> },
  { id: 'top30' as Tab, label: 'Top 30 por Criticidade', icon: <TrendingUp size={15} /> },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#e8e8f0]">
      {/* Header */}
      <header className="border-b border-[#2a2a35] bg-[#16161d]/80 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center">
              <Zap size={16} className="text-[#6366f1]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#e8e8f0] leading-none">Spark Protocol</h1>
              <p className="text-xs text-[#6b6b80] mt-0.5">Risk & Security Dashboard</p>
            </div>
          </div>
          <a
            href="https://spark.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#6b6b80] hover:text-[#9494a8] transition-colors"
          >
            spark.fi <ExternalLink size={11} />
          </a>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-[#2a2a35] bg-[#16161d]/50">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-[#6366f1] text-[#e8e8f0]'
                    : 'border-transparent text-[#6b6b80] hover:text-[#9494a8] hover:border-[#3a3a48]'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            layers={typedLayers}
            contracts={typedContracts}
            functions={typedFunctions}
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

      {/* Footer */}
      <footer className="border-t border-[#2a2a35] mt-16 py-6 text-center">
        <p className="text-xs text-[#3a3a48]">
          Spark Protocol Risk Dashboard · Metodologia: Score = (Acesso + Limites + Verificabilidade + Delay) − 2 · 
          10 = mais seguro · 2 = mais inseguro
        </p>
      </footer>
    </div>
  )
}
