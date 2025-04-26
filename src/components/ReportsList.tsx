
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Incident, SEVERITY_LABELS, CATEGORY_LABELS } from '../types';

interface ReportsListProps {
  incidents: Incident[];
}

const ReportsList: React.FC<ReportsListProps> = ({ incidents }) => {
  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-alert-low text-gray-900';
      case 'medium':
        return 'bg-alert-medium text-gray-900';
      case 'high':
        return 'bg-alert-high text-white';
      case 'critical':
        return 'bg-alert-critical text-white';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className="p-6 pb-3">
        <h2 className="text-xl font-medium">Recent Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Viewing {incidents.length} anonymous reports
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIncidents.length > 0 ? (
              sortedIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    {new Date(incident.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {CATEGORY_LABELS[incident.category]}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSeverityColor(incident.severity)}`}>
                      {SEVERITY_LABELS[incident.severity]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {incident.location_description || 'Unknown'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate hidden lg:table-cell">
                    {incident.description}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No incidents reported yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ReportsList;
