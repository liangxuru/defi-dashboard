'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Star,
  StarOff,
  Plus,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MoreVertical,
  Sparkles,
  X
} from 'lucide-react'
import { useFavoriteTokens, QUICK_ADD_TOKENS } from '@/hooks/useFavoriteTokens'
import { useAccount, useChainId } from 'wagmi'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { CHAIN_INFO } from '@/lib/chains'
import { cn } from '@/lib/utils'
import { getTokenColor } from '@/lib/uniswap'

interface FavoriteTokensProps {
  compact?: boolean
}

export function FavoriteTokens({ compact = false }: FavoriteTokensProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  
  const {
    currentChainFavorites,
    allFavorites,
    totalValue,
    isLoadingPrices,
    addFavorite,
    removeFavorite,
    isFavorite,
    quickAddToken,
    clearFavorites,
    getFavoriteWithPrice,
    hasFavorites,
    totalCount,
  } = useFavoriteTokens()

  // 处理添加收藏
  const handleAddFavorite = () => {
    // 这里可以扩展为从搜索框添加
    setIsAdding(true)
    setShowQuickAdd(true)
  }

  // 处理快速添加
  const handleQuickAdd = (symbol: string, name: string, chainId: number) => {
    quickAddToken(symbol, name, chainId)
  }

  // 获取链名称
  const getChainName = (chainId: number) => {
    return CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name || `Chain ${chainId}`
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    }
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
  }

  // 计算24小时变化颜色
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⭐ Favorite Tokens
          </CardTitle>
          <CardDescription>
            Connect your wallet to manage favorite tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-500">
              Connect your wallet to add and manage your favorite tokens
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              ⭐ Favorite Tokens
              {hasFavorites && (
                <Badge variant="secondary" className="ml-2">
                  {totalCount} tokens
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Track your favorite tokens across all chains
              {totalValue > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  Total: {formatPrice(totalValue)}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {hasFavorites && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearFavorites()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              onClick={handleAddFavorite}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Token
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 快速添加面板 */}
        {showQuickAdd && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Quick Add Popular Tokens
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickAdd(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUICK_ADD_TOKENS
                .filter(token => token.chainId === chainId)
                .map((token) => (
                  <Button
                    key={`${token.symbol}-${token.chainId}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(token.symbol, token.name, token.chainId)}
                    disabled={isFavorite(token.symbol, token.chainId)}
                    className="justify-start h-auto py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: getTokenColor(token.symbol) }}
                      >
                        {token.symbol[0]}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{token.name}</div>
                      </div>
                      {isFavorite(token.symbol, token.chainId) && (
                        <Star className="h-4 w-4 ml-auto text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </Button>
                ))}
            </div>
            
            {QUICK_ADD_TOKENS.filter(t => t.chainId === chainId).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No quick add tokens available for {CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name}
              </p>
            )}
          </div>
        )}

        {/* 搜索框 */}
        {!compact && hasFavorites && (
          <div className="mb-6">
            <div className="relative">
              <Input
                placeholder="Search favorite tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* 收藏列表 */}
        {isLoadingPrices && !hasFavorites ? (
          // 加载状态
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : hasFavorites ? (
          // 收藏列表
          <div className="space-y-3">
            {currentChainFavorites.length > 0 ? (
              currentChainFavorites
                .filter(token => 
                  searchQuery === '' ||
                  token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((token) => {
                  const tokenWithPrice = getFavoriteWithPrice(token)
                  const changeColor = getChangeColor(tokenWithPrice.change24h)
                  
                  return (
                    <div 
                      key={`${token.address}-${token.chainId}`}
                      className="group p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        {/* 左侧：代币信息 */}
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: getTokenColor(token.symbol) }}
                          >
                            {token.symbol.slice(0, 3)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800">
                                {token.symbol}
                              </span>
                              <span className="text-sm text-gray-500 truncate">
                                {token.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getChainName(token.chainId)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              {tokenWithPrice.price > 0 ? (
                                <>
                                  <span className="font-semibold">
                                    {formatPrice(tokenWithPrice.price)}
                                  </span>
                                  <span className={cn("flex items-center gap-1", changeColor)}>
                                    {tokenWithPrice.change24h >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(tokenWithPrice.change24h).toFixed(2)}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400">Price loading...</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 右侧：操作按钮 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavorite(token.address, token.chainId)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove from favorites"
                          >
                            <StarOff className="h-4 w-4" />
                          </Button>
                          
                          {!compact && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* 代币地址（紧凑显示） */}
                      {!compact && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <code className="text-gray-500 truncate max-w-[200px]">
                              {token.address.slice(0, 10)}...{token.address.slice(-8)}
                            </code>
                            <span className="text-gray-400">
                              Added {new Date(token.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
            ) : (
              // 当前链无收藏
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  No favorites on this chain
                </h3>
                <p className="text-gray-500 mb-4">
                  Add some tokens to track them on {CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Quick Add Tokens
                </Button>
              </div>
            )}
            
            {/* 显示所有链的收藏摘要 */}
            {!compact && allFavorites.length > currentChainFavorites.length && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Also tracking on other chains:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(allFavorites.map(f => f.chainId)))
                      .filter(id => id !== chainId)
                      .map(chainId => {
                        const chainFavorites = allFavorites.filter(f => f.chainId === chainId)
                        return (
                          <Badge key={chainId} variant="outline" className="gap-1">
                            <span>{CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name || `Chain ${chainId}`}</span>
                            <span className="text-gray-500">({chainFavorites.length})</span>
                          </Badge>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 无收藏状态
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">
              No Favorite Tokens Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your favorite tokens to track their prices
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Benefits of favoriting tokens:</p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Quick access to token prices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Track price changes in real-time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Cross-chain support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Data saved locally in your browser</span>
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={() => setShowQuickAdd(true)}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                Add Your First Favorite Token
              </Button>
            </div>
          </div>
        )}
        
        {/* 数据说明 */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 mt-1 rounded-full bg-yellow-500"></div>
            <div>
              <p>
                Favorite tokens are saved locally in your browser. Data will persist across sessions.
                Prices are updated in real-time from CoinGecko API.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}