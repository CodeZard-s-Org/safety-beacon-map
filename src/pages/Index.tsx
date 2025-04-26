
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Map from '@/components/Map';
import Navbar from '@/components/Navbar';
import ReportForm from '@/components/ReportForm';
import ReportsList from '@/components/ReportsList';
import { Incident, ReportFormValues } from '../types';
import { sampleIncidents } from '../lib/mapData';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [incidents, setIncidents] = useState<Incident[]>(sampleIncidents);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleReportSubmit = async (data: ReportFormValues) => {
    // In a real app, this would be sent to a server
    const newIncident: Incident = {
      id: uuidv4(),
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString(),
      category: data.category,
      severity: data.severity,
      description: data.description,
      location_description: data.location_description
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIncidents(prev => [...prev, newIncident]);
    setSelectedLocation(null);
    
    // Switch to map view after submission
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className={`lg:col-span-2 ${activeTab === 'map' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-background rounded-lg h-[70vh] shadow-sm">
              <Map 
                incidents={incidents} 
                onLocationSelect={activeTab === 'report' ? handleLocationSelect : undefined}
                isReporting={activeTab === 'report'}
              />
            </div>
            
            <div className="mt-6">
              <ReportsList incidents={incidents} />
            </div>
          </div>
          
          {/* Report form sidebar */}
          <div className={`${activeTab === 'report' ? 'block' : 'hidden lg:block'}`}>
            <ReportForm 
              onSubmit={handleReportSubmit} 
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-6 bg-safety-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            Safety Beacon - Anonymous Harassment Reporting System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            In case of emergency, please contact local authorities directly.
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
