import { Package, Wrench } from 'lucide-react';

interface ListingTypeSelectorProps {
  listingType: 'product' | 'service';
  onTypeChange: (type: 'product' | 'service') => void;
}

export const ListingTypeSelector = ({ listingType, onTypeChange }: ListingTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <label className="text-base font-semibold">What are you looking for?</label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onTypeChange('product')}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
            listingType === 'product'
              ? 'border-product bg-product-light'
              : 'border-border hover:border-product/50'
          }`}
        >
          <div className={`p-3 rounded-lg ${listingType === 'product' ? 'bg-product/20' : 'bg-muted'}`}>
            <Package className={`h-6 w-6 ${listingType === 'product' ? 'text-product' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-center">
            <div className={`font-semibold ${listingType === 'product' ? 'text-product' : ''}`}>
              A Product
            </div>
            <div className="text-xs text-muted-foreground">Physical items</div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onTypeChange('service')}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
            listingType === 'service'
              ? 'border-service bg-service-light'
              : 'border-border hover:border-service/50'
          }`}
        >
          <div className={`p-3 rounded-lg ${listingType === 'service' ? 'bg-service/20' : 'bg-muted'}`}>
            <Wrench className={`h-6 w-6 ${listingType === 'service' ? 'text-service' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-center">
            <div className={`font-semibold ${listingType === 'service' ? 'text-service' : ''}`}>
              A Service
            </div>
            <div className="text-xs text-muted-foreground">Professional help</div>
          </div>
        </button>
      </div>
    </div>
  );
};
