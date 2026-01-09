"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IoTDeviceCard } from './iot-device-card';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { IoTDevice } from '@/lib/types/iot';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface IoTReading {
    id: number;
    value: number;
    recorded_at: string;
}

export function IoTDashboard() {
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
    const [readings, setReadings] = useState<IoTReading[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        if (selectedDevice) {
            fetchReadings(selectedDevice.id);
        }
    }, [selectedDevice]);

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/iot-devices');
            if (!res.ok) throw new Error('Failed to fetch devices');
            const data = await res.json();

            // Map API response to IoTDevice type
            const mappedDevices: IoTDevice[] = data.map((d: any) => ({
                id: String(d.id),
                name: d.name,
                type: d.type, // API returns "type"
                status: d.status,
                lastReading: d.lastReading,
                iconName: getIconNameForType(d.type),
            }));

            setDevices(mappedDevices);
            if (mappedDevices.length > 0 && !selectedDevice) {
                setSelectedDevice(mappedDevices[0]);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load devices',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getIconNameForType = (type: string): string => {
        switch (type) {
            case 'Soil Sensor': return 'Sprout';
            case 'Weather Station': return 'CloudRain';
            case 'Smart Irrigator': return 'Droplets';
            case 'Drone': return 'LocateFixed';
            default: return 'Router';
        }
    };

    const fetchReadings = async (deviceId: string) => {
        try {
            const res = await fetch(`/api/iot-devices/${deviceId}/readings`);
            if (!res.ok) throw new Error('Failed to fetch readings');
            const data = await res.json();
            // Reverse to show oldest to newest on chart
            setReadings(data.reverse());
        } catch (error) {
            console.error('Failed to load readings:', error);
        }
    };

    const handleSimulateReading = async () => {
        if (!selectedDevice) return;

        try {
            const readingType = selectedDevice.type === 'soil_moisture' ? 'moisture' : 'temperature';
            const baseValue = readingType === 'moisture' ? 60 : 25;
            const randomValue = baseValue + (Math.random() * 10 - 5);

            const res = await fetch(`/api/iot-devices/${selectedDevice.id}/readings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: readingType,
                    value: parseFloat(randomValue.toFixed(1)),
                    unit: readingType === 'moisture' ? '%' : '°C',
                }),
            });

            if (!res.ok) throw new Error('Failed to simulate reading');

            toast({
                title: 'Reading Recorded',
                description: `New ${readingType} reading simulated.`,
            });

            fetchDevices(); // Update device status/last reading
            fetchReadings(selectedDevice.id); // Update chart
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to simulate reading',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">IoT Devices</h2>
                <Button onClick={handleSimulateReading} disabled={!selectedDevice}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Simulate Reading
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => (
                    <div
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className={`cursor-pointer transition-all ${selectedDevice?.id === device.id ? 'ring-2 ring-primary rounded-lg' : ''}`}
                    >
                        <IoTDeviceCard device={device} />
                    </div>
                ))}

                <Card className="flex items-center justify-center min-h-[200px] border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="text-center text-muted-foreground">
                        <Plus className="h-8 w-8 mx-auto mb-2" />
                        <p>Add New Device</p>
                    </div>
                </Card>
            </div>

            {selectedDevice && readings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historical Data: {selectedDevice.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={readings}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="recorded_at"
                                        tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(label) => new Date(label).toLocaleString()}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
