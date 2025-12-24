'use client'

import { WalletConnect } from '@/components/WalletConnect'
import { AssetOverview } from '@/components/AssetOverview'
import { SwapPanel } from '@/components/SwapPanel'
import { TransactionHistory } from '@/components/TransactionHistory'
import { FavoriteTokens } from '@/components/FavoriteTokens'
import { CHAIN_INFO } from '@/lib/chains'
import { useAccount, useChainId } from 'wagmi'

export default function Home() {
  const { address } = useAccount()
  const chainId = useChainId()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 顶部导航栏 */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                🚀 DeFi Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Multi-chain portfolio tracker and token swapper
              </p>
            </div>
            <WalletConnect />
          </div>
        </header>

        {/* 主要区域 */}
        <main className="space-y-8">
          {/* 第一行：资产总览和Swap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Asset Overview</h2>
              <AssetOverview />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 Token Swap</h2>
              <SwapPanel />
            </div>
          </div>

          {/* 第二行：交易历史 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">📜 Transaction History</h2>
              <div className="text-sm text-gray-500">
                Real-time data with mock fallback
              </div>
            </div>
            <TransactionHistory limit={5} />
          </div>

          {/* 第三行：收藏夹和摘要 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FavoriteTokens />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">📈</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Dashboard Summary
                  </h2>
                  <p className="text-gray-600">
                    Your DeFi dashboard at a glance
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Connected Wallet</div>
                  <div className="font-medium truncate">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current Network</div>
                  <div className="font-medium">
                    {CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name || 'Unknown'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Features Active</div>
                  <div className="font-medium">5/5 Complete ✅</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-gray-700 mb-3">Feature Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Wallet Connection</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Asset Overview</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Token Swap</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Demo Mode</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction History</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Favorite Tokens</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-gray-700 mb-2">Supported Chains</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Ethereum</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Polygon</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Arbitrum</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 底部信息 */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
            <div>
              <p className="font-medium text-gray-700 mb-2">📋 Features</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-chain Wallet Connection</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time Asset Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Token Swap (Demo Mode)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Transaction History</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Favorite Tokens</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">🔗 Integrations</p>
              <ul className="space-y-1">
                <li>RainbowKit + Wagmi</li>
                <li>Uniswap V2 (Demo)</li>
                <li>The Graph API</li>
                <li>CoinGecko Prices</li>
                <li>LocalStorage</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">⚙️ Technology Stack</p>
              <ul className="space-y-1">
                <li>Next.js 14 + TypeScript</li>
                <li>Tailwind CSS + shadcn/ui</li>
                <li>React Query (TanStack)</li>
                <li>Zustand (State Management)</li>
                <li>Viem + Ethers.js</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              DeFi Dashboard • Open Source • Built for Web3 Developers
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Note: This is a demo application. Swap functionality is in demo mode.
              Always verify transactions and do your own research.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}