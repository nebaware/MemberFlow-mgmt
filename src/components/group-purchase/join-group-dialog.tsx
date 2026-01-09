'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  DollarSign, 
  Clock,
  MapPin,
  Calculator,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JoinGroupDialogProps {
  groupPurchaseId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GroupPurchaseDetails {
  id: number;
  title: string;
  description: string;
  product_name: string;
  organizer_name: string;
  unit_price: number;
  group_discount_percentage: number;
  min_quantity_per_buyer: number;
  max_quantity_per_buyer?: number;
  remaining_quantity: number;
  remaining_slots: number;
  deadline: string;
  delivery_location?: string;
  status: any;
}

export function JoinGroupDialog({ groupPurchaseId, isOpen, onClose, onSuccess }: JoinGroupDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupDetails, setGroupDetails] = useState<GroupPurchaseDetails | null>(null);
  
  // Form state
  const [quantity, setQuantity] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated values
  const [totalAmount, setTotalAmount] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (isOpen && groupPurchaseId) {
      fetchGroupDetails();
    }
  }, [isOpen, groupPurchaseId]);

  useEffect(() => {
    calculateAmount();
  }, [quantity, groupDetails]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/group-purchases/${groupPurchaseId}`);
      const result = await response.json();

      if (response.ok) {
        setGroupDetails(result.groupPurchase);
        // Set default quantity to minimum
        setQuantity(result.groupPurchase.min_quantity_per_buyer.toString());
        setDeliveryPreference(result.groupPurchase.delivery_location || '');
      } else {
        throw new Error(result.error || 'Failed to fetch group details');
      }
    } catch (error: any) {
      console.error('Fetch group details error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch group details',
        variant: 'destructive'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!groupDetails || !quantity) {
      setTotalAmount(0);
      setSavings(0);
      return;
    }

    const qty = parseFloat(quantity);
    const originalPrice = groupDetails.unit_price;
    const discountPercentage = groupDetails.group_discount_percentage || 0;
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    
    setTotalAmount(qty * discountedPrice);
    setSavings(qty * (originalPrice - discountedPrice));
  };

  const validateForm = () => {
    if (!groupDetails) return ['Group details not loaded'];
    
    const errors = [];
    const qty = parseFloat(quantity);

    if (!quantity || qty <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (qty < groupDetails.min_quantity_per_buyer) {
      errors.push(`Minimum quantity is ${groupDetails.min_quantity_per_buyer} kg`);
    }

    if (groupDetails.max_quantity_per_buyer && qty > groupDetails.max_quantity_per_buyer) {
      errors.push(`Maximum quantity is ${groupDetails.max_quantity_per_buyer} kg`);
    }

    if (qty > groupDetails.remaining_quantity) {
      errors.push(`Only ${groupDetails.remaining_quantity} kg remaining`);
    }

    if (groupDetails.remaining_slots <= 0) {
      errors.push('No spots remaining in this group');
    }

    if (new Date(groupDetails.deadline) <= new Date()) {
      errors.push('This group purchase has expired');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0],
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/group-purchases/${groupPurchaseId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: parseFloat(quantity),
          deliveryPreference: deliveryPreference || undefined,
          notes: notes || undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join group purchase');
      }

      toast({
        title: 'Success',
        description: result.message,
        variant: 'default'
      });

      onSuccess();

    } catch (error: any) {
      console.error('Join group error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join group purchase',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join Group Purchase</DialogTitle>
          <DialogDescription>
            Review the details and specify your quantity to join this group purchase.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !groupDetails ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load group purchase details. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium text-lg">{groupDetails.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{groupDetails.product_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Organized by {groupDetails.organizer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {new Date(groupDetails.deadline).toLocaleDateString()}</span>
                </div>
                {groupDetails.delivery_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{groupDetails.delivery_location}</span>
                  </div>
                )}
              </div>
              
              {groupDetails.description && (
                <p className="text-sm text-muted-foreground">{groupDetails.description}</p>
              )}
            </div>

            {/* Pricing Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Original Price:</span>
                  <span className="font-medium ml-2">{groupDetails.unit_price.toFixed(2)} Birr/kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Group Price:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {(groupDetails.unit_price * (1 - (groupDetails.group_discount_percentage || 0) / 100)).toFixed(2)} Birr/kg
                  </span>
                </div>
                {groupDetails.group_discount_percentage > 0 && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium ml-2 text-green-600">{groupDetails.group_discount_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings per kg:</span>
                      <span className="font-medium ml-2 text-green-600">
                        {(groupDetails.unit_price * (groupDetails.group_discount_percentage / 100)).toFixed(2)} Birr
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{groupDetails.remaining_slots}</div>
                <div className="text-sm text-muted-foreground">Spots Remaining</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{groupDetails.remaining_quantity.toFixed(1)} kg</div>
                <div className="text-sm text-muted-foreground">Quantity Available</div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min={groupDetails.min_quantity_per_buyer}
                  max={Math.min(
                    groupDetails.max_quantity_per_buyer || groupDetails.remaining_quantity,
                    groupDetails.remaining_quantity
                  )}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Min: ${groupDetails.min_quantity_per_buyer} kg`}
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Min: {groupDetails.min_quantity_per_buyer} kg
                  {groupDetails.max_quantity_per_buyer && ` • Max: ${groupDetails.max_quantity_per_buyer} kg`}
                  {` • Available: ${groupDetails.remaining_quantity} kg`}
                </div>
              </div>

              {/* Cost Calculation */}
              {quantity && parseFloat(quantity) > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Your Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">{quantity} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per kg:</span>
                      <span className="font-medium">
                        {(groupDetails.unit_price * (1 - (groupDetails.group_discount_percentage || 0) / 100)).toFixed(2)} Birr
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>{totalAmount.toFixed(2)} Birr</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Your Savings:</span>
                        <span className="font-medium">{savings.toFixed(2)} Birr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Preference */}
            <div>
              <Label htmlFor="deliveryPreference">Delivery Preference (Optional)</Label>
              <Input
                id="deliveryPreference"
                value={deliveryPreference}
                onChange={(e) => setDeliveryPreference(e.target.value)}
                placeholder="Specific delivery location or pickup preference"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or notes for the organizer"
                rows={3}
              />
            </div>

            {/* Payment Information */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Process:</strong> After joining, you'll have 24 hours to complete payment. 
                Your payment will be held in escrow until the group purchase is completed and orders are fulfilled.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !quantity || parseFloat(quantity) <= 0}
              >
                {submitting ? 'Joining...' : `Join Group (${totalAmount.toFixed(2)} Birr)`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}