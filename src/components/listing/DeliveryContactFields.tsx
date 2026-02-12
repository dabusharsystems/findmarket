import { Truck, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryContactFieldsProps {
  deliveryPreference: string;
  contactMethod: string;
  onDeliveryChange: (value: string) => void;
  onContactChange: (value: string) => void;
}

export const DeliveryContactFields = ({
  deliveryPreference,
  contactMethod,
  onDeliveryChange,
  onContactChange,
}: DeliveryContactFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Delivery Preference */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Delivery / Pickup Preference
        </Label>
        <Select value={deliveryPreference} onValueChange={onDeliveryChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Delivery or Pickup</SelectItem>
            <SelectItem value="delivery">Delivery Only</SelectItem>
            <SelectItem value="pickup">Pickup Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Method */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Preferred Contact Method
        </Label>
        <Select value={contactMethod} onValueChange={onContactChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Email & Phone</SelectItem>
            <SelectItem value="email">Email Only</SelectItem>
            <SelectItem value="phone">Phone Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
