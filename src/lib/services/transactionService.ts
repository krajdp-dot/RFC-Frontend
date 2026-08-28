import { prisma } from '../prisma';
import type { Prisma } from '../../generated/prisma/client';

export type CreateLedgerEntryInput = {
  accountId: string;
  entityId?: string;
  amount: number; // positive for debit, negative for credit
};

export type CreateInventoryEntryInput = {
  productId: string;
  quantity: number; // positive for in, negative for out
  unitPrice: number;
  totalValue: number; // positive for in, negative for out (matching quantity)
};

export type CreateBusinessEventInput = {
  type: string;
  date: Date;
  reference?: string;
  description?: string;
  createdBy?: string;
  ledgerEntries: CreateLedgerEntryInput[];
  inventoryEntries?: CreateInventoryEntryInput[];
};

export async function createBusinessEvent(data: CreateBusinessEventInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Validate double-entry accounting: Debits must equal Credits
    const sum = data.ledgerEntries.reduce((acc, entry) => acc + entry.amount, 0);
    if (sum !== 0) {
      throw new Error(`Invalid transaction: Ledger entries do not balance. Difference: ${sum}`);
    }

    // Create the core event
    const event = await tx.businessEvent.create({
      data: {
        type: data.type,
        date: data.date,
        reference: data.reference,
        description: data.description,
        createdBy: data.createdBy,
        ledgerEntries: {
          create: data.ledgerEntries.map(entry => ({
            accountId: entry.accountId,
            entityId: entry.entityId,
            amount: entry.amount,
          }))
        },
        ...(data.inventoryEntries && data.inventoryEntries.length > 0 ? {
          inventoryEntries: {
            create: data.inventoryEntries.map(entry => ({
              productId: entry.productId,
              quantity: entry.quantity,
              unitPrice: entry.unitPrice,
              totalValue: entry.totalValue,
            }))
          }
        } : {})
      },
      include: {
        ledgerEntries: true,
        inventoryEntries: true,
      }
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        entityType: 'BusinessEvent',
        entityId: event.id,
        action: 'CREATE',
        newValue: JSON.stringify(data),
        userId: data.createdBy || 'system',
      }
    });

    return event;
  });
}

// Higher level API functions will be implemented to compose CreateBusinessEventInput.

