"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DeviceRegistrationProps {
  farmerId: string;
  onDeviceAdded?: () => void;
}

const DEVICE_TYPES = [
  { value: 'soil_moisture', label: 'Soil Moisture Sensor' },
  { value: 'temperature', label: 'Temperature Sensor' },
  { value: 'humidity', label: 'Humidity Sensor' },
  { value: 'ph_sensor', label: 'pH Sensor' },
  { value: 'weather_station', label: 'Weather Station' },
  { value: 'irrigation_controller', label: 'Irrigation Controller' },
];

export function DeviceRegistration({ farmerId, onDeviceAdded }: DeviceRegistrationProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('iot');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    serialNumber: '',
    model: '',
    installationDate: '',
    showAdvanced: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          farmerId,
          location: formData.location ? { address: formData.location } : null,
          metadata: {
            serialNumber: formData.serialNumber,
            model: formData.model,
            installationDate: formData.installationDate,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register device');
      }

      toast({
        title: t('device_registered') || 'Device Registered',
        description: t('device_registered_desc') || 'Your IoT device has been successfully registered.',
      });

      setFormData({
        name: '', type: '', location: '',
        serialNumber: '', model: '', installationDate: '',
        showAdvanced: false
      });
      setOpen(false);
      onDeviceAdded?.();
    } catch (error: any) {
      toast({
        title: t('registration_failed') || 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('register_device') || 'Register Device'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('register_new_device') || 'Register New IoT Device'}</DialogTitle>
          <DialogDescription>
            {t('register_device_desc') || 'Add a new IoT sensor or device to monitor your farm.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">{t('device_name') || 'Device Name'}</Label>
              <Input
                id="name"
                placeholder={t('device_name_placeholder') || 'e.g., Field 1 Soil Sensor'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">{t('device_type') || 'Device Type'}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_type') || 'Select device type'} />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">{t('location') || 'Location (Optional)'}</Label>
              <Input
                id="location"
                placeholder={t('location_placeholder') || 'e.g., North Field, Section A'}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground"
                onClick={() => setFormData(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
              >
                <span>{t('advanced_settings') || 'Advanced Settings'}</span>
                <span>{formData.showAdvanced ? '−' : '+'}</span>
              </Button>

              {formData.showAdvanced && (
                <div className="space-y-4 pt-4 border-t mt-2 animate-in slide-in-from-top-2">
                  <div>
                    <Label htmlFor="serialNumber">{t('serial_number') || 'Serial Number'}</Label>
                    <Input
                      id="serialNumber"
                      placeholder="SN-12345678"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">{t('model') || 'Device Model'}</Label>
                    <Input
                      id="model"
                      placeholder="e.g., MST-2000"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="installationDate">{t('installation_date') || 'Installation Date'}</Label>
                    <Input
                      id="installationDate"
                      type="date"
                      value={formData.installationDate}
                      onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('registering') || 'Registering...'}
                </>
              ) : (
                t('register') || 'Register'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
