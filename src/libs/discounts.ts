export type QuantityDiscount = {
  percentage: number;
  range: string;
};

export function matchesRange(range: string, quantity: number): boolean {
  if (!range || !Number.isFinite(quantity)) return false;

  if (/^>=\d+$/.test(range)) {
    return quantity >= parseInt(range.slice(2), 10);
  }
  if (/^<=\d+$/.test(range)) {
    return quantity <= parseInt(range.slice(2), 10);
  }
  if (/^\d+-\d+$/.test(range)) {
    const [min, max] = range.split("-").map(Number);
    return quantity >= min && quantity <= max;
  }
  if (/^>\d+$/.test(range)) {
    return quantity > parseInt(range.slice(1), 10);
  }
  if (/^<\d+$/.test(range)) {
    return quantity < parseInt(range.slice(1), 10);
  }
  if (/^\d+$/.test(range)) {
    return quantity === parseInt(range, 10);
  }
  return false;
}

export function getDiscountedUnitPrice(
  basePrice: number,
  discounts: QuantityDiscount[] | undefined,
  quantity: number
): { compare_at_price: number; price: number | null } {
  if (!basePrice || !quantity) {
    return { compare_at_price: 0, price: null };
  }

  let applicableDiscount: QuantityDiscount | null = null;

  (discounts || []).forEach((discount) => {
    if (matchesRange(discount.range, quantity)) {
      if (
        !applicableDiscount ||
        discount.percentage > applicableDiscount.percentage
      ) {
        applicableDiscount = discount;
      }
    }
  });

  if (applicableDiscount) {
    const discountedPrice =
      basePrice -
      basePrice * ((applicableDiscount as QuantityDiscount).percentage / 100);
    return {
      compare_at_price: basePrice,
      price: parseFloat(discountedPrice.toFixed(2)),
    };
  }

  return { compare_at_price: basePrice, price: null };
}

export function getUniqueDiscountPercentages(
  discountsLists: Array<QuantityDiscount[] | undefined>
): number[] {
  const uniqueDiscounts = new Set<number>();
  discountsLists.forEach((discounts) => {
    (discounts || []).forEach((discount) => {
      uniqueDiscounts.add(discount.percentage);
    });
  });
  return Array.from(uniqueDiscounts);
}
