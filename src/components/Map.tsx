import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Feature, FeatureCollection, Point } from 'geojson';
import { Incident, SEVERITY_COLORS, CATEGORY_LABELS } from '../types';
import { generateHeatmapData } from '../lib/mapData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapIcon } from 'lucide-react';

interface MapProps {
  incidents: Incident[];
  onLocationSelect?: (lat: number, lng: number) => void;
  isReporting?: boolean;
}

// Initialize with an empty token - user will need to provide this
const MAPBOX_TOKEN = '';

const Map: React.FC<MapProps> = ({ incidents, onLocationSelect, isReporting = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>(MAPBOX_TOKEN);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(MAPBOX_TOKEN === '');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;

    mapboxgl.accessToken = mapToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.0060, 40.7128], // Default to NYC
        zoom: 13
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // If reporting mode is enabled, add click handling for location selection
      if (isReporting) {
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          setSelectedLocation({ lat, lng });
          
          if (markerRef.current) {
            markerRef.current.remove();
          }
          
          const marker = new mapboxgl.Marker({ color: '#007FB6' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
            
          markerRef.current = marker;
          
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [mapToken, isReporting, onLocationSelect]);

  // Add incidents to map when they change
  useEffect(() => {
    if (!map.current || !mapToken || incidents.length === 0) return;

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add heatmap layer
      const heatmapData: FeatureCollection<Point> = generateHeatmapData(incidents);
      
      if (map.current.getSource('incidents')) {
        (map.current.getSource('incidents') as mapboxgl.GeoJSONSource).setData(heatmapData);
      } else {
        map.current.addSource('incidents', {
          type: 'geojson',
          data: heatmapData
        });
        
        map.current.addLayer({
          id: 'incidents-heat',
          type: 'heatmap',
          source: 'incidents',
          paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33, 102, 172, 0)',
              0.2, 'rgba(103, 169, 207, 0.5)',
              0.4, 'rgba(209, 229, 240, 0.6)',
              0.6, 'rgba(253, 219, 199, 0.7)',
              0.8, 'rgba(239, 138, 98, 0.8)',
              1, 'rgba(178, 24, 43, 0.9)'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.8
          }
        });
      }

      // Add individual markers for each incident
      incidents.forEach(incident => {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = `incident-pulse ${SEVERITY_COLORS[incident.severity]}`;
        
        // Add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([incident.longitude, incident.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h4 class="font-bold">${CATEGORY_LABELS[incident.category]}</h4>
                <p class="text-sm">${incident.description}</p>
                <p class="text-xs mt-1">${new Date(incident.timestamp).toLocaleString()}</p>
                <p class="text-xs italic">${incident.location_description || ''}</p>
              </div>
            `))
          .addTo(map.current!);
      });
    });
    
    // If map is already loaded, trigger the load event handler manually
    if (map.current && map.current.loaded()) {
      map.current.fire('load');
    }
  }, [incidents, mapToken]);

  // Handle token submission
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const token = formData.get('mapboxToken') as string;
    
    if (token) {
      setMapToken(token);
      setShowTokenInput(false);
      localStorage.setItem('mapbox_token', token); // Save for future sessions
    }
  };

  // Check for token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  return (
    <>
      {showTokenInput ? (
        <Card className="p-6 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">Enter Mapbox API Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To view the map, please provide your Mapbox public token.
            You can get a free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>.
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="mapboxToken"
                placeholder="pk.eyJ1IjoieW91..."
                className="w-full p-2 border rounded-md"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is stored locally on your device only.
              </p>
            </div>
            <Button type="submit" className="w-full">
              <MapIcon className="mr-2 h-4 w-4" />
              Load Map
            </Button>
          </form>
        </Card>
      ) : (
        <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-lg shadow-sm border" />
      )}
    </>
  );
};

export default Map;
