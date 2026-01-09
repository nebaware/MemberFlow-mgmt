'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  MapPin, 
  Package, 
  DollarSign,
  Calendar,
  TrendingDown,
  Shield,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GroupPurchaseCardProps {
  groupPurchase: {
    id: number;
    title: string;
    description: string;
    product_name: string;
    product_category: string;
    product_image?: string;
    organizer_name: string;
    organizer_verification: string;
    unit_price: number;
    group_discount_percentage: number;
    total_quantity: number;
    min_quantity_per_buyer: number;
    max_quantity_per_buyer?: number;
    target_participants: number;
    current_participants: number;
    remaining_slots: number;
    remaining_quantity: number;
    deadline: string;
    delivery_location?: string;
    status: string;
    created_at: string;
  };
  showJoinButton?: boolean;
  onJoin?: (groupPurchaseId: number) => void;
}

export function GroupPurchaseCard({ groupPurchase, showJoinButton = true, onJoin }: GroupPurchaseCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const deadline = new Date(groupPurchase.deadline);
  const now = new Date();
  const timeRemaining = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const isExpired = timeRemaining <= 0;

  const participationProgress = (groupPurchase.current_participants / groupPurchase.target_participants) * 100;
  const quantityProgress = ((groupPurchase.total_quantity - groupPurchase.remaining_quantity) / groupPurchase.total_quantity) * 100;

  const originalPrice = groupPurchase.unit_price;
  const discountPercentage = groupPurchase.group_discount_percentage || 0;
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  const savings = originalPrice - discountedPrice;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = () => {
    if (daysRemaining <= 1) return 'text-red-600';
    if (daysRemaining <= 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const handleJoin = async () => {
    if (onJoin) {
      setIsJoining(true);
      try {
        await onJoin(groupPurchase.id);
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleViewDetails = () => {
    router.push(`/group-purchases/${groupPurchase.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{groupPurchase.title}</CardTitle>
            <CardDescription className="text-sm">
              {groupPurchase.product_name} • {groupPurchase.product_category}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(groupPurchase.status)}>
            {groupPurchase.status.toUpperCase()}
          </Badge>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {groupPurchase.organizer_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Organized by {groupPurchase.organizer_name}
          </span>
          {groupPurchase.organizer_verification === 'verified' && (
            <Shield className="h-4 w-4 text-green-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Group Price</span>
            {discountPercentage > 0 && (
              <Badge variant="secondary" className="text-xs">
                <TrendingDown className="h-3 w-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              {discountedPrice.toFixed(2)} Birr/kg
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice.toFixed(2)} Birr/kg
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Save {savings.toFixed(2)} Birr per kg
            </p>
          )}
        </div>

        {/* Quantity Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Total Quantity
            </div>
            <div className="font-medium">{groupPurchase.total_quantity} kg</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              Min per person
            </div>
            <div className="font-medium">
              {groupPurchase.min_quantity_per_buyer} kg
              {groupPurchase.max_quantity_per_buyer && 
                ` - ${groupPurchase.max_quantity_per_buyer} kg`
              }
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Participants</span>
              <span>{groupPurchase.current_participants}/{groupPurchase.target_participants}</span>
            </div>
            <Progress value={participationProgress} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Quantity Committed</span>
              <span>{(groupPurchase.total_quantity - groupPurchase.remaining_quantity).toFixed(1)}/{groupPurchase.total_quantity} kg</span>
            </div>
            <Progress value={quantityProgress} className="h-2" />
          </div>
        </div>

        {/* Time and Location */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={getUrgencyColor()}>
              {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
            </span>
          </div>
          {groupPurchase.delivery_location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{groupPurchase.delivery_location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {groupPurchase.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {groupPurchase.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {showJoinButton && groupPurchase.status === 'open' && !isExpired && (
            <Button
              size="sm"
              onClick={handleJoin}
              disabled={isJoining || groupPurchase.remaining_slots <= 0}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 
               groupPurchase.remaining_slots <= 0 ? 'Full' : 'Join Group'}
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>{groupPurchase.remaining_slots} spots left</span>
          <span>{groupPurchase.remaining_quantity.toFixed(1)} kg available</span>
        </div>
      </CardContent>
    </Card>
  );
}