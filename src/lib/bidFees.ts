/**
 * Tiered Bid Fee Calculator
 * 
 * Fee tiers based on listing budget:
 * - Budget 0 – 2,000 KES → 20 KES (1.0%)
 * - 2,001 – 15,000 KES → 100 KES (0.6%)
 * - 15,001 – 100,000 KES → 400 KES (0.4%)
 * - 100,001 – 500,000 KES → 1,500 KES (0.3%)
 * - 500,001 – 1,000,000 KES → 3,000 KES (0.3%)
 * - 1,000,001+ KES → 5,000 KES (hard cap)
 */

export type TrustLevel = 'low' | 'standard' | 'trusted' | 'verified';

export interface BidFeeInfo {
  fee: number;
  tier: string;
  budgetRange: string;
  maxPercentage: string;
  typicalCategory: string;
}

export interface TrustDiscount {
  level: TrustLevel;
  multiplier: number;
  label: string;
  discountPercent: number;
}

export const TRUST_DISCOUNTS: Record<TrustLevel, TrustDiscount> = {
  verified: {
    level: 'verified',
    multiplier: 0.80,
    label: 'Verified Seller',
    discountPercent: 20,
  },
  trusted: {
    level: 'trusted',
    multiplier: 0.90,
    label: 'Trusted Seller',
    discountPercent: 10,
  },
  standard: {
    level: 'standard',
    multiplier: 1.0,
    label: 'Standard',
    discountPercent: 0,
  },
  low: {
    level: 'low',
    multiplier: 1.15,
    label: 'Low Rated',
    discountPercent: -15, // Penalty
  },
};

export function calculateBidFee(budgetMax: number | null, budgetMin: number | null): BidFeeInfo {
  // Use budget_max if available, otherwise use budget_min
  const budget = budgetMax ?? budgetMin ?? 0;
  
  if (budget <= 2000) {
    return {
      fee: 20,
      tier: 'Basic',
      budgetRange: '0 – 2,000 KES',
      maxPercentage: '1.0%',
      typicalCategory: 'Errands, small accessories, basic repairs',
    };
  } else if (budget <= 15000) {
    return {
      fee: 100,
      tier: 'Standard',
      budgetRange: '2,001 – 15,000 KES',
      maxPercentage: '0.6%',
      typicalCategory: 'Electronics, furniture, professional services',
    };
  } else if (budget <= 100000) {
    return {
      fee: 400,
      tier: 'Premium',
      budgetRange: '15,001 – 100,000 KES',
      maxPercentage: '0.4%',
      typicalCategory: 'Laptops, tools, consultants',
    };
  } else if (budget <= 500000) {
    return {
      fee: 1500,
      tier: 'Professional',
      budgetRange: '100,001 – 500,000 KES',
      maxPercentage: '0.3%',
      typicalCategory: 'Used bikes, high-end tech, bulk supplies',
    };
  } else if (budget <= 1000000) {
    return {
      fee: 3000,
      tier: 'Business',
      budgetRange: '500,001 – 1,000,000 KES',
      maxPercentage: '0.3%',
      typicalCategory: 'Cars, machinery, commercial equipment',
    };
  } else {
    return {
      fee: 5000,
      tier: 'Enterprise',
      budgetRange: '1,000,001+ KES',
      maxPercentage: '≤0.5%',
      typicalCategory: 'Real estate, vehicles, industrial',
    };
  }
}

/**
 * Apply trust-based discount/penalty to the base fee
 */
export function applyTrustDiscount(baseFee: number, trustLevel: TrustLevel): number {
  const discount = TRUST_DISCOUNTS[trustLevel];
  return Math.round(baseFee * discount.multiplier);
}

/**
 * Get full fee info including trust discount
 */
export function calculateFinalBidFee(
  budgetMax: number | null,
  budgetMin: number | null,
  trustLevel: TrustLevel = 'standard'
): {
  baseFee: number;
  finalFee: number;
  discount: TrustDiscount;
  feeInfo: BidFeeInfo;
} {
  const feeInfo = calculateBidFee(budgetMax, budgetMin);
  const discount = TRUST_DISCOUNTS[trustLevel];
  const finalFee = applyTrustDiscount(feeInfo.fee, trustLevel);

  return {
    baseFee: feeInfo.fee,
    finalFee,
    discount,
    feeInfo,
  };
}

/**
 * Category minimum budget requirements
 */
export const CATEGORY_MIN_BUDGETS: Record<string, number> = {
  'Property': 500000,
  'Vehicles': 50000,
  'Electronics': 1000,
  'Furniture': 5000,
  'Fashion': 500,
  'Home & Garden': 1000,
};

export function getCategoryMinBudget(categoryName: string | undefined): number {
  if (!categoryName) return 0;
  return CATEGORY_MIN_BUDGETS[categoryName] ?? 0;
}

export function validateBudgetForCategory(
  budget: number,
  categoryName: string | undefined,
  categoryMinBudget?: number
): { valid: boolean; message?: string; minBudget: number } {
  // Use database min_budget if available, otherwise fallback to hardcoded
  const minBudget = categoryMinBudget ?? getCategoryMinBudget(categoryName);
  
  if (minBudget > 0 && budget < minBudget) {
    return {
      valid: false,
      message: `${categoryName} listings require a minimum budget of KES ${minBudget.toLocaleString()}`,
      minBudget,
    };
  }
  
  return { valid: true, minBudget };
}

export function formatFee(fee: number): string {
  return `KES ${fee.toLocaleString()}`;
}

export function getTrustLevelBadgeColor(trustLevel: TrustLevel): string {
  switch (trustLevel) {
    case 'verified':
      return 'bg-success/10 text-success border-success/30';
    case 'trusted':
      return 'bg-accent/10 text-accent border-accent/30';
    case 'low':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}
