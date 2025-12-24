import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteToken {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  addedAt: number
  note?: string
}

interface FavoritesStore {
  // 状态
  favorites: FavoriteToken[]
  selectedChainId: number | null
  
  // 操作
  addFavorite: (token: Omit<FavoriteToken, 'addedAt'>) => void
  removeFavorite: (address: string, chainId: number) => void
  updateFavorite: (address: string, chainId: number, updates: Partial<FavoriteToken>) => void
  setSelectedChain: (chainId: number | null) => void
  clearFavorites: () => void
  isFavorite: (address: string, chainId: number) => boolean
  getChainFavorites: (chainId: number) => FavoriteToken[]
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      favorites: [],
      selectedChainId: null,
      
      // 添加收藏
      addFavorite: (token) => {
        const { address, chainId } = token
        
        // 检查是否已存在
        if (get().isFavorite(address, chainId)) {
          console.warn('Token already in favorites')
          return
        }
        
        set((state) => ({
          favorites: [
            ...state.favorites,
            {
              ...token,
              addedAt: Date.now(),
            },
          ],
        }))
      },
      
      // 移除收藏
      removeFavorite: (address, chainId) => {
        set((state) => ({
          favorites: state.favorites.filter(
            (token) => 
              !(token.address.toLowerCase() === address.toLowerCase() && 
                token.chainId === chainId)
          ),
        }))
      },
      
      // 更新收藏信息
      updateFavorite: (address, chainId, updates) => {
        set((state) => ({
          favorites: state.favorites.map((token) =>
            token.address.toLowerCase() === address.toLowerCase() && 
            token.chainId === chainId
              ? { ...token, ...updates }
              : token
          ),
        }))
      },
      
      // 设置当前选择的链
      setSelectedChain: (chainId) => {
        set({ selectedChainId: chainId })
      },
      
      // 清空收藏
      clearFavorites: () => {
        set({ favorites: [] })
      },
      
      // 检查是否已收藏
      isFavorite: (address, chainId) => {
        return get().favorites.some(
          (token) => 
            token.address.toLowerCase() === address.toLowerCase() && 
            token.chainId === chainId
        )
      },
      
      // 获取指定链的收藏
      getChainFavorites: (chainId) => {
        return get().favorites.filter((token) => token.chainId === chainId)
      },
    }),
    {
      name: 'defi-dashboard-favorites', // localStorage key
      partialize: (state) => ({ favorites: state.favorites }), // 只保存favorites
    }
  )
)