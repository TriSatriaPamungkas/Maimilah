// atoms/priceTag.tsx
interface PriceTagProps {
  amount: number;
  currency?: string;
}

export const PriceTag = ({ amount, currency = "IDR" }: PriceTagProps) => {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return <span className="font-semibold text-gray-800">{formatted}</span>;
};
