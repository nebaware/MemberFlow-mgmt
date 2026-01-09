
"use client";

import type { DeliveryAgent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, MapPin, CheckCircle, Phone, MessageSquare, DollarSign, Send, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeliveryPaymentDialog } from './delivery-payment-dialog';

interface DeliveryAgentCardProps {
  agent: DeliveryAgent;
}

export function DeliveryAgentCard({ agent }: DeliveryAgentCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const productName = searchParams.get("productName") || "Unknown Product";
  const quantity = searchParams.get("quantity") || "1";
  const price = parseFloat(searchParams.get("price") || "0");
  const totalProductPrice = price * parseFloat(quantity);

  const handleSelectAgent = () => {
    setShowBookingOptions(true);
    toast({
      title: "Agent Selected",
      description: `${agent.name} selected. You can now finalize the order or contact them.`,
    });
  };

  const handleFinalizeOrder = () => {
    setPaymentDialogOpen(true);
  };

  const handleContactAgent = () => {
    toast({
      title: "Contact Initiated (Demo)",
      description: `Attempting to connect you with ${agent.name}. Details: ${agent.contact}`,
      action: <Send className="text-blue-500" />,
    });
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-amber-500" />
            <span>{(agent.rating || 0).toFixed(1)}</span>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground">
          <Truck className="h-3 w-3" /> {agent.vehicleType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          Based in: {agent.location}
        </div>
        <div className="text-sm">
          Availability: <Badge variant={agent.availability === "Available Now" ? "default" : "secondary"}>{agent.availability}</Badge>
        </div>
        <div className="flex items-center text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4 mr-1" />
          Rate: {agent.priceRate} {agent.priceCurrency}
        </div>
        {agent.specialFeatures.length > 0 && (
          <div>
            <p className="text-sm font-medium">Special Features:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {agent.specialFeatures.map(feature => (
                <Badge key={feature} variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center text-sm pt-1">
          {agent.contact === "Contact via App" ? <MessageSquare className="h-4 w-4 mr-2 text-primary" /> : <Phone className="h-4 w-4 mr-2 text-primary" />}
          Contact: {agent.contact}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!showBookingOptions ? (
          <Button className="w-full" onClick={handleSelectAgent}>
            Select & View Options
          </Button>
        ) : (
          <>
            <Button className="w-full" onClick={handleFinalizeOrder} variant="default">
              <ShoppingCart className="mr-2 h-4 w-4" /> Confirm Delivery with this Agent
            </Button>
            <Button className="w-full" onClick={handleContactAgent} variant="outline">
              <Send className="mr-2 h-4 w-4" /> Contact Agent (Demo)
            </Button>
            <Button className="w-full" onClick={() => setShowBookingOptions(false)} variant="ghost" size="sm">
              Cancel
            </Button>
          </>
        )}
      </CardFooter>

      <DeliveryPaymentDialog
        agent={agent}
        productName={productName}
        quantity={quantity}
        totalProductPrice={totalProductPrice}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
      />
    </Card>
  );
}
