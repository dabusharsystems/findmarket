import { Shield, ShieldCheck, ShieldAlert, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface TrustBadgeProps {
  trustLevel: string;
  averageRating?: number;
  totalConnections?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustBadge = ({
  trustLevel,
  averageRating,
  totalConnections,
  showDetails = false,
  size = 'md',
}: TrustBadgeProps) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  
  const getBadgeContent = () => {
    switch (trustLevel) {
      case 'verified':
        return {
          icon: <ShieldCheck className={`${iconSize} mr-1`} />,
          label: 'Verified',
          className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
          description: 'Top-rated seller with excellent track record. Enjoys 20% discount on bid fees.',
        };
      case 'trusted':
        return {
          icon: <Shield className={`${iconSize} mr-1`} />,
          label: 'Trusted',
          className: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
          description: 'Reliable seller with good ratings. Enjoys 10% discount on bid fees.',
        };
      case 'low':
        return {
          icon: <ShieldAlert className={`${iconSize} mr-1`} />,
          label: 'Low Rated',
          className: 'text-destructive border-destructive/50 hover:bg-destructive/10',
          description: 'This seller has received low ratings. 15% surcharge on bid fees.',
        };
      default:
        return {
          icon: <Shield className={`${iconSize} mr-1`} />,
          label: 'Standard',
          className: 'border-border',
          description: 'Standard seller with no special rating yet.',
        };
    }
  };

  const { icon, label, className, description } = getBadgeContent();

  const badge = (
    <Badge variant="outline" className={`${className} ${size === 'lg' ? 'text-sm py-1 px-3' : ''}`}>
      {icon}
      {label}
    </Badge>
  );

  if (!showDetails) {
    return badge;
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
      
      {averageRating !== undefined && averageRating > 0 && (
        <span className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          {averageRating.toFixed(1)}
        </span>
      )}
      
      {totalConnections !== undefined && totalConnections > 0 && (
        <span className="text-sm text-muted-foreground">
          ({totalConnections} deals)
        </span>
      )}
    </div>
  );
};
