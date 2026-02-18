import type { Transaction, ActionType } from '../types/transaction';
import { truncateAddress, formatAmount, formatAPY } from './formatters';

const ACTION_VERBS: Record<ActionType, { past: string; present: string }> = {
  supply: { past: 'supplied', present: 'supplying' },
  borrow: { past: 'borrowed', present: 'borrowing' },
  repay: { past: 'repaid', present: 'repaying' },
  withdraw: { past: 'withdrew', present: 'withdrawing' },
  liquidation: { past: 'liquidated', present: 'liquidating' },
};

export function getShortSummary(tx: Transaction): string {
  const address = truncateAddress(tx.walletAddress);
  const amount = formatAmount(tx.amount, tx.asset);
  const verb = ACTION_VERBS[tx.action].past;

  if (tx.action === 'liquidation' && tx.collateralAsset) {
    return `${address} ${verb} ${amount} ${tx.collateralAsset}`;
  }

  return `${address} ${verb} ${amount} ${tx.asset}`;
}

export function getDetailedSummary(tx: Transaction): string[] {
  const amount = formatAmount(tx.amount, tx.asset);
  const summaries: string[] = [];

  switch (tx.action) {
    case 'supply':
      summaries.push(`This user supplied ${amount} ${tx.asset} to Morpho Blue.`);
      if (tx.apy) {
        summaries.push(`They're now earning approximately ${formatAPY(tx.apy)} APY on this position.`);
      }
      if (tx.healthFactor && tx.healthFactor > 1.5) {
        summaries.push(`Their collateral position is healthy with a ${tx.healthFactor.toFixed(2)} health factor.`);
      }
      break;

    case 'borrow':
      summaries.push(`This user borrowed ${amount} ${tx.asset} from Morpho Blue.`);
      if (tx.apy) {
        summaries.push(`They're paying approximately ${formatAPY(tx.apy)} APY on this loan.`);
      }
      if (tx.healthFactor) {
        if (tx.healthFactor > 1.5) {
          summaries.push(`Their position remains healthy with a ${tx.healthFactor.toFixed(2)} health factor.`);
        } else if (tx.healthFactor > 1.1) {
          summaries.push(`Their health factor of ${tx.healthFactor.toFixed(2)} is moderate - they should monitor this position.`);
        } else {
          summaries.push(`Warning: Their health factor of ${tx.healthFactor.toFixed(2)} is low and at risk of liquidation.`);
        }
      }
      break;

    case 'repay':
      summaries.push(`This user repaid ${amount} ${tx.asset} to reduce their Morpho Blue debt.`);
      if (tx.healthFactor) {
        summaries.push(`This improved their health factor to ${tx.healthFactor.toFixed(2)}.`);
      }
      summaries.push(`Their outstanding debt has been reduced accordingly.`);
      break;

    case 'withdraw':
      summaries.push(`This user withdrew ${amount} ${tx.asset} from their Morpho Blue position.`);
      if (tx.healthFactor) {
        summaries.push(`Their health factor is now ${tx.healthFactor.toFixed(2)}.`);
      }
      summaries.push(`These funds have been returned to their wallet.`);
      break;

    case 'liquidation':
      summaries.push(`A liquidation occurred on this position.`);
      if (tx.collateralAsset && tx.collateralAmount) {
        summaries.push(`${formatAmount(tx.collateralAmount, tx.collateralAsset)} ${tx.collateralAsset} collateral was seized.`);
      }
      summaries.push(`${amount} ${tx.asset} of debt was repaid in the process.`);
      summaries.push(`The liquidator received a bonus for maintaining protocol health.`);
      break;
  }

  return summaries;
}

export function getActionDescription(action: ActionType): string {
  const descriptions: Record<ActionType, string> = {
    supply: 'Deposit assets to earn yield',
    borrow: 'Borrow assets against collateral',
    repay: 'Repay borrowed assets',
    withdraw: 'Withdraw deposited assets',
    liquidation: 'Position liquidated due to low health',
  };
  return descriptions[action];
}

export function getHealthStatus(healthFactor?: number): { label: string; color: string } {
  if (!healthFactor) return { label: 'Unknown', color: 'text-gray-500' };

  if (healthFactor >= 2) {
    return { label: 'Very Healthy', color: 'text-green-600' };
  } else if (healthFactor >= 1.5) {
    return { label: 'Healthy', color: 'text-green-500' };
  } else if (healthFactor >= 1.2) {
    return { label: 'Moderate', color: 'text-yellow-500' };
  } else if (healthFactor >= 1.05) {
    return { label: 'At Risk', color: 'text-orange-500' };
  }
  return { label: 'Critical', color: 'text-red-600' };
}
