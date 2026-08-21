import { prisma } from '../prisma';
import { CreateBusinessEventInput } from './transactionService';
import { getAccountBalance, getInventoryStock, getCustomerOutstanding, getSupplierPayable } from './balanceService';

export async function validateTransaction(data: CreateBusinessEventInput) {
  // 1. Double Entry Balance Check (already in transactionService, but good to have here)
  const sum = data.ledgerEntries.reduce((acc, entry) => acc + entry.amount, 0);
  if (sum !== 0) {
    throw new Error(`Reconciliation Error: Ledger entries do not balance. Difference: ${sum}`);
  }

  // 2. Prevent Negative Cash/Bank Balances
  // First, group debits/credits by account
  const accountDeltas = new Map<string, number>();
  for (const entry of data.ledgerEntries) {
    accountDeltas.set(entry.accountId, (accountDeltas.get(entry.accountId) || 0) + entry.amount);
  }

  for (const [accountId, delta] of Array.from(accountDeltas.entries())) {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new Error(`Reconciliation Error: Account ${accountId} not found.`);

    if (account.type === 'CASH' || account.type === 'BANK' || account.type === 'UPI') {
      const currentBalance = await getAccountBalance(accountId);
      const projectedBalance = currentBalance + delta;
      
      // If delta is negative (credit to asset), and the projected balance drops below zero
      if (projectedBalance < 0) {
        throw new Error(`Reconciliation Error: Transaction would result in negative balance for ${account.name}. Projected: ${projectedBalance}`);
      }
    }
    
    // 3. Prevent over-payment from customers (Negative Receivable)
    if (account.type === 'RECEIVABLE' && delta < 0) {
      // Find the entity for this AR entry
      const arEntry = data.ledgerEntries.find(e => e.accountId === accountId);
      if (arEntry && arEntry.entityId) {
        const currentOutstanding = await getCustomerOutstanding(arEntry.entityId, { receivableAccountId: accountId });
        const projectedOutstanding = currentOutstanding + delta; // delta is negative for payment
        if (projectedOutstanding < 0) {
           throw new Error(`Reconciliation Error: Payment exceeds customer's outstanding balance.`);
        }
      }
    }

    // 4. Prevent over-payment to suppliers (Negative Payable)
    if (account.type === 'PAYABLE' && delta > 0) { // AP drops with Debit (positive)
       const apEntry = data.ledgerEntries.find(e => e.accountId === accountId);
       if (apEntry && apEntry.entityId) {
         // getSupplierPayable returns absolute value (positive).
         // The actual AP balance in ledger is negative (Credit).
         // Adding positive delta to negative balance -> moves toward zero.
         const currentRawBalance = await getAccountBalance(accountId);
         const projectedRawBalance = currentRawBalance + delta;
         if (projectedRawBalance > 0) {
           throw new Error(`Reconciliation Error: Payment exceeds supplier's outstanding payable.`);
         }
       }
    }
  }

  // 5. Prevent Negative Inventory
  if (data.inventoryEntries && data.inventoryEntries.length > 0) {
    const stockDeltas = new Map<string, number>();
    for (const entry of data.inventoryEntries) {
      stockDeltas.set(entry.productId, (stockDeltas.get(entry.productId) || 0) + entry.quantity);
    }

    for (const [productId, qtyDelta] of Array.from(stockDeltas.entries())) {
      if (qtyDelta < 0) {
        const { quantity: currentStock } = await getInventoryStock(productId);
        if (currentStock + qtyDelta < 0) {
           throw new Error(`Reconciliation Error: Transaction would result in negative inventory for Product ${productId}.`);
        }
      }
    }
  }

  return true;
}
