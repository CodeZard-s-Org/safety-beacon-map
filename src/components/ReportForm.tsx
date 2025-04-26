
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ReportFormValues, 
  IncidentCategory, 
  IncidentSeverity,
  CATEGORY_LABELS,
  SEVERITY_LABELS
} from '../types';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Shield, MapPin } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (data: ReportFormValues) => void;
  selectedLocation: {lat: number, lng: number} | null;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, selectedLocation }) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ReportFormValues>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormSubmit = async (data: ReportFormValues) => {
    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Add location data
    const formData = {
      ...data,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng
    };
    
    try {
      await onSubmit(formData);
      
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. It has been submitted anonymously.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error Submitting Report",
        description: "There was an issue submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      <div className="flex items-center mb-6 space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-medium">Report an Incident</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        All reports are anonymous. Help keep our community safe by reporting incidents of harassment.
      </p>
      
      {!selectedLocation && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Select a location</p>
            <p className="text-xs text-amber-700">Click on the map to mark the location where the incident occurred.</p>
          </div>
        </div>
      )}
      
      {selectedLocation && (
        <div className="bg-safety-50 border border-safety-200 rounded-md p-3 mb-4 flex items-start space-x-2">
          <MapPin className="h-5 w-5 text-safety-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-safety-800">Location selected</p>
            <p className="text-xs text-safety-700">
              Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Incident Type</Label>
          <Select 
            onValueChange={(value) => setValue('category', value as IncidentCategory)} 
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="severity">Severity</Label>
          <Select 
            onValueChange={(value) => setValue('severity', value as IncidentSeverity)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select severity level" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.severity && <p className="text-red-500 text-xs">{errors.severity.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Please describe what happened..."
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location_description">Location Details (Optional)</Label>
          <Input
            {...register('location_description')}
            placeholder="E.g., near the corner of Main St. and 5th Ave."
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report Anonymously'}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        In case of emergency, please contact local authorities directly.
      </p>
    </Card>
  );
};

export default ReportForm;
