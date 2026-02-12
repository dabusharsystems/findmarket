import { useState } from 'react';
import { 
  DollarSign, 
  MapPin, 
  Truck, 
  Clock, 
  MessageSquare,
  Camera,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { formatFee } from '@/lib/bidFees';

interface SellerBidFormProps {
  listingId: string;
  userId: string;
  targetBudget: { min: number | null; max: number | null };
  bidFee: number;
  onSubmit: (data: BidFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface BidFormData {
  price: number;
  message: string;
  seller_location: string;
  delivery_options: string;
  availability?: string;
  offer_valid_until?: string;
  images?: string[];
}

export const SellerBidForm = ({
  listingId,
  userId,
  targetBudget,
  bidFee,
  onSubmit,
  isLoading = false,
}: SellerBidFormProps) => {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState('');
  const [availability, setAvailability] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!message || message.trim().length < 30) {
      newErrors.message = 'Message must be at least 30 characters';
    }

    if (!sellerLocation.trim()) {
      newErrors.sellerLocation = 'Location is required';
    }

    if (!deliveryOptions) {
      newErrors.deliveryOptions = 'Please select delivery options';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    await onSubmit({
      price: parseFloat(price),
      message: message.trim(),
      seller_location: sellerLocation.trim(),
      delivery_options: deliveryOptions,
      availability: availability.trim() || undefined,
      offer_valid_until: validUntil || undefined,
      images: images.length > 0 ? images : undefined,
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          Submit Your Offer
        </CardTitle>
        <CardDescription>
          Target budget is a guide. Final price is negotiable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Your Offered Price (KES) *
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter your price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              className={errors.price ? 'border-destructive' : ''}
            />
            {targetBudget.max && (
              <p className="text-xs text-muted-foreground">
                Buyer's target: KES {targetBudget.min?.toLocaleString() || '0'} - {targetBudget.max.toLocaleString()}
              </p>
            )}
            {errors.price && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.price}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Your Location *
            </Label>
            <Input
              id="location"
              placeholder="e.g., Nairobi, Westlands"
              value={sellerLocation}
              onChange={(e) => setSellerLocation(e.target.value)}
              className={errors.sellerLocation ? 'border-destructive' : ''}
            />
            {errors.sellerLocation && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.sellerLocation}
              </p>
            )}
          </div>

          {/* Delivery Options */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery Options *
            </Label>
            <Select value={deliveryOptions} onValueChange={setDeliveryOptions}>
              <SelectTrigger className={errors.deliveryOptions ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select delivery option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery_included">Delivery Included</SelectItem>
                <SelectItem value="delivery_extra">Delivery Available (Extra Cost)</SelectItem>
                <SelectItem value="pickup_only">Pickup Only</SelectItem>
                <SelectItem value="both">Delivery or Pickup</SelectItem>
              </SelectContent>
            </Select>
            {errors.deliveryOptions && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.deliveryOptions}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message to Buyer * (min 30 chars)
            </Label>
            <Textarea
              id="message"
              placeholder="Describe your offer, why you're the best choice, and any relevant details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={errors.message ? 'border-destructive' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{message.length}/30 characters minimum</span>
              {errors.message && (
                <span className="text-destructive">{errors.message}</span>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Availability (Optional)
              </Label>
              <Input
                id="availability"
                placeholder="e.g., Immediate, 2-3 days"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>

            {/* Offer Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="validUntil" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Offer Valid Until (Optional)
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={minDate}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos / Proof (Optional)
            </Label>
            <ImageUpload
              bucket="bid-images"
              userId={userId}
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          {/* Fee Notice */}
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Offer Submission Fee</span>
              <span className="text-lg font-bold text-accent">{formatFee(bidFee)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This one-time fee is required to submit your offer. Counter offers are free after the first bid.
            </p>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Submit Offer & Pay ${formatFee(bidFee)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
