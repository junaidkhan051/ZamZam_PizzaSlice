/**
 * Centralized currency formatting utility for Zam Zam Pizza Slice
 * All prices are displayed in Pakistani Rupees (PKR) formatted as "Rs. 1,250"
 */

export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs. 0';
  }
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

export function formatPriceUr(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'روپے 0';
  }
  const rounded = Math.round(amount);
  return `روپے ${rounded.toLocaleString('en-PK')}`;
}
