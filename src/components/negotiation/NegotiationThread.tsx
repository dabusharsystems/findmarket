import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Check, 
  X, 
  ArrowRightLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Negotiation {
  id: string;
  bid_id: string;
  listing_id: string;
  from_user_id: string;
  to_user_id: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  round_number: number;
  created_at: string;
  responded_at: string | null;
}

interface NegotiationThreadProps {
  negotiations: Negotiation[];
  currentUserId: string;
  bidPrice: number;
  maxRounds?: number;
  onAccept: (negotiationId: string) => Promise<void>;
  onReject: (negotiationId: string) => Promise<void>;
  onCounterOffer: (price: number, message: string) => Promise<void>;
  isLoading?: boolean;
}

export const NegotiationThread = ({
  negotiations,
  currentUserId,
  bidPrice,
  maxRounds = 5,
  onAccept,
  onReject,
  onCounterOffer,
  isLoading = false,
}: NegotiationThreadProps) => {
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const sortedNegotiations = [...negotiations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const latestNegotiation = sortedNegotiations[sortedNegotiations.length - 1];
  const isMyTurn = latestNegotiation?.to_user_id === currentUserId && latestNegotiation?.status === 'pending';
  const canCounter = sortedNegotiations.length < maxRounds;
  const isResolved = latestNegotiation?.status === 'accepted' || latestNegotiation?.status === 'rejected';

  const handleAccept = async (id: string) => {
    setActionLoading('accept');
    await onAccept(id);
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading('reject');
    await onReject(id);
    setActionLoading(null);
  };

  const handleCounter = async () => {
    if (!counterPrice || !counterMessage.trim()) return;
    setActionLoading('counter');
    await onCounterOffer(parseFloat(counterPrice), counterMessage.trim());
    setCounterPrice('');
    setCounterMessage('');
    setShowCounterForm(false);
    setActionLoading(null);
  };

  const getStatusBadge = (status: Negotiation['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'countered':
        return <Badge variant="secondary">Counter Offered</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-accent" />
            Negotiation
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Round {sortedNegotiations.length}/{maxRounds}
            </span>
            {!canCounter && !isResolved && (
              <Badge variant="outline" className="text-destructive border-destructive">
                Max rounds reached
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Initial Bid */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Initial Offer</span>
            <span className="font-semibold text-accent">KES {bidPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Negotiation Messages */}
        {sortedNegotiations.map((neg, index) => (
          <div
            key={neg.id}
            className={`rounded-lg p-4 ${
              neg.from_user_id === currentUserId
                ? 'bg-accent/10 ml-4'
                : 'bg-muted/50 mr-4'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {neg.from_user_id === currentUserId ? 'You' : 'Other Party'}
                </span>
                {getStatusBadge(neg.status)}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(neg.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-foreground">
                KES {neg.price.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{neg.message}</p>
          </div>
        ))}

        {/* Action Buttons */}
        {isMyTurn && !isResolved && (
          <div className="border-t border-border pt-4 space-y-3">
            {!showCounterForm ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAccept(latestNegotiation.id)}
                  disabled={isLoading || actionLoading !== null}
                  className="flex-1"
                >
                  {actionLoading === 'accept' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept Offer
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(latestNegotiation.id)}
                  disabled={isLoading || actionLoading !== null}
                  className="flex-1"
                >
                  {actionLoading === 'reject' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                {canCounter && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCounterForm(true)}
                    disabled={isLoading || actionLoading !== null}
                    className="flex-1"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Counter Offer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Counter offers are free after the first bid.
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Your Counter Price (KES)</label>
                  <Input
                    type="number"
                    placeholder="Enter your price"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea
                    placeholder="Explain your counter offer..."
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCounter}
                    disabled={!counterPrice || !counterMessage.trim() || actionLoading !== null}
                    className="flex-1"
                  >
                    {actionLoading === 'counter' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Submit Counter Offer
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCounterForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resolved State */}
        {isResolved && (
          <div className={`rounded-lg p-4 text-center ${
            latestNegotiation.status === 'accepted' 
              ? 'bg-success/10 border border-success/20' 
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            <span className={`font-medium ${
              latestNegotiation.status === 'accepted' ? 'text-success' : 'text-destructive'
            }`}>
              {latestNegotiation.status === 'accepted' 
                ? '🎉 Offer Accepted! Contact details have been shared.'
                : 'Negotiation ended - offer was rejected.'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
