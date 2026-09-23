import { prisma } from '../prisma';

export async function getAccountBalance(accountId: string): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { accountId },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

export async function getCustomerOutstanding(customerId: string, accounts: { receivableAccountId: string }): Promise<number> {
  // Outstanding is the total debit on the AR account for this customer
  const result = await prisma.ledgerEntry.aggregate({
    where: { 
      entityId: customerId,
      accountId: accounts.receivableAccountId
    },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

export async function getSupplierPayable(supplierId: string, accounts: { payableAccountId: string }): Promise<number> {
  // Payable is the total credit on the AP account for this supplier (returns positive value for display)
  const result = await prisma.ledgerEntry.aggregate({
    where: { 
      entityId: supplierId,
      accountId: accounts.payableAccountId
    },
    _sum: { amount: true },
  });
  const rawBalance = result._sum.amount || 0;
  // Credits are negative in our double-entry system. 
  // AP account will have a negative balance if we owe money.
  // We return the absolute value for business display logic.
  return Math.abs(rawBalance);
}

export async function getInventoryStock(productId: string): Promise<{ quantity: number; value: number }> {
  const result = await prisma.inventoryEntry.aggregate({
    where: { productId },
    _sum: { 
      quantity: true,
      totalValue: true,
    },
  });
  
  return {
    quantity: result._sum.quantity || 0,
    value: result._sum.totalValue || 0,
  };
}

export async function getBusinessProfit(dateRange: { start: Date; end: Date }, accounts: { revenueAccountId: string, cogsAccountId: string, expenseAccountIds: string[] }) {
  // Revenue (Credits are negative, so we negate to get positive revenue)
  const revenueResult = await prisma.ledgerEntry.aggregate({
    where: {
      accountId: accounts.revenueAccountId,
      event: { date: { gte: dateRange.start, lte: dateRange.end } }
    },
    _sum: { amount: true }
  });
  const revenue = -(revenueResult._sum.amount || 0);

  // COGS (Debits are positive)
  const cogsResult = await prisma.ledgerEntry.aggregate({
    where: {
      accountId: accounts.cogsAccountId,
      event: { date: { gte: dateRange.start, lte: dateRange.end } }
    },
    _sum: { amount: true }
  });
  const cogs = cogsResult._sum.amount || 0;

  // Expenses (Debits are positive)
  const expenseResult = await prisma.ledgerEntry.aggregate({
    where: {
      accountId: { in: accounts.expenseAccountIds },
      event: { date: { gte: dateRange.start, lte: dateRange.end } }
    },
    _sum: { amount: true }
  });
  const expenses = expenseResult._sum.amount || 0;

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;

  return {
    revenue,
    cogs,
    grossProfit,
    expenses,
    netProfit
  };
}
