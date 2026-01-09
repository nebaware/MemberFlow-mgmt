'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Package, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign,
  Info,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  unit: string;
  location: string;
}

interface CreateGroupPurchaseProps {
  onSuccess?: (groupPurchaseId: number) => void;
}

export function CreateGroupPurchase({ onSuccess }: CreateGroupPurchaseProps) {
  const t = useTranslations();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    totalQuantity: '',
    minQuantityPerBuyer: '',
    maxQuantityPerBuyer: '',
    unitPrice: '',
    targetParticipants: '',
    deadline: '',
    deliveryLocation: '',
    deliveryInstructions: '',
    groupDiscountPercentage: ''
  });

  // Calculated values
  const [calculations, setCalculations] = useState({
    totalValue: 0,
    minPossibleQuantity: 0,
    maxPossibleQuantity: 0,
    avgQuantityPerPerson: 0,
    potentialSavings: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateValues();
  }, [formData, selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const result = await response.json();
      
      if (response.ok) {
        setProducts(result.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const calculateValues = () => {
    const totalQuantity = parseFloat(formData.totalQuantity) || 0;
    const minQuantity = parseFloat(formData.minQuantityPerBuyer) || 0;
    const maxQuantity = parseFloat(formData.maxQuantityPerBuyer) || totalQuantity;
    const targetParticipants = parseInt(formData.targetParticipants) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const discountPercentage = parseFloat(formData.groupDiscountPercentage) || 0;

    const totalValue = totalQuantity * unitPrice;
    const minPossibleQuantity = targetParticipants * minQuantity;
    const maxPossibleQuantity = targetParticipants * maxQuantity;
    const avgQuantityPerPerson = targetParticipants > 0 ? totalQuantity / targetParticipants : 0;
    const discountedPrice = unitPrice * (1 - discountPercentage / 100);
    const potentialSavings = (unitPrice - discountedPrice) * totalQuantity;

    setCalculations({
      totalValue,
      minPossibleQuantity,
      maxPossibleQuantity,
      avgQuantityPerPerson,
      potentialSavings
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    setSelectedProduct(product || null);
    
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        unitPrice: product.price.toString(),
        title: `Group Buy: ${product.name}`,
        deliveryLocation: product.location
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.productId) errors.push('Please select a product');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.totalQuantity || parseFloat(formData.totalQuantity) <= 0) {
      errors.push('Total quantity must be greater than 0');
    }
    if (!formData.minQuantityPerBuyer || parseFloat(formData.minQuantityPerBuyer) <= 0) {
      errors.push('Minimum quantity per buyer must be greater than 0');
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      errors.push('Unit price must be greater than 0');
    }
    if (!formData.targetParticipants || parseInt(formData.targetParticipants) <= 0) {
      errors.push('Target participants must be greater than 0');
    }
    if (!formData.deadline) {
      errors.push('Deadline is required');
    } else {
      const deadline = new Date(formData.deadline);
      if (deadline <= new Date()) {
        errors.push('Deadline must be in the future');
      }
    }

    // Validate quantity logic
    const totalQuantity = parseFloat(formData.totalQuantity) || 0;
    const minQuantity = parseFloat(formData.minQuantityPerBuyer) || 0;
    const maxQuantity = parseFloat(formData.maxQuantityPerBuyer) || totalQuantity;
    const targetParticipants = parseInt(formData.targetParticipants) || 0;

    if (maxQuantity < minQuantity) {
      errors.push('Maximum quantity cannot be less than minimum quantity');
    }

    if (calculations.minPossibleQuantity > totalQuantity) {
      errors.push('Total quantity is too low for the minimum requirements');
    }

    if (selectedProduct && totalQuantity > selectedProduct.stock_quantity) {
      errors.push('Total quantity exceeds available stock');
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

    setIsLoading(true);

    try {
      const response = await fetch('/api/group-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          title: formData.title,
          description: formData.description,
          totalQuantity: parseFloat(formData.totalQuantity),
          minQuantityPerBuyer: parseFloat(formData.minQuantityPerBuyer),
          maxQuantityPerBuyer: formData.maxQuantityPerBuyer ? parseFloat(formData.maxQuantityPerBuyer) : null,
          unitPrice: parseFloat(formData.unitPrice),
          targetParticipants: parseInt(formData.targetParticipants),
          deadline: formData.deadline,
          deliveryLocation: formData.deliveryLocation,
          deliveryInstructions: formData.deliveryInstructions,
          groupDiscountPercentage: formData.groupDiscountPercentage ? parseFloat(formData.groupDiscountPercentage) : null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group purchase');
      }

      toast({
        title: 'Success',
        description: 'Group purchase created successfully!',
        variant: 'default'
      });

      // Reset form
      setFormData({
        productId: '',
        title: '',
        description: '',
        totalQuantity: '',
        minQuantityPerBuyer: '',
        maxQuantityPerBuyer: '',
        unitPrice: '',
        targetParticipants: '',
        deadline: '',
        deliveryLocation: '',
        deliveryInstructions: '',
        groupDiscountPercentage: ''
      });
      setSelectedProduct(null);
      setIsOpen(false);

      onSuccess?.(result.groupPurchaseId);

    } catch (error: any) {
      console.error('Create group purchase error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group purchase',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Group Purchase</DialogTitle>
          <DialogDescription>
            Organize a group purchase to get bulk pricing and share costs with other buyers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Select Product</Label>
                <Select value={formData.productId} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product to organize group purchase for" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {product.price} Birr/{product.unit} ({product.stock_quantity} {product.unit} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{selectedProduct.name}</strong> - {selectedProduct.category}<br />
                    Price: {selectedProduct.price} Birr/{selectedProduct.unit}<br />
                    Available: {selectedProduct.stock_quantity} {selectedProduct.unit}<br />
                    Location: {selectedProduct.location}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Group Purchase Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Monthly Teff Group Buy - Premium Quality"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the group purchase, quality expectations, delivery details, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Quantity and Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalQuantity">Total Quantity (kg)</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.totalQuantity}
                    onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                    placeholder="e.g., 500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unitPrice">Price per kg (Birr)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    placeholder="e.g., 85.50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minQuantityPerBuyer">Min Quantity per Buyer (kg)</Label>
                  <Input
                    id="minQuantityPerBuyer"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.minQuantityPerBuyer}
                    onChange={(e) => handleInputChange('minQuantityPerBuyer', e.target.value)}
                    placeholder="e.g., 25"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxQuantityPerBuyer">Max Quantity per Buyer (kg) - Optional</Label>
                  <Input
                    id="maxQuantityPerBuyer"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.maxQuantityPerBuyer}
                    onChange={(e) => handleInputChange('maxQuantityPerBuyer', e.target.value)}
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <Label htmlFor="groupDiscountPercentage">Group Discount % (Optional)</Label>
                  <Input
                    id="groupDiscountPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formData.groupDiscountPercentage}
                    onChange={(e) => handleInputChange('groupDiscountPercentage', e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              {/* Calculations Display */}
              {formData.totalQuantity && formData.unitPrice && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Calculations</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-medium ml-2">{calculations.totalValue.toFixed(2)} Birr</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg per Person:</span>
                      <span className="font-medium ml-2">{calculations.avgQuantityPerPerson.toFixed(1)} kg</span>
                    </div>
                    {calculations.potentialSavings > 0 && (
                      <div>
                        <span className="text-muted-foreground">Total Savings:</span>
                        <span className="font-medium ml-2 text-green-600">{calculations.potentialSavings.toFixed(2)} Birr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants and Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetParticipants">Target Participants</Label>
                  <Input
                    id="targetParticipants"
                    type="number"
                    min="2"
                    value={formData.targetParticipants}
                    onChange={(e) => handleInputChange('targetParticipants', e.target.value)}
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    min={minDate}
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryLocation">Delivery/Pickup Location</Label>
                <Input
                  id="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                  placeholder="e.g., Merkato, Addis Ababa"
                />
              </div>

              <div>
                <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  placeholder="Special delivery instructions, contact information, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Group Purchase'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}