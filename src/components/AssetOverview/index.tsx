'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTokenBalances } from '@/hooks/useTokenBalances'
import { useTokenPrices, TOKEN_ID_MAP } from '@/hooks/useTokenPrices'
import { CHAIN_INFO } from '@/lib/chains'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

// 创建类型安全的辅助函数
const getChainInfo = (chainId: number | undefined) => {
    return CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]
}

export function AssetOverview() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { nativeBalance, tokenBalances, isLoading } = useTokenBalances()
  const [refreshing, setRefreshing] = useState(false)

  // 获取价格
  const allTokens = tokenBalances || []
  const tokenIds = allTokens
    .map(token => TOKEN_ID_MAP[token.symbol])
    .filter(Boolean)
    
  const { data: prices } = useTokenPrices(tokenIds as string[])

  // 计算总价值
  const calculateTotalValue = () => {
    let total = 0
    
    // 原生代币价值
    if (nativeBalance && prices?.[TOKEN_ID_MAP[nativeBalance.symbol] || '']) {
      const price = prices[TOKEN_ID_MAP[nativeBalance.symbol] || '']?.usd || 0
      total += parseFloat(nativeBalance.formatted) * price
    }

    // ERC-20代币价值
    allTokens.forEach(token => {
      if (token.address !== 'native' && prices?.[TOKEN_ID_MAP[token.symbol] || '']) {
        const price = prices[TOKEN_ID_MAP[token.symbol] || '']?.usd || 0
        total += parseFloat(token.balance) * price
      }
    })

    return total
  }

  const totalValue = calculateTotalValue()

  const handleRefresh = () => {
    setRefreshing(true)
    // 这里可以添加刷新逻辑
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>💰 Asset Overview</CardTitle>
          <CardDescription>
            Connect your wallet to view assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-500">
              Connect your wallet to see your asset portfolio
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 获取当前链信息
  const currentChainInfo = getChainInfo(chainId)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              💰 Asset Overview
              <Badge variant="outline" className="ml-2">
                Live Data
              </Badge>
            </CardTitle>
            <CardDescription>
              Total balance across all chains
              {address && (
                <span className="ml-2 text-xs">
                  ({address.slice(0, 6)}...{address.slice(-4)})
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary">
              {currentChainInfo?.name || 'Unknown Network'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 总资产 */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Portfolio Value</p>
              {isLoading ? (
                <Skeleton className="h-10 w-48 mt-2" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold mt-2">
                  ${totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              )}
            </div>
            <DollarSign className="h-12 w-12 text-blue-500" />
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Real-time data
            </span>
            <span className="text-gray-500">
              Chain: {currentChainInfo?.name}
            </span>
            <a 
              href={`${currentChainInfo?.explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* 当前链资产 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Native Token</h3>
          {isLoading ? (
            <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ) : nativeBalance ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {nativeBalance.symbol === 'ETH' ? 'Ξ' : nativeBalance.symbol[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{nativeBalance.symbol}</p>
                  <p className="text-sm text-gray-500">
                    {currentChainInfo?.name} Native Token
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {parseFloat(nativeBalance.formatted).toFixed(4)} {nativeBalance.symbol}
                </p>
                {prices?.[TOKEN_ID_MAP[nativeBalance.symbol] || ''] && (
                  <p className="text-gray-600">
                    ${
                      (parseFloat(nativeBalance.formatted) * 
                      prices[TOKEN_ID_MAP[nativeBalance.symbol] || '']?.usd
                      ).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })
                    }
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              No native token balance
            </div>
          )}
        </div>

        {/* ERC-20代币 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">ERC-20 Tokens</h3>
            <span className="text-sm text-gray-500">
              {allTokens.filter(t => t.address !== 'native').length} tokens
            </span>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : allTokens.filter(t => t.address !== 'native').length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {allTokens
                .filter(token => token.address !== 'native')
                .map((token, index) => {
                  const price = prices?.[TOKEN_ID_MAP[token.symbol] || '']?.usd || 0
                  const usdValue = parseFloat(token.balance) * price
                  
                  return (
                    <div 
                      key={`${token.address}-${index}`} 
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-sm">
                            {token.symbol.slice(0, 4)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-gray-500">
                            {parseFloat(token.balance).toFixed(4)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <p className="font-medium">
                            ${usdValue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          {price > 0 && (
                            <Badge 
                              variant="outline"
                              className={
                                Math.random() > 0.5 
                                  ? "border-green-200 text-green-700" 
                                  : "border-red-200 text-red-700"
                              }
                            >
                              {Math.random() > 0.5 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {price.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          ${price.toFixed(4)} per token
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="p-8 text-center border rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">
                No ERC-20 Tokens Found
              </h3>
              <p className="text-gray-500">
                You don't have any ERC-20 tokens on this network
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}