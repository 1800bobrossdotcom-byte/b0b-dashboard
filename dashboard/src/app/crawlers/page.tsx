'use client';

/**
 * CRAWLER STATUS
 * 
 * Live crawler execution status.
 * No cute shit. Just facts.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface CrawlerData {
  name: string;
  status: string;
  lastRun?: string;
  dataAge?: number;
  rawData?: any;
}

export default function CrawlersPage() {
  const [crawlers, setCrawlers] = useState<CrawlerData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrawlerStatus = async () => {
    try {
      // Get pulse data which includes all crawler info
      const res = await fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' });
      const data = await res.json();

      const crawlerList: CrawlerData[] = [];

      // d0t signals
      if (data.d0t) {
        const age = data.d0t.signals?.timestamp ? 
          Math.floor((Date.now() - new Date(data.d0t.signals.timestamp).getTime()) / 60000) : 
          999;
        
        crawlerList.push({
          name: 'd0t-signals',
          status: age < 10 ? 'LIVE' : 'STALE',
          lastRun: data.d0t.signals?.timestamp,
          dataAge: age,
          rawData: data.d0t.signals
        });
      }

      // Check for other data sources
      const sources = [
        { key: 'polymarket', name: 'POLYMARKET' },
        { key: 'defillama', name: 'DEFILLAMA' },
        { key: 'dexscreener', name: 'DEXSCREENER' }
      ];

      sources.forEach(({ key, name }) => {
        const hasData = data.d0t?.signals?.[key];
        crawlerList.push({
          name,
          status: hasData ? 'LIVE' : 'NO_DATA',
          lastRun: data.d0t?.signals?.timestamp,
          rawData: hasData
        });
      });

      setCrawlers(crawlerList);
    } catch (e) {
      console.error('Crawler fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlerStatus();
    const interval = setInterval(fetchCrawlerStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono p-8">
        <div className="text-2xl">CHECKING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-6xl mx-auto">
        <div className="border border-white p-6 mb-8">
          <h1 className="text-4xl mb-2">CRAWLER STATUS</h1>
          <p className="text-gray-500">Live data collection</p>
        </div>

        <div className="space-y-4">
          {crawlers.map(crawler => (
            <div 
              key={crawler.name}
              className={`border p-4 ${
                crawler.status === 'LIVE' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-2xl">{crawler.name}</div>
                <div className={`text-xl ${
                  crawler.status === 'LIVE' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crawler.status}
                </div>
              </div>
              
              {crawler.lastRun && (
                <div className="text-sm text-gray-500">
                  LAST RUN: {new Date(crawler.lastRun).toLocaleString()}
                </div>
              )}
              
              {crawler.dataAge !== undefined && (
                <div className="text-sm text-gray-500">
                  AGE: {crawler.dataAge}m
                </div>
              )}

              {crawler.rawData && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-500 text-sm">RAW DATA</summary>
                  <pre className="text-xs mt-2 overflow-auto bg-gray-900 p-2">
                    {JSON.stringify(crawler.rawData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
