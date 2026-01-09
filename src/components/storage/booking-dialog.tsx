"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Wallet, Building2, DollarSign } from 'lucide-react';
import type { StorageFacility } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingDialogProps {
  facility: StorageFacility;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ facility, open, onOpenChange }: BookingDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const PAYMENT_METHODS = [
    { id: 'telebirr', name: t('payment.telebirr'), icon: Wallet, description: t('payment.telebirr_desc') },
    { id: 'cbe_birr', name: t('payment.cbe_birr'), icon: Building2, description: t('payment.cbe_desc') },
    { id: 'bank_transfer', name: t('payment.bank_transfer'), icon: Building2, description: t('payment.bank_desc') },
    { id: 'cash', name: t('payment.cash'), icon: DollarSign, description: t('payment.cash_desc') },
  ];
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [duration, setDuration] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Calculate total cost with proper validation
  const pricePerUnit = facility?.pricePerUnitPerMonth || 0;
  const quantityNum = parseFloat(quantity) || 1;
  const durationNum = parseFloat(duration) || 1;
  const totalCost = pricePerUnit * quantityNum * durationNum;



  const handleBooking = async () => {
    setIsProcessing(true);

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const userId = '1'; // Demo user ID - replace with actual auth

      // Validate inputs
      const quantityValue = parseFloat(quantity);
      const durationValue = parseFloat(duration);

      if (!quantity || isNaN(quantityValue) || quantityValue <= 0) {
        toast({
          title: "Invalid Quantity",
          description: "Please enter a valid quantity (must be greater than 0)",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!duration || isNaN(durationValue) || durationValue <= 0) {
        toast({
          title: "Invalid Duration",
          description: "Please enter a valid duration (must be greater than 0)",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!pricePerUnit || pricePerUnit <= 0) {
        toast({
          title: "Invalid Facility",
          description: "This facility does not have a valid price configured",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (totalCost <= 0) {
        toast({
          title: "Invalid Total",
          description: "The total cost must be greater than 0",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // For cash payments, skip payment gateway and create booking directly
      if (paymentMethod === 'cash') {
        const bookingResponse = await fetch('/api/storage/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            facilityId: facility.id,
            quantity: parseFloat(quantity),
            durationMonths: parseFloat(duration),
            totalCost,
            paymentMethod: 'cash',
            status: 'pending' // Cash payments are pending until confirmed
          })
        });

        const bookingData = await bookingResponse.json();

        if (!bookingResponse.ok) {
          throw new Error(bookingData.error || 'Booking failed');
        }

        toast({
          title: "Booking Confirmed!",
          description: `Your storage space at ${facility.name} has been reserved. Total: ${totalCost.toFixed(2)} Birr. Please pay in cash at the facility.`,
        });

        onOpenChange(false);
        setQuantity('1');
        setDuration('1');
        setStep('details');
        return;
      }

      // For online payments, process through payment gateway
      const paymentPayload = {
        userId,
        amount: totalCost,
        paymentMethod,
        transactionType: 'storage',
        referenceId: facility.id.toString(),
        description: `Storage booking at ${facility.name} - ${quantity} units for ${duration} months`,
        customerPhone: '', // Add if available
        customerEmail: '' // Add if available
      };

      console.log('Payment payload:', paymentPayload);

      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      const paymentData = await paymentResponse.json();
      console.log('Payment response:', paymentData);

      if (!paymentResponse.ok || !paymentData.success) {
        // If database not configured, fall back to direct booking
        if (paymentData.error?.includes('DATABASE not configured')) {
          const bookingResponse = await fetch('/api/storage/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              facilityId: facility.id,
              quantity: parseFloat(quantity),
              durationMonths: parseFloat(duration),
              totalCost,
              paymentMethod,
              status: 'confirmed'
            })
          });

          const bookingData = await bookingResponse.json();

          if (!bookingResponse.ok) {
            throw new Error(bookingData.error || 'Booking failed');
          }

          toast({
            title: "Booking Confirmed!",
            description: `Your storage space at ${facility.name} has been reserved. Total: ${totalCost.toFixed(2)} Birr.`,
          });

          onOpenChange(false);
          setQuantity('1');
          setDuration('1');
          setStep('details');
          return;
        }

        throw new Error(paymentData.error || 'Payment initiation failed');
      }

      // If payment gateway returns a URL, redirect to it
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }

      // For cash payments or if no redirect needed, create booking directly
      const bookingResponse = await fetch('/api/storage/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          facilityId: facility.id,
          quantity: parseFloat(quantity),
          durationMonths: parseFloat(duration),
          totalCost,
          paymentMethod,
        })
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok || !bookingData.success) {
        throw new Error(bookingData.error || 'Booking failed');
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your storage space at ${facility.name} has been reserved. Total: ${totalCost.toFixed(2)} Birr. Booking ID: ${bookingData.booking.id}`,
      });

      onOpenChange(false);

      // Reset form
      setQuantity('1');
      setDuration('1');
      setPaymentMethod('telebirr');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('booking.title')}</DialogTitle>
          <DialogDescription>
            {t('booking.description')} {facility.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Facility Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="font-semibold">{facility.name}</p>
            <p className="text-sm text-muted-foreground">{facility.location}</p>
            <p className="text-sm text-muted-foreground">{facility.storageType}</p>
            <p className="text-sm font-medium mt-1">
              {(facility.pricePerUnitPerMonth || 0).toFixed(2)} Birr/unit/month
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'details' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                1
              </div>
              <span className="text-sm font-medium">{t('booking.step_details')}</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                2
              </div>
              <span className="text-sm font-medium">{t('booking.step_payment')}</span>
            </div>
          </div>

          {step === 'details' && (
            <>
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('booking.units_needed')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={t('booking.enter_quantity')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('booking.available_capacity')}: {facility.capacity}
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">{t('booking.duration')}</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder={t('booking.select_duration')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t('booking.1_month')}</SelectItem>
                    <SelectItem value="3">{t('booking.3_months')}</SelectItem>
                    <SelectItem value="6">{t('booking.6_months')}</SelectItem>
                    <SelectItem value="12">{t('booking.12_months')}</SelectItem>
                    <SelectItem value="24">{t('booking.24_months')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Cost Preview */}
              <div className="rounded-lg border p-3 bg-primary/5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('booking.total_cost')}:</span>
                  <span className="text-xl font-bold text-primary">
                    {totalCost.toFixed(2)} {t('common.birr')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} unit(s) × {duration} month(s) × {(facility.pricePerUnitPerMonth || 0).toFixed(2)} {t('common.birr')}
                </p>
              </div>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Payment Method */}
              <div className="space-y-3">
                <Label>{t('booking.payment_method')}</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id} className="flex items-center space-x-3 rounded-lg border p-2.5 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1">
                          <Icon className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Total Cost */}
              <div className="rounded-lg border p-4 bg-primary/5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('booking.total_cost')}:</span>
                  <span className="text-2xl font-bold text-primary">
                    {totalCost.toFixed(2)} {t('common.birr')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} unit(s) × {duration} month(s) × {(facility.pricePerUnitPerMonth || 0).toFixed(2)} {t('common.birr')}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'details' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('booking.cancel')}
              </Button>
              <Button
                onClick={() => {
                  const quantityValue = parseFloat(quantity);
                  const durationValue = parseFloat(duration);

                  if (!quantity || isNaN(quantityValue) || quantityValue <= 0) {
                    toast({
                      title: "Invalid Quantity",
                      description: "Please enter a valid quantity (must be greater than 0)",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (!duration || isNaN(durationValue) || durationValue <= 0) {
                    toast({
                      title: "Invalid Duration",
                      description: "Please select a valid duration",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (totalCost <= 0) {
                    toast({
                      title: "Invalid Total",
                      description: "The total cost must be greater than 0",
                      variant: "destructive",
                    });
                    return;
                  }

                  setStep('payment');
                }}
                disabled={!quantity || parseFloat(quantity) <= 0 || totalCost <= 0}
              >
                {t('booking.continue')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('details')}>
                {t('booking.back')}
              </Button>
              <Button onClick={handleBooking} disabled={isProcessing}>
                {isProcessing ? t('booking.processing') : t('booking.confirm')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
