/**
 * IoT Device Types for Azmera Platform
 */

export type DeviceType = 'soil_moisture' | 'temperature' | 'humidity' | 'ph_sensor' | 'weather_station' | 'irrigation_controller';
export type DeviceStatus = 'online' | 'offline' | 'error';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  farmerId: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  lastSeen: Date;
  batteryLevel?: number;
  metadata?: Record<string, any>;
  iconName: string;
  createdAt: Date;
  updatedAt: Date;
  lastReading?: DeviceReading;
}

export interface DeviceReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  data: Record<string, number | string>;
  unit?: string;
}

export interface SoilMoistureReading extends DeviceReading {
  data: {
    moisture: number; // percentage
    temperature: number; // celsius
  };
}

export interface TemperatureReading extends DeviceReading {
  data: {
    temperature: number; // celsius
    humidity?: number; // percentage
  };
}

export interface PHReading extends DeviceReading {
  data: {
    ph: number; // 0-14 scale
    temperature: number; // celsius
  };
}

export interface WeatherStationReading extends DeviceReading {
  data: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    rainfall: number;
  };
}
