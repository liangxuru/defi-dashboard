'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  LogOut, 
  ChevronDown, 
  Check,
  AlertCircle
} from 'lucide-react'
import { SUPPORTED_CHAINS, CHAIN_INFO } from '@/lib/chains'
import { useChainId, useAccount } from 'wagmi'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'


// 创建类型安全的辅助函数
const getChainInfo = (chainId: number | undefined) => {
    return CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]
}

export function WalletConnect() {
  const chainId = useChainId()
  const { isConnected } = useAccount()


  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')
          
        // 获取当前链信息
        const currentChainInfo = getChainInfo(chain?.id)

        return (
          <div
            className={cn(
              "transition-opacity duration-300",
              !ready && "opacity-0 pointer-events-none"
            )}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="gap-2 px-6 py-6 text-base"
                    size="lg"
                  >
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                    <span className="text-xs text-blue-300 ml-2">
                      (Ethereum, Polygon, Arbitrum)
                    </span>
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Unsupported Network</span>
                    </div>
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      Switch to Supported Network
                    </Button>
                    <div className="text-sm text-gray-600">
                      Supported: {SUPPORTED_CHAINS.map(c => c.name).join(', ')}
                    </div>
                  </div>
                )
              }

              return (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* 网络状态 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="gap-2 px-3 py-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">
                            {currentChainInfo?.logo || '🔗'}
                          </span>
                          <span className="font-medium">
                            {chain.name}
                          </span>
                        </div>
                      </Badge>
                      <Button
                        onClick={openChainModal}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* 链状态指示器 */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        chainId === chain.id 
                          ? "bg-green-500" 
                          : "bg-yellow-500"
                      )} />
                      {chainId === chain.id 
                        ? "Connected" 
                        : "Network switching..."
                      }
                    </div>
                  </div>

                  {/* 钱包地址 */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={openAccountModal}
                      className="gap-3 px-6 py-6"
                      size="lg"
                      variant="outline"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {account.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {account.address.slice(0, 6)}...{account.address.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Connected</span>
                      </div>
                      <LogOut className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {/* 余额占位符（下一步实现） */}
                    <div className="text-xs text-gray-400 text-center">
                      Balance: -- {currentChainInfo?.symbol}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}