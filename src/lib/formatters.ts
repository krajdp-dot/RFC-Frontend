/**
 * Format number to full Indian currency notation.
 * Example: 180000 → "₹1,80,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format to compact Indian notation (Lakhs/Crores).
 * Examples: 180000 → "₹1.8L", 12500000 → "₹1.25Cr", 85000 → "₹85K"
 */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    const cr = abs / 1_00_00_000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')}Cr`;
  }
  if (abs >= 1_00_000) {
    const l = abs / 1_00_000;
    return `${sign}₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

/**
 * Get time-appropriate greeting.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a date for display.
 * Example: new Date() → "13 Aug 2026"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
