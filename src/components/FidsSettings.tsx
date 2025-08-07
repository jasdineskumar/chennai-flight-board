import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, X, Monitor, Database, Clock, Palette } from "lucide-react";

interface FidsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    useMockData: boolean;
    refreshInterval: number;
    showSystemTime: boolean;
    kioskMode: boolean;
    autoFullscreen: boolean;
    flightsPerPage: number;
    pageInterval: number;
  };
  onSettingsChange: (newSettings: any) => void;
}

const FidsSettings = ({ isOpen, onClose, settings, onSettingsChange }: FidsSettingsProps) => {
  if (!isOpen) return null;

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-fids-card border-fids-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-fids-border">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-fids-accent" />
            <CardTitle className="text-fids-text">FIDS Display Settings</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-fids-text-secondary hover:text-fids-text"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Data Source */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-fids-accent" />
              <Label className="text-fids-text font-medium">Data Source</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                checked={settings.useMockData}
                onCheckedChange={(checked) => updateSetting('useMockData', checked)}
              />
              <Label className="text-fids-text-secondary">
                {settings.useMockData ? 'Mock Data (Testing)' : 'Live Supabase Data'}
              </Label>
            </div>
            <p className="text-sm text-fids-text-secondary ml-7">
              Use mock data for testing when Supabase has no current flight data
            </p>
          </div>

          {/* Refresh Interval */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-fids-accent" />
              <Label className="text-fids-text font-medium">Refresh Interval</Label>
            </div>
            <Select
              value={settings.refreshInterval.toString()}
              onValueChange={(value) => updateSetting('refreshInterval', parseInt(value))}
            >
              <SelectTrigger className="bg-fids-dark border-fids-border text-fids-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-fids-card border-fids-border">
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds (Default)</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pagination Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-fids-accent" />
              <Label className="text-fids-text font-medium">Display Pagination</Label>
            </div>
            
            <div className="space-y-3 ml-7">
              <div className="space-y-2">
                <Label className="text-fids-text-secondary">Flights per Page: {settings.flightsPerPage}</Label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="1"
                  value={settings.flightsPerPage}
                  onChange={(e) => updateSetting('flightsPerPage', parseInt(e.target.value))}
                  className="w-full h-2 bg-fids-dark rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-fids-text-secondary">Page Change Interval: {settings.pageInterval}s</Label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.pageInterval}
                  onChange={(e) => updateSetting('pageInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-fids-dark rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-fids-accent" />
              <Label className="text-fids-text font-medium">Display Options</Label>
            </div>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.showSystemTime}
                  onCheckedChange={(checked) => updateSetting('showSystemTime', checked)}
                />
                <Label className="text-fids-text-secondary">Show System Time</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.kioskMode}
                  onCheckedChange={(checked) => updateSetting('kioskMode', checked)}
                />
                <Label className="text-fids-text-secondary">Kiosk Mode (Hide cursor after inactivity)</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.autoFullscreen}
                  onCheckedChange={(checked) => updateSetting('autoFullscreen', checked)}
                />
                <Label className="text-fids-text-secondary">Auto Fullscreen on Load</Label>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-3">
            <Label className="text-fids-text font-medium">Keyboard Shortcuts</Label>
            <div className="bg-fids-dark p-4 rounded-lg border border-fids-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">F11</span>
                <span className="text-fids-text">Toggle Fullscreen</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">S</span>
                <span className="text-fids-text">Open Settings</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">R</span>
                <span className="text-fids-text">Refresh Data</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">Esc</span>
                <span className="text-fids-text">Close Settings</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">D</span>
                <span className="text-fids-text">Show Domestic Flights</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fids-text-secondary">I</span>
                <span className="text-fids-text">Show International Flights</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-fids-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-fids-border text-fids-text hover:bg-fids-card-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-fids-accent hover:bg-fids-accent/90 text-white"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FidsSettings;