/**
 * SQL queries for fetching lending data from Allium
 */

/**
 * Combined query for stablecoin lending events on Ethereum.
 * Fetches supply, borrow, repay, and withdraw actions for USDC, USDT, and PYUSD.
 * Uses a 5-minute lookback window for near-realtime data.
 */
export const STABLECOIN_LENDING_QUERY = `
WITH deposits AS (
  SELECT 'supply' AS action, chain, project, token_symbol,
         usd_amount, depositor_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.deposits
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -5, CURRENT_TIMESTAMP())
),
loans AS (
  SELECT 'borrow' AS action, chain, project, token_symbol,
         usd_amount, borrower_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.loans
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -5, CURRENT_TIMESTAMP())
),
repayments AS (
  SELECT 'repay' AS action, chain, project, token_symbol,
         usd_amount, borrower_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.repayments
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -5, CURRENT_TIMESTAMP())
),
withdrawals AS (
  SELECT 'withdraw' AS action, chain, project, token_symbol,
         usd_amount, withdrawer_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.withdrawals
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -5, CURRENT_TIMESTAMP())
)
SELECT * FROM deposits UNION ALL
SELECT * FROM loans UNION ALL
SELECT * FROM repayments UNION ALL
SELECT * FROM withdrawals
ORDER BY block_timestamp DESC
LIMIT 300
`;

/**
 * Get the query for a custom time window (in minutes).
 * Useful for initial load or catching up after being disconnected.
 */
export function getLendingQueryWithWindow(minutes: number): string {
  return `
WITH deposits AS (
  SELECT 'supply' AS action, chain, project, token_symbol,
         usd_amount, depositor_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.deposits
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -${minutes}, CURRENT_TIMESTAMP())
),
loans AS (
  SELECT 'borrow' AS action, chain, project, token_symbol,
         usd_amount, borrower_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.loans
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -${minutes}, CURRENT_TIMESTAMP())
),
repayments AS (
  SELECT 'repay' AS action, chain, project, token_symbol,
         usd_amount, borrower_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.repayments
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -${minutes}, CURRENT_TIMESTAMP())
),
withdrawals AS (
  SELECT 'withdraw' AS action, chain, project, token_symbol,
         usd_amount, withdrawer_address AS wallet, block_timestamp, transaction_hash
  FROM crosschain.lending.withdrawals
  WHERE chain = 'ethereum'
    AND UPPER(token_symbol) IN ('USDC', 'USDT', 'PYUSD')
    AND block_timestamp >= DATEADD('minute', -${minutes}, CURRENT_TIMESTAMP())
)
SELECT * FROM deposits UNION ALL
SELECT * FROM loans UNION ALL
SELECT * FROM repayments UNION ALL
SELECT * FROM withdrawals
ORDER BY block_timestamp DESC
LIMIT 300
`;
}
