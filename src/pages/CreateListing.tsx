import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, FileText, MapPin, Calendar } from 'lucide-react';
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
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ImageUpload';
import { validateBudgetForCategory, calculateBidFee } from '@/lib/bidFees';
import { ListingTypeSelector } from '@/components/listing/ListingTypeSelector';
import { BudgetInput } from '@/components/listing/BudgetInput';
import { DeliveryContactFields } from '@/components/listing/DeliveryContactFields';
import { UrgencyVisibilityFields } from '@/components/listing/UrgencyVisibilityFields';

interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  min_budget: number | null;
}

const CreateListing = () => {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as 'product' | 'service') || 'product';
  
  // Core fields
  const [listingType, setListingType] = useState<'product' | 'service'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'any'>('any');
  const [requiredDate, setRequiredDate] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // New negotiation fields
  const [deliveryPreference, setDeliveryPreference] = useState('both');
  const [contactMethod, setContactMethod] = useState('both');
  const [urgency, setUrgency] = useState('');
  const [visibilityDays, setVisibilityDays] = useState('30');

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === categoryId),
    [categories, categoryId]
  );

  const feePreview = useMemo(() => {
    const budget = targetBudget ? parseFloat(targetBudget) : null;
    return calculateBidFee(budget, null);
  }, [targetBudget]);

  useEffect(() => {
    if (!selectedCategory || !targetBudget) {
      setBudgetError(null);
      return;
    }

    const budget = parseFloat(targetBudget);
    if (isNaN(budget)) {
      setBudgetError(null);
      return;
    }

    const validation = validateBudgetForCategory(
      budget,
      selectedCategory.name,
      selectedCategory.min_budget ?? undefined
    );

    setBudgetError(validation.valid ? null : validation.message ?? null);
  }, [targetBudget, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, type, min_budget')
        .eq('type', listingType)
        .order('name');
      
      if (data) {
        setCategories(data);
        setCategoryId('');
      }
    };

    fetchCategories();
  }, [listingType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a listing.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim() || description.trim().length < 50) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields. Description must be at least 50 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (targetBudget && selectedCategory) {
      const validation = validateBudgetForCategory(
        parseFloat(targetBudget),
        selectedCategory.name,
        selectedCategory.min_budget ?? undefined
      );
      
      if (!validation.valid) {
        toast({
          title: 'Invalid Budget',
          description: validation.message,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    const listingData = {
      buyer_id: user.id,
      title: title.trim(),
      description: description.trim(),
      listing_type: listingType,
      category_id: categoryId || null,
      condition: listingType === 'product' ? condition : null,
      required_date: listingType === 'service' && requiredDate ? requiredDate : null,
      budget_min: null,
      budget_max: targetBudget ? parseFloat(targetBudget) : null,
      location: location.trim() || null,
      images: images.length > 0 ? images : null,
      delivery_preference: deliveryPreference as 'delivery' | 'pickup' | 'both',
      contact_method: contactMethod as 'email' | 'phone' | 'both',
      urgency: urgency ? urgency as 'low' | 'medium' | 'high' | 'urgent' : null,
      visibility_days: parseInt(visibilityDays),
      is_negotiable: true,
    };

    const { error } = await supabase
      .from('listings')
      .insert(listingData);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Listing Created!',
      description: 'Your listing is now live and visible to sellers.',
    });

    navigate('/dashboard/buyer');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create a Listing</h1>
          <p className="text-muted-foreground">
            Describe what you're looking for and let sellers come to you.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Listing Type */}
            <ListingTypeSelector 
              listingType={listingType} 
              onTypeChange={setListingType} 
            />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title *
              </Label>
              <Input
                id="title"
                placeholder={listingType === 'product' 
                  ? "e.g., Looking for a Samsung Galaxy S24"
                  : "e.g., Need a plumber for bathroom renovation"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description * (min 50 characters)</Label>
              <Textarea
                id="description"
                placeholder="Provide details about what you're looking for, including specifications, requirements, or any preferences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{description.length}/50 characters minimum</span>
                {description.length < 50 && description.length > 0 && (
                  <span className="text-destructive">{50 - description.length} more needed</span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory?.min_budget && selectedCategory.min_budget > 0 && (
                <p className="text-sm text-muted-foreground">
                  Minimum budget for {selectedCategory.name}: KES {selectedCategory.min_budget.toLocaleString()}
                </p>
              )}
            </div>

            {/* Budget */}
            <BudgetInput
              targetBudget={targetBudget}
              onTargetBudgetChange={setTargetBudget}
              budgetError={budgetError}
              feePreview={feePreview}
              minBudget={selectedCategory?.min_budget ?? undefined}
            />

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Westlands"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Delivery & Contact */}
            <DeliveryContactFields
              deliveryPreference={deliveryPreference}
              contactMethod={contactMethod}
              onDeliveryChange={setDeliveryPreference}
              onContactChange={setContactMethod}
            />

            {/* Condition (Products only) */}
            {listingType === 'product' && (
              <div className="space-y-2">
                <Label>Condition Preference</Label>
                <Select value={condition} onValueChange={(val) => setCondition(val as 'new' | 'used' | 'any')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Condition</SelectItem>
                    <SelectItem value="new">New Only</SelectItem>
                    <SelectItem value="used">Used Acceptable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Required Date (Services only) */}
            {listingType === 'service' && (
              <div className="space-y-2">
                <Label htmlFor="requiredDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Required By Date
                </Label>
                <Input
                  id="requiredDate"
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
              </div>
            )}

            {/* Urgency & Visibility */}
            <UrgencyVisibilityFields
              urgency={urgency}
              visibilityDays={visibilityDays}
              onUrgencyChange={setUrgency}
              onVisibilityChange={setVisibilityDays}
            />

            {/* Images */}
            {user && (
              <div className="space-y-2">
                <Label>Reference Images (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add photos to help sellers better understand what you're looking for.
                </p>
                <ImageUpload
                  bucket="listing-images"
                  userId={user.id}
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />
              </div>
            )}

            {/* Submit */}
            <div className="pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                variant={listingType === 'product' ? 'product' : 'service'}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  <>
                    Create Listing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
