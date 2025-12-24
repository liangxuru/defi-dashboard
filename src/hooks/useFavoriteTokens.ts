'use client'

import { useFavoritesStore, FavoriteToken } from '@/store/favorites'
import { useTokenPrices } from '@/hooks/useTokenPrices'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { getTokenBySymbol } from '@/lib/uniswap'

// 常用代币列表（用于快速添加）
export const QUICK_ADD_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', chainId: 1 },
  { symbol: 'USDC', name: 'USD Coin', chainId: 1 },
  { symbol: 'DAI', name: 'DAI Stablecoin', chainId: 1 },
  { symbol: 'USDT', name: 'Tether USD', chainId: 1 },
  { symbol: 'MATIC', name: 'Polygon', chainId: 137 },
  { symbol: 'USDC', name: 'USD Coin', chainId: 137 },
  { symbol: 'ETH', name: 'Ethereum', chainId: 42161 },
  { symbol: 'USDC', name: 'USD Coin', chainId: 42161 },
]

export function useFavoriteTokens() {
  const chainId = useChainId()
  const {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
    isFavorite,
    getChainFavorites,
    selectedChainId,
    setSelectedChain,
    clearFavorites,
  } = useFavoritesStore()

  // 获取当前链的收藏
  const currentChainFavorites = useMemo(() => {
    return getChainFavorites(chainId)
  }, [favorites, chainId, getChainFavorites])

  // 获取收藏代币的ID用于价格查询
  const favoriteTokenIds = useMemo(() => {
    const tokenIdMap: Record<string, string> = {
      'ETH': 'ethereum',
      'MATIC': 'matic-network',
      'USDC': 'usd-coin',
      'DAI': 'dai',
      'USDT': 'tether',
      'WBTC': 'wrapped-bitcoin',
      'ARB': 'arbitrum',
    }
    
    return currentChainFavorites
      .map(token => tokenIdMap[token.symbol])
      .filter(Boolean) as string[]
  }, [currentChainFavorites])

  // 获取价格
  const { data: prices, isLoading: isLoadingPrices } = useTokenPrices(favoriteTokenIds)

  // 计算收藏代币总价值
  const totalValue = useMemo(() => {
    if (!prices) return 0
    
    return currentChainFavorites.reduce((total, token) => {
      const tokenId = favoriteTokenIds.find(id => 
        id === 'ethereum' && token.symbol === 'ETH' ||
        id === 'matic-network' && token.symbol === 'MATIC' ||
        id === 'usd-coin' && token.symbol === 'USDC' ||
        id === 'dai' && token.symbol === 'DAI' ||
        id === 'tether' && token.symbol === 'USDT'
      )
      
      if (tokenId && prices[tokenId]) {
        // 这里使用模拟余额，实际项目中应该获取真实余额
        const mockBalance = 1 // 模拟1个代币
        return total + (mockBalance * prices[tokenId].usd)
      }
      
      return total
    }, 0)
  }, [currentChainFavorites, prices, favoriteTokenIds])




// 快速添加常用代币
const quickAddToken = (symbol: string, name: string, chainId: number) => {
  const tokenInfo = getTokenBySymbol(chainId, symbol)
  
  if (!tokenInfo) {
    console.error(`Token ${symbol} not found on chain ${chainId}`)
    return
  }

  addFavorite({
    address: tokenInfo.address,
    symbol: tokenInfo.symbol || symbol,
    name: tokenInfo.name || name,
    decimals: tokenInfo.decimals || 18,
    chainId,
  })
}

  // 从资产总览添加收藏
  const addFromAsset = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
    chainId: number
  }) => {
    addFavorite(token)
  }

  // 获取收藏代币的详细信息（带价格）
  const getFavoriteWithPrice = (token: FavoriteToken) => {
    const tokenIdMap: Record<string, string> = {
      'ETH': 'ethereum',
      'MATIC': 'matic-network',
      'USDC': 'usd-coin',
      'DAI': 'dai',
      'USDT': 'tether',
    }
    
    const tokenId = tokenIdMap[token.symbol]
    const price = tokenId && prices?.[tokenId]?.usd
    
    return {
      ...token,
      price: price || 0,
      value: price || 0, // 模拟价值
      change24h: Math.random() * 10 - 5, // 模拟24小时变化
    }
  }

  return {
    // 状态
    allFavorites: favorites,
    currentChainFavorites,
    selectedChainId,
    isLoadingPrices,
    totalValue,
    
    // 操作
    addFavorite,
    removeFavorite,
    updateFavorite,
    isFavorite,
    setSelectedChain,
    clearFavorites,
    quickAddToken,
    addFromAsset,
    getFavoriteWithPrice,
    
    // 统计
    totalCount: favorites.length,
    currentChainCount: currentChainFavorites.length,
    hasFavorites: favorites.length > 0,
  }
}