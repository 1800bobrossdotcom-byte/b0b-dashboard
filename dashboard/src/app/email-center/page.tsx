'use client'

import { useEffect, useState } from 'react'

interface EmailCategory {
  id: string
  name: string
  priority: string
  action: string
}

interface PriorityItem {
  type: string
  subject?: string
  vendor?: string
  amount?: string
  dueDate?: string
  from?: string
  preview?: string
  addedAt: string
  urgent?: boolean
}

interface Bill {
  vendor: string
  amount?: string
  dueDate?: string
  subject: string
  receivedAt: string
}

interface DigestItem {
  subject: string
  from: string
  preview: string
  receivedAt: string
}

interface Digest {
  generatedAt: string
  priorityItems: PriorityItem[]
  upcomingBills: Bill[]
  newsletters: DigestItem[]
  stats: {
    totalProcessed: number
    byCategory: Record<string, number>
    lastCheck: string
  }
}

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app'

export default function EmailCenterPage() {
  const [digest, setDigest] = useState<Digest | null>(null)
  const [priority, setPriority] = useState<PriorityItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [categories, setCategories] = useState<EmailCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [digestRes, priorityRes, billsRes, categoriesRes] = await Promise.all([
        fetch(`${BRAIN_URL}/email/digest`),
        fetch(`${BRAIN_URL}/email/priority`),
        fetch(`${BRAIN_URL}/email/bills`),
        fetch(`${BRAIN_URL}/email/categories`),
      ])

      const digestData = await digestRes.json()
      const priorityData = await priorityRes.json()
      const billsData = await billsRes.json()
      const categoriesData = await categoriesRes.json()

      if (digestData.success) setDigest(digestData.digest)
      if (priorityData.success) setPriority(priorityData.items)
      if (billsData.success) setBills(billsData.bills || [])
      if (categoriesData.success) setCategories(categoriesData.categories)
      
      if (digestData.digest?.stats?.lastCheck) {
        setLastScan(digestData.digest.stats.lastCheck)
      }
    } catch (err) {
      console.error('Failed to fetch email data:', err)
    } finally {
      setLoading(false)
    }
  }

  const triggerScan = async () => {
    setScanning(true)
    try {
      await fetch(`${BRAIN_URL}/email/scan`, { method: 'POST' })
      await fetchData()
    } catch (err) {
      console.error('Scan failed:', err)
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      case 'medium': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30'
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bill': return '💰'
      case 'trading': return '📈'
      case 'security': return '🔒'
      case 'infrastructure': return '🚂'
      case 'calendar': return '📅'
      default: return '📧'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-4xl mb-4">📧</div>
            <div className="text-zinc-500">Loading Email Command Center...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">📧</span>
              Email Command Center
            </h1>
            <p className="text-zinc-500 mt-1">
              The swarm is watching your inbox
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastScan && (
              <span className="text-zinc-500 text-sm">
                Last scan: {formatTime(lastScan)}
              </span>
            )}
            <button
              onClick={triggerScan}
              disabled={scanning}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning ? 'Scanning...' : '🔄 Scan Now'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-cyan-400">
              {digest?.stats?.totalProcessed || 0}
            </div>
            <div className="text-zinc-500 text-sm">Emails Processed</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-amber-400">
              {priority.length}
            </div>
            <div className="text-zinc-500 text-sm">Priority Items</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">
              {bills.length}
            </div>
            <div className="text-zinc-500 text-sm">Bills Tracked</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">
              {digest?.newsletters?.length || 0}
            </div>
            <div className="text-zinc-500 text-sm">Newsletter Items</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Priority Inbox */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>⚡</span> Priority Inbox
            </h2>
            
            {priority.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">
                No priority items. Inbox is clear! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {priority.slice(0, 10).map((item, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-lg border ${item.urgent ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {item.subject || item.vendor || 'Unknown'}
                        </div>
                        {item.from && (
                          <div className="text-zinc-500 text-sm truncate">{item.from}</div>
                        )}
                        {item.amount && (
                          <div className="text-green-400 font-mono text-sm mt-1">
                            {item.amount}
                            {item.dueDate && <span className="text-zinc-500 ml-2">due {item.dueDate}</span>}
                          </div>
                        )}
                        {item.preview && (
                          <div className="text-zinc-400 text-sm mt-2 line-clamp-2">
                            {item.preview}
                          </div>
                        )}
                      </div>
                      <span className="text-zinc-500 text-xs whitespace-nowrap">
                        {formatTime(item.addedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bills Tracker */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💰</span> Bills Tracker
            </h2>
            
            {bills.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">
                No bills tracked yet
              </div>
            ) : (
              <div className="space-y-3">
                {bills.slice(0, 10).map((bill, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{bill.vendor}</div>
                        <div className="text-zinc-500 text-sm truncate max-w-[300px]">
                          {bill.subject}
                        </div>
                      </div>
                      <div className="text-right">
                        {bill.amount && (
                          <div className="text-green-400 font-mono font-bold">
                            {bill.amount}
                          </div>
                        )}
                        {bill.dueDate && (
                          <div className="text-amber-400 text-sm">
                            Due: {bill.dueDate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📁</span> Email Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className={`p-4 rounded-lg border ${getPriorityColor(cat.priority)}`}
              >
                <div className="font-medium">{cat.name}</div>
                <div className="text-xs mt-1 opacity-70">
                  {cat.action.replace(/_/g, ' ')}
                </div>
                <div className="text-2xl font-bold mt-2">
                  {digest?.stats?.byCategory?.[cat.id] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Digest */}
        {digest?.newsletters && digest.newsletters.length > 0 && (
          <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📰</span> Newsletter Digest
            </h2>
            
            <div className="space-y-3">
              {digest.newsletters.slice(0, 5).map((item, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50"
                >
                  <div className="font-medium">{item.subject}</div>
                  <div className="text-zinc-500 text-sm">{item.from}</div>
                  {item.preview && (
                    <div className="text-zinc-400 text-sm mt-2 line-clamp-2">
                      {item.preview}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-500 text-sm">
          Email Command Center is powered by the B0B Swarm 🐝
          <br />
          Auto-organizing since {new Date().toLocaleDateString()}
        </div>
      </div>
    </main>
  )
}
