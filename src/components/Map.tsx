
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Feature, FeatureCollection, Point } from 'geojson';
import { Incident, SEVERITY_COLORS, CATEGORY_LABELS } from '../types';
import { generateHeatmapData } from '../lib/mapData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Store, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
        console.log('Map initialized in reporting mode, click to select location');
        
        map.current.on('click', (e) => {
          console.log('Map clicked at:', e.lngLat);
          const { lng, lat } = e.lngLat;
          setSelectedLocation({ lat, lng });
          
          // Remove existing marker if any
          if (markerRef.current) {
            markerRef.current.remove();
          }
          
          // Create new marker element
          const el = document.createElement('div');
          el.className = 'marker-pin';
          el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`;
          
          // Create new marker at clicked location
          const marker = new mapboxgl.Marker({
            element: el,
            draggable: true
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          // Add popup for selected location
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          })
            .setHTML(`
              <div class="p-2">
                <h4 class="font-semibold mb-1">Selected Location</h4>
                <p class="text-sm">Latitude: ${lat.toFixed(4)}</p>
                <p class="text-sm">Longitude: ${lng.toFixed(4)}</p>
                <p class="text-sm text-muted-foreground mt-1">Drag pin to adjust location</p>
              </div>
            `);
          
          marker.setPopup(popup);
          popup.addTo(map.current!);
          
          // Update location when marker is dragged
          marker.on('dragend', () => {
            const position = marker.getLngLat();
            setSelectedLocation({ lat: position.lat, lng: position.lng });
            
            if (onLocationSelect) {
              onLocationSelect(position.lat, position.lng);
              toast.success("Location updated", {
                description: `Selected position: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
              });
            }
            
            // Update popup content
            popup.setHTML(`
              <div class="p-2">
                <h4 class="font-semibold mb-1">Selected Location</h4>
                <p class="text-sm">Latitude: ${position.lat.toFixed(4)}</p>
                <p class="text-sm">Longitude: ${position.lng.toFixed(4)}</p>
                <p class="text-sm text-muted-foreground mt-1">Drag pin to adjust location</p>
              </div>
            `);
          });
            
          markerRef.current = marker;
          
          // Call the callback function with the selected location
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
            toast.success("Location selected", {
              description: `Selected position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
            });
          }
        });
      }

      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Error initializing map", {
        description: "Please check your Mapbox token and try again"
      });
    }
  }, [mapToken, isReporting, onLocationSelect]);

  // Add incidents to map when they change
  useEffect(() => {
    if (!map.current || !mapToken || incidents.length === 0) return;

    const handleMapLoad = () => {
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

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Add individual markers for each incident
      incidents.forEach(incident => {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'incident-marker';
        el.style.backgroundColor = SEVERITY_COLORS[incident.severity].replace('bg-', '');
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
        
        // Get location description or coordinates
        const locationDesc = incident.location_description || 
          `Coordinates: ${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`;
        
        // Format the date for display
        const incidentDate = new Date(incident.timestamp);
        const formattedDate = incidentDate.toLocaleDateString();
        const formattedTime = incidentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Create formatted content for the popup with improved location display
        const popupContent = `
          <div class="incident-popup p-3">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-3 h-3 rounded-full ${SEVERITY_COLORS[incident.severity]}"></span>
              <h4 class="font-semibold">${CATEGORY_LABELS[incident.category]}</h4>
            </div>
            <p class="text-sm mb-2">${incident.description}</p>
            <div class="text-xs text-muted-foreground">
              <div class="flex items-center gap-1 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3z"></path>
                  <path d="M3 9h18"></path>
                  <path d="M15 3v18"></path>
                </svg>
                <strong>Location:</strong> ${locationDesc}
              </div>
              <div class="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <strong>Time:</strong> ${formattedDate}, ${formattedTime}
              </div>
            </div>
          </div>
        `;
        
        // Add marker with popup
        const marker = new mapboxgl.Marker(el)
          .setLngLat([incident.longitude, incident.latitude])
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 15, 
              closeButton: true, 
              closeOnClick: false,
              className: 'incident-popup-container'
            })
              .setHTML(popupContent)
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    };
    
    // If map is already loaded, trigger the load event handler manually
    if (map.current && map.current.loaded()) {
      handleMapLoad();
    } else if (map.current) {
      map.current.once('load', handleMapLoad);
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
      toast.success("Mapbox token saved", {
        description: "Your token has been saved and will be used for future sessions"
      });
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
        <div className="relative w-full h-full min-h-[400px]">
          <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-lg shadow-sm border" />
          {isReporting && (
            <div className="absolute bottom-2 right-2 bg-background/90 p-2 rounded shadow-sm text-xs">
              {selectedLocation ? (
                <p>Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
              ) : (
                <p>Click on the map to select a location</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Map;
