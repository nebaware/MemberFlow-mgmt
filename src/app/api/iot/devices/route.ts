import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId') || user.id;

    if (farmerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const devices = await prisma.ioTDevice.findMany({
      where: { farmerId: farmerId },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { lastSeen: 'desc' },
    });

    // Simulate new data for online devices if last reading is old (> 30s)
    // This creates a "real-time" effect for the demo
    const now = new Date();
    const updatedDevices = await Promise.all(devices.map(async (device: any) => {
      const lastReading = device.readings[0];
      const secondsSinceLast = lastReading ? (now.getTime() - new Date(lastReading.timestamp).getTime()) / 1000 : 999;

      let currentReading = lastReading;

      if (device.status === 'online' && secondsSinceLast > 30) {
        // Generate mock data based on type
        const mockData = generateMockData(device.type);
        if (mockData) {
          const newReading = await prisma.ioTReading.create({
            data: {
              deviceId: device.id,
              data: JSON.stringify(mockData),
              unit: 'mixed'
            }
          });
          currentReading = newReading;

          // Update lastSeen
          await prisma.ioTDevice.update({
            where: { id: device.id },
            data: { lastSeen: new Date() }
          });
        }
      }

      return {
        ...device,
        location: device.location ? JSON.parse(device.location) : undefined,
        metadata: device.metadata ? JSON.parse(device.metadata) : undefined,
        lastReading: currentReading ? {
          ...currentReading,
          data: typeof currentReading.data === 'string' ? JSON.parse(currentReading.data) : currentReading.data
        } : undefined
      };
    }));

    return NextResponse.json({ devices: updatedDevices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockData(type: string) {
  switch (type) {
    case 'soil_moisture':
      return { moisture: Math.floor(Math.random() * 40) + 30, temperature: Math.floor(Math.random() * 10) + 20 };
    case 'temperature':
      return { temperature: Math.floor(Math.random() * 15) + 15, humidity: Math.floor(Math.random() * 60) + 30 };
    case 'humidity':
      return { humidity: Math.floor(Math.random() * 50) + 40 };
    case 'ph_sensor':
      return { ph: Number((Math.random() * 4 + 5).toFixed(1)), temperature: 22 };
    case 'weather_station':
      return { temperature: 24, humidity: 65, windSpeed: Math.floor(Math.random() * 20), rainfall: 0 };
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, location, metadata } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let iconName = 'Router';
    switch (type) {
      case 'soil_moisture': iconName = 'Sprout'; break;
      case 'temperature': iconName = 'Thermometer'; break;
      case 'humidity': iconName = 'Droplets'; break;
      case 'ph_sensor': iconName = 'Gauge'; break;
      case 'weather_station': iconName = 'CloudSun'; break;
      case 'irrigation_controller': iconName = 'Droplets'; break;
      default: iconName = 'Router';
    }

    const newDevice = await prisma.ioTDevice.create({
      data: {
        name,
        type,
        farmerId: user.id,
        status: 'online',
        location: location ? JSON.stringify(location) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        iconName,
        batteryLevel: 100,
        lastSeen: new Date(),
      },
    });

    // Return format matching frontend expectation (parsed location)
    const responseDevice = {
      ...newDevice,
      location: newDevice.location ? JSON.parse(newDevice.location) : undefined
    };

    return NextResponse.json(responseDevice);
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
