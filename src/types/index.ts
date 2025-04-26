
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentCategory = 
  | 'verbal_harassment'
  | 'physical_harassment'
  | 'discrimination'
  | 'stalking'
  | 'bullying'
  | 'online_harassment'
  | 'other';

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  location_description?: string;
}

export interface ReportFormValues {
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  location_description?: string;
  latitude: number;
  longitude: number;
}

export interface MapFilters {
  categories: IncidentCategory[];
  severities: IncidentSeverity[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  verbal_harassment: 'Verbal Harassment',
  physical_harassment: 'Physical Harassment',
  discrimination: 'Discrimination',
  stalking: 'Stalking',
  bullying: 'Bullying',
  online_harassment: 'Online Harassment',
  other: 'Other'
};

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: 'bg-alert-low',
  medium: 'bg-alert-medium',
  high: 'bg-alert-high',
  critical: 'bg-alert-critical'
};

export const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};
