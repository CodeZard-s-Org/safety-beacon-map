
import React from 'react';
import { MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold">Safety Beacon</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="map" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Report
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
