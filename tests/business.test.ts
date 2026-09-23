import { expect, test, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { getAccountBalance, getBusinessProfit, getCustomerOutstanding, getInventoryStock, getSupplierPayable } from '../src/lib/services/balanceService';

test('Day 1 Business Scenario Validations', async () => {
  // Fetch required accounts and entities
  const cash = await prisma.account.findFirstOrThrow({ where: { name: 'Cash' } });
  const sbi = await prisma.account.findFirstOrThrow({ where: { name: 'SBI' } });
  const receivables = await prisma.account.findFirstOrThrow({ where: { name: 'Customer Receivables' } });
  const payables = await prisma.account.findFirstOrThrow({ where: { name: 'Supplier Payables' } });
  const inventoryAsset = await prisma.account.findFirstOrThrow({ where: { name: 'Inventory' } });
  const cogs = await prisma.account.findFirstOrThrow({ where: { name: 'Cost of Goods Sold' } });
  const revenue = await prisma.account.findFirstOrThrow({ where: { name: 'Sales Revenue' } });
  const generalExpense = await prisma.account.findFirstOrThrow({ where: { name: 'General Expense' } });
  
  const supplierA = await prisma.entity.findFirstOrThrow({ where: { name: 'Merchant A' } });
  const customerRajesh = await prisma.entity.findFirstOrThrow({ where: { name: 'Rajesh Traders' } });
  const apple = await prisma.product.findFirstOrThrow({ where: { name: 'Apple' } });

  // 1. Verify Cash in Hand is 92,000
  // Note: we store in minor units (paise). 92,000 = 92000_00
  const cashBalance = await getAccountBalance(cash.id);
  expect(cashBalance).toBe(92000_00);

  // 2. Verify Bank Balance is 50,000
  const bankBalance = await getAccountBalance(sbi.id);
  expect(bankBalance).toBe(50000_00);

  // 3. Verify Inventory value is 50,000
  const stock = await getInventoryStock(apple.id);
  expect(stock.value).toBe(50000_00);
  
  // 4. Verify supplier credit outstanding is 20,000
  const supplierPayable = await getSupplierPayable(supplierA.id, { payableAccountId: payables.id });
  expect(supplierPayable).toBe(20000_00);

  // 5. Verify customer receivables is 60,000
  const customerOutstanding = await getCustomerOutstanding(customerRajesh.id, { receivableAccountId: receivables.id });
  expect(customerOutstanding).toBe(60000_00);

  // 6. Verify Profit
  const profit = await getBusinessProfit(
    { start: new Date('2026-08-01'), end: new Date('2026-08-31') },
    {
      revenueAccountId: revenue.id,
      cogsAccountId: cogs.id,
      expenseAccountIds: [generalExpense.id]
    }
  );

  // Gross profit = 1,80,000 (Rev) - 1,00,000 (COGS) = 80,000
  expect(profit.grossProfit).toBe(80000_00);
  
  // Net profit = 80,000 - 8,000 (Exp) = 72,000
  expect(profit.netProfit).toBe(72000_00);
});
