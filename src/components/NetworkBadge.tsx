import type { Network, NetworkBadgeProps } from '../types/transaction';

const NETWORK_CONFIG: Record<Network, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  Ethereum: {
    color: 'text-[#9B8AFF]',
    bgColor: 'bg-[#9B8AFF]/10',
    borderColor: 'border-[#9B8AFF]/20',
    icon: 'ETH',
  },
  Base: {
    color: 'text-[#0052FF]',
    bgColor: 'bg-[#0052FF]/10',
    borderColor: 'border-[#0052FF]/20',
    icon: 'BASE',
  },
  Arbitrum: {
    color: 'text-[#28A0F0]',
    bgColor: 'bg-[#28A0F0]/10',
    borderColor: 'border-[#28A0F0]/20',
    icon: 'ARB',
  },
  Optimism: {
    color: 'text-[#FF0420]',
    bgColor: 'bg-[#FF0420]/10',
    borderColor: 'border-[#FF0420]/20',
    icon: 'OP',
  },
};

export function NetworkBadge({ network }: NetworkBadgeProps) {
  const config = NETWORK_CONFIG[network];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-mono font-medium tracking-wide ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      {config.icon}
    </span>
  );
}
