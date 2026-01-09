
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Truck, CalendarDays, Package, Coins, MapPin, FileText, Thermometer, PackageCheck, Search } from "lucide-react";
// Removed mock data imports - will fetch from API
import type { DeliveryAgent } from "@/lib/types";
import { DeliveryAgentCard } from "./delivery-agent-card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const ethiopianLocations = [
  "Addis Ababa", "Adama (Nazret)", "Bahir Dar", "Mekelle", "Hawassa",
  "Dire Dawa", "Gondar", "Jimma", "Dessie", "Debre Markos",
  "Shashamane", "Harar", "Axum", "Nekemte", "Arba Minch", "Ziway",
  "Weldiya", "Sodo", "Asella", "Bishoftu (Debre Zeyit)"
];

const transportationRequestSchema = z.object({
  pickupLocation: z.string().min(1, "Pick-up location is required."),
  dropoffLocation: z.string().min(1, "Drop-off location is required."),
  cropType: z.string().min(1, "Crop type/name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  price: z.coerce.number().nonnegative("Price is required."),
  productId: z.string().optional(),
  pickupDate: z.date({ required_error: "Pick-up date is required." }),
  additionalNotes: z.string().optional(),
  temperatureControl: z.boolean().default(false).optional(),
  fragileHandling: z.boolean().default(false).optional(),
  otherFeatures: z.string().optional(),
});

type TransportationRequestFormValues = z.infer<typeof transportationRequestSchema>;

export function TransportationRequestForm() {
  const t = useTranslations('transport_form');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isFindingAgents, setIsFindingAgents] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[] | null>(null);

  const form = useForm<TransportationRequestFormValues>({
    resolver: zodResolver(transportationRequestSchema),
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      cropType: "",
      quantity: 1,
      price: 0,
      pickupDate: undefined,
      additionalNotes: "",
      temperatureControl: false,
      fragileHandling: false,
      otherFeatures: "",
      productId: "",
    },
  });

  useEffect(() => {
    if (searchParams) {
      const productName = searchParams.get("productName");
      const quantityParam = searchParams.get("quantity");
      const pickupLocationParam = searchParams.get("pickupLocation");
      const priceParam = searchParams.get("price");
      const productIdParam = searchParams.get("productId");

      if (productName) form.setValue("cropType", productName);
      if (quantityParam) form.setValue("quantity", parseInt(quantityParam, 10));
      if (pickupLocationParam) form.setValue("pickupLocation", pickupLocationParam);
      if (priceParam) form.setValue("price", parseFloat(priceParam));
      if (productIdParam) form.setValue("productId", productIdParam);
    }
  }, [searchParams, form]);

  async function handleFindAgents(values: TransportationRequestFormValues) {
    setIsFindingAgents(true);
    setAvailableAgents(null); // Clear previous results
    try {
      // Persist the transportation request to the backend first
      const payload = {
        requesterName: undefined,
        contact: undefined,
        vehicleType: undefined,
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        cropType: values.cropType,
        quantity: values.quantity,
        priceRate: values.price,
        pickupDate: values.pickupDate ? values.pickupDate.toISOString() : null,
        specialFeatures: [
          ...(values.temperatureControl ? ['Temperature Control'] : []),
          ...(values.fragileHandling ? ['Fragile Handling'] : []),
          ...(values.otherFeatures ? values.otherFeatures.split(',').map(s => s.trim()).filter(Boolean) : []),
        ],
        additionalNotes: values.additionalNotes || null,
      };

      const createRes = await fetch('/api/transportation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.error || t('request_failed'));
      }

      const created = await createRes.json();

      // Fetch available delivery agents from API
      const agentsRes = await fetch('/api/delivery-agents');
      let filteredAgents: DeliveryAgent[] = [];

      if (agentsRes.ok) {
        const allAgents = await agentsRes.json();

        // Filter agents based on requirements
        filteredAgents = allAgents.filter((agent: DeliveryAgent) => {
          let matches = true;
          if (values.temperatureControl && !agent.specialFeatures.includes('Temperature Control')) {
            matches = false;
          }
          if (values.fragileHandling && !agent.specialFeatures.includes('Fragile Handling')) {
            matches = false;
          }
          return matches;
        });
      }

      setAvailableAgents(filteredAgents);

      toast({
        title: t('search_complete'),
        description: `${filteredAgents.length} agent(s) found. Your request (${created.id}) was saved.`,
        action: <PackageCheck className="text-green-500" />,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: t('request_failed'),
        description: String(err?.message || err),
      });
    } finally {
      setIsFindingAgents(false);
    }
  }

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <>
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            {t('delivery_details')}
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFindAgents)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1"><Package className="h-4 w-4 text-muted-foreground" /> {t('product')}</Label>
                  <p className="text-sm text-foreground">{form.watch("cropType") || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1"><Coins className="h-4 w-4 text-muted-foreground" /> {t('quantity')}</Label>
                  <p className="text-sm text-foreground">{form.watch("quantity")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1"><Coins className="h-4 w-4 text-muted-foreground" /> {t('total_price')}</Label>
                  <p className="text-sm text-foreground">{(form.watch("price") * form.watch("quantity")).toFixed(2)} Birr</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t('pickup_location')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('pickup_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ethiopianLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t('dropoff_location')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('dropoff_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ethiopianLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField control={form.control} name="cropType" render={({ field }) => <Input type="hidden" {...field} />} />
              <FormField control={form.control} name="quantity" render={({ field }) => <Input type="hidden" {...field} />} />
              <FormField control={form.control} name="price" render={({ field }) => <Input type="hidden" {...field} />} />
              <FormField control={form.control} name="productId" render={({ field }) => <Input type="hidden" {...field} />} />

              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {t('pickup_date')}</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('date_placeholder')}
                      disabled={disablePastDates}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-2">
                <FormLabel className="text-base font-semibold">{t('special_handling')}</FormLabel>
                <FormField
                  control={form.control}
                  name="temperatureControl"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal flex items-center gap-1"><Thermometer className="h-4 w-4" /> {t('temp_control')}</FormLabel>
                        <FormDescription>{t('temp_desc')}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fragileHandling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal flex items-center gap-1"><Package className="h-4 w-4" /> {t('fragile')}</FormLabel>
                        <FormDescription>{t('fragile_desc')}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4" /> {t('additional_notes')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('notes_placeholder')} {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otherFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4" />{t('other_reqs')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('other_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isFindingAgents}>
                {isFindingAgents ? t('finding_agents') : t('find_agents')}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isFindingAgents && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
            <Search className="h-5 w-5 animate-pulse" /> {t('searching')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="shadow-md">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {availableAgents !== null && !isFindingAgents && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            {availableAgents.length > 0 ? t('available_agents') : t('no_agents')}
          </h2>
          {availableAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableAgents.map(agent => (
                <DeliveryAgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <Alert>
              <Truck className="h-4 w-4" />
              <AlertTitle>{t('no_agents_title')}</AlertTitle>
              <AlertDescription>
                {t('no_agents_desc')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
