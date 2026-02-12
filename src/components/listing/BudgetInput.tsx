import { DollarSign, AlertCircle, BadgeCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatFee } from '@/lib/bidFees';

interface BudgetInputProps {
  targetBudget: string;
  onTargetBudgetChange: (value: string) => void;
  budgetError: string | null;
  feePreview: { fee: number; tier: string };
  minBudget?: number;
}

export const BudgetInput = ({
  targetBudget,
  onTargetBudgetChange,
  budgetError,
  feePreview,
  minBudget,
}: BudgetInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Target Budget (KES)
        <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
          <BadgeCheck className="h-3 w-3" />
          Negotiable
        </span>
      </Label>
      <p className="text-xs text-muted-foreground">
        This is a price reference, not a limit. Sellers may submit offers above or below this amount.
      </p>
      <Input
        placeholder="Enter target budget"
        type="number"
        value={targetBudget}
        onChange={(e) => onTargetBudgetChange(e.target.value)}
        min={minBudget?.toString() || "0"}
        className={`h-12 ${budgetError ? 'border-destructive' : ''}`}
      />
      
      {/* Budget Error */}
      {budgetError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {budgetError}
        </div>
      )}
      
      {/* Tip about negotiation */}
      <p className="text-xs text-muted-foreground italic">
        💡 Final price is negotiable. You can counter, accept, or reject offers from sellers.
      </p>
      
      {/* Removed seller access fee preview - not relevant for buyers */}
    </div>
  );
};