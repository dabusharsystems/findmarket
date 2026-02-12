import { AlertCircle, CreditCard, ShieldCheck, Star, BadgeCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { BidFeeInfo, TrustLevel, TrustDiscount, formatFee, getTrustLevelBadgeColor } from '@/lib/bidFees';

interface AccessFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeInfo: BidFeeInfo;
  listingTitle: string;
  onConfirm: () => void;
  loading?: boolean;
  trustLevel?: TrustLevel;
  trustDiscount?: TrustDiscount;
  baseFee?: number;
  finalFee?: number;
}

export function AccessFeeModal({
  open,
  onOpenChange,
  feeInfo,
  listingTitle,
  onConfirm,
  loading = false,
  trustLevel = 'standard',
  trustDiscount,
  baseFee,
  finalFee,
}: AccessFeeModalProps) {
  const displayFee = finalFee ?? feeInfo.fee;
  const showDiscount = trustDiscount && trustLevel !== 'standard' && baseFee;

  const getTrustIcon = () => {
    if (trustLevel === 'verified') return <BadgeCheck className="h-4 w-4" />;
    if (trustLevel === 'trusted') return <Star className="h-4 w-4" />;
    return null;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            Access Fee Required
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                To submit your bid on "{listingTitle}", a one-time access fee is required.
              </p>
              
              {/* Fee Breakdown */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {showDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Fee</span>
                    <span className="line-through text-muted-foreground">{formatFee(baseFee)}</span>
                  </div>
                )}
                
                {showDiscount && trustDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTrustLevelBadgeColor(trustLevel)}>
                        {getTrustIcon()}
                        <span className="ml-1">{trustDiscount.label}</span>
                      </Badge>
                    </div>
                    <span className={trustDiscount.discountPercent > 0 ? 'text-success' : 'text-destructive'}>
                      {trustDiscount.discountPercent > 0 ? `-${trustDiscount.discountPercent}%` : `+${Math.abs(trustDiscount.discountPercent)}%`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm text-muted-foreground">Offer Submission Fee</span>
                  <span className="text-lg font-bold text-foreground">{formatFee(displayFee)}</span>
                </div>
                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                  <span className="font-medium">Fee tier:</span> {feeInfo.tier} ({feeInfo.budgetRange})
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Your bid will be visible to the buyer immediately after payment</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>One-time fee per listing - no hidden charges</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Secure payment via Flutterwave</span>
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                <span>
                  This fee helps maintain a quality marketplace by ensuring serious sellers. 
                  Your bid will be submitted after successful payment.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-accent hover:bg-accent/90"
          >
            {loading ? 'Processing...' : `Pay ${formatFee(displayFee)} & Submit`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
