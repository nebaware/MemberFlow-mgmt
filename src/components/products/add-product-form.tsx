
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { useState, ChangeEvent } from "react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, CheckCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.string().min(1, "Category is required."),
  location: z.string().min(1, "Location is required."),
  imagePreview: z.string().optional(), // For previewing image
  premiumListing: z.boolean().default(false).optional(), // Added for premium hint
});

type ProductFormValues = z.infer<typeof productSchema>;

const categories = ["Vegetables", "Fruits", "Dairy", "Pantry", "Meats", "Grains", "Herbs", "Spices", "Honey", "Coffee", "Agricultural Technologies"];
const locations = ["My Farm", "Green Valley Coop", "Local Market Stall", "Regional Distribution Center", "Addis Ababa", "Amhara Region", "Oromia Region", "SNNPR", "Tigray Region", "Sidama Region", "Harar", "Dire Dawa"];


export function AddProductForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      location: "",
      premiumListing: false,
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("imagePreview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    try {
      // POST to our server API (which will persist to database)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price: Number(values.price) || 0,
          category: values.category || null,
          location: values.location || null,
          imagePreview: values.imagePreview || null,
          premiumListing: Boolean(values.premiumListing),
          stockQuantity: 100, // Default stock
          unit: 'kg', // Default unit
        }),
      });

      if (!res.ok) {
        // Try to parse a JSON error body; fall back to text if parsing fails
        let message = 'Failed to save product';
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await res.json();
            message = (errorData && (errorData.error || errorData.message)) || JSON.stringify(errorData) || message;
          } else {
            const text = await res.text();
            message = text || message;
          }
        } catch (parseErr) {
          message = String(parseErr || message);
        }

        // Show a user-friendly toast and stop submission without throwing
        toast({
          title: t('add_prod.error'),
          description: message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const json = await res.json();
      toast({
        title: t('add_prod.success'),
        description: t('add_prod.success_desc'),
        action: <CheckCircle className="text-green-500" />,
      });
      form.reset();
      setImagePreview(null);
      // Redirect to market page after a short delay to show the toast
      setTimeout(() => {
        router.push('/market');
      }, 1500);
    } catch (err) {
      console.error('Product submission error:', err);
      toast({
        title: t('add_prod.error'),
        description: String((err as any)?.message || err),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const productFormContent = (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{t('add_prod.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('add_prod.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('add_prod.name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('add_prod.desc')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('add_prod.desc_placeholder')} {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('add_prod.price')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('add_prod.price_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('add_prod.category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('add_prod.select_category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('add_prod.location')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('add_prod.select_location')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>{t('add_prod.image')}</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="imageUpload" />
              </FormControl>
              <label htmlFor="imageUpload" className="mt-1 flex justify-center w-full px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Product preview" width={120} height={120} className="mx-auto h-24 w-24 object-cover rounded-md" data-ai-hint="uploaded produce" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="flex text-sm text-muted-foreground">
                    <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                      {imagePreview ? t('add_prod.change_image') : t('add_prod.upload_image')}
                    </span>
                  </div>
                </div>
              </label>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="premiumListing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md bg-muted/10">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      id="premiumListing"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="premiumListing" className="font-normal flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      {t('add_prod.premium')}
                    </FormLabel>
                    <FormDescription>
                      {t('add_prod.premium_desc')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('add_prod.submitting') : t('add_prod.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  return productFormContent;
}

