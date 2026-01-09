
"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { StorageFacility } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Warehouse, Phone, MessageSquare, DollarSign, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BookingDialog } from './booking-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface StorageFacilityCardProps {
  facility: StorageFacility;
}

const iconMap: { [key: string]: React.ElementType } = {
  Warehouse: Warehouse,
  // Add other icon mappings here if StorageFacility can have other iconNames
};

export function StorageFacilityCard({ facility }: StorageFacilityCardProps) {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { t } = useLanguage();

  const IconComponent = facility.iconName ? iconMap[facility.iconName] || Warehouse : Warehouse;

  const handleBookNow = () => {
    setBookingDialogOpen(true);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative w-full">
          <Image
            src={facility.imageUrl || '/placeholder-storage.jpg'}
            alt={facility.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint="storage warehouse agriculture"
          />
          <Badge
            variant={facility.availability === 'Available' ? 'default' : facility.availability === 'Limited Space' ? 'secondary' : 'destructive'}
            className="absolute top-2 right-2"
          >
            {facility.availability}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1 flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-primary" />
          {facility.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2">{facility.storageType}</CardDescription>

        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          <span>{facility.location}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Star className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" />
          <span>{(facility.rating || 0).toFixed(1)}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{t('storage.capacity')}: <span className="font-semibold text-foreground">{facility.capacity}</span></p>

        {Array.isArray(facility.features) && facility.features.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('storage.key_features')}:</p>
            <div className="flex flex-wrap gap-1">
              {facility.features.slice(0, 3).map((feature, idx) => ( // Show a few key features
                <Badge key={`${feature}-${idx}`} variant="outline" className="text-xs py-0.5 px-1.5">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {feature}
                </Badge>
              ))}
              {facility.features.length > 3 && <Badge variant="outline" className="text-xs py-0.5 px-1.5">...</Badge>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-md font-semibold text-primary">
          {(facility.pricePerUnitPerMonth || 0).toFixed(2)} {t('common.birr')}
          <span className="text-xs text-muted-foreground"> {t('storage.per_unit_month')}</span>
        </p>
        <Button
          size="sm"
          onClick={handleBookNow}
          className="w-full sm:w-auto"
          disabled={!facility.pricePerUnitPerMonth || facility.pricePerUnitPerMonth <= 0}
        >
          {t('storage.book_now')}
        </Button>
      </CardFooter>

      <BookingDialog
        facility={facility}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
      />
    </Card>
  );
}
