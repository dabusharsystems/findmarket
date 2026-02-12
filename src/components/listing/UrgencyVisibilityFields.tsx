import { Clock, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UrgencyVisibilityFieldsProps {
  urgency: string;
  visibilityDays: string;
  onUrgencyChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
}

export const UrgencyVisibilityFields = ({
  urgency,
  visibilityDays,
  onUrgencyChange,
  onVisibilityChange,
}: UrgencyVisibilityFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Urgency */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Urgency / Timeline (Optional)
        </Label>
        <Select value={urgency} onValueChange={onUrgencyChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - No rush</SelectItem>
            <SelectItem value="medium">Medium - Within 2 weeks</SelectItem>
            <SelectItem value="high">High - Within a week</SelectItem>
            <SelectItem value="urgent">Urgent - ASAP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visibility Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Listing Visibility (Optional)
        </Label>
        <Select value={visibilityDays} onValueChange={onVisibilityChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days (default)</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
