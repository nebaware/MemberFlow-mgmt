
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, CheckCircle, Warehouse, Building2, FileText, Images, MapPin, ImagePlus } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, STORAGE_TYPES, STORAGE_FEATURES, STORAGE_CAPACITY_UNITS, APP_NAME } from "@/lib/constants";

const storageProviderRegistrationSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters."),
  contactPersonFullName: z.string().min(3, "Contact person's full name is required."),
  phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, "Valid Ethiopian mobile (+2519... or +2517...)."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  businessRegistrationNumber: z.string().min(1, "Business registration number or TIN is required."),
  facilityLocation: z.string().min(1, "Main facility location is required."),
  storageTypesOffered: z.array(z.string()).min(1, "Select at least one storage type."),
  totalCapacity: z.coerce.number().positive("Total capacity must be a positive number."),
  capacityUnit: z.string().min(1, "Capacity unit is required."),
  keyFeatures: z.array(z.string()).optional(),
  servicesDescription: z.string().min(20, "Services description must be at least 20 characters.").max(1000, "Description cannot exceed 1000 characters."),
  facilityPhotos: z.any().optional(), // Multiple file upload
  companyLogo: z.any().optional(),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type StorageProviderRegistrationFormValues = z.infer<typeof storageProviderRegistrationSchema>;

export function StorageProviderRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [facilityPhotosPreview, setFacilityPhotosPreview] = useState<string[]>([]);


  const form = useForm<StorageProviderRegistrationFormValues>({
    resolver: zodResolver(storageProviderRegistrationSchema),
    defaultValues: {
      businessName: "",
      contactPersonFullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessRegistrationNumber: "",
      facilityLocation: "",
      storageTypesOffered: [],
      totalCapacity: 0,
      capacityUnit: "",
      keyFeatures: [],
      servicesDescription: "",
      agreeToTerms: false,
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: "companyLogo" | "facilityPhotos",
    setPreview: ((value: string | null) => void) | ((value: string[]) => void)
  ) => {
    const files = event.target.files;
    if (fieldName === "companyLogo") {
      const file = files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          (setPreview as (value: string | null) => void)(reader.result as string);
        };
        reader.readAsDataURL(file);
        form.setValue(fieldName, event.target.files);
      } else {
        (setPreview as (value: string | null) => void)(null);
        form.resetField(fieldName);
      }
    } else if (fieldName === "facilityPhotos") {
      if (files && files.length > 0) {
        const newPreviews: string[] = [];
        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === files.length) {
              (setPreview as (value: string[]) => void)(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        });
        form.setValue(fieldName, files);
      } else {
        (setPreview as (value: string[]) => void)([]);
        form.resetField(fieldName);
      }
    }
  };


  async function onSubmit(values: StorageProviderRegistrationFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.businessName,
          role: 'storage_provider',
          phone: values.phoneNumber,
          location: values.facilityLocation,
          licenseNumber: values.businessRegistrationNumber,
          specialization: values.storageTypesOffered.join(', '),
          // Additional fields could be stored in a separate table or JSON field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration Successful!',
        description: data.message || `Welcome ${values.businessName}! Your account is pending verification.`,
        action: <CheckCircle className="text-green-500" />,
      });

      form.reset();
      setLogoPreview(null);
      setFacilityPhotosPreview([]);

      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Warehouse className="h-6 w-6 text-primary" /> {t('storage_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Business Information */}
            <FormField control={form.control} name="businessName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.business_name')}</FormLabel>
                <FormControl><Input placeholder="e.g., SafeStore Ethiopia" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactPersonFullName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.contact_person')}</FormLabel>
                <FormControl><Input placeholder="e.g., Almaz Ayana" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('storage_reg.phone')}</FormLabel>
                  <FormControl><Input placeholder="+251912345678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('storage_reg.email')}</FormLabel>
                  <FormControl><Input type="email" placeholder="storage@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Create a password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Confirm your password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="businessRegistrationNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.reg_number')}</FormLabel>
                <FormControl><Input placeholder="Enter business license or TIN" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Facility Details */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {t('storage_reg.facility_details')}</h3>
            <FormField control={form.control} name="facilityLocation" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.location')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('buyer_reg.location_placeholder')} /></SelectTrigger></FormControl>
                  <SelectContent>{ETHIOPIAN_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="storageTypesOffered"
              render={() => (
                <FormItem>
                  <FormLabel>{t('storage_reg.types')}</FormLabel>
                  <FormDescription>{t('storage_reg.types_desc')}</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {STORAGE_TYPES.map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="storageTypesOffered"
                        render={({ field }) => {
                          return (
                            <FormItem key={type} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), type])
                                      : field.onChange((field.value || []).filter((value) => value !== type));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{type}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="totalCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('storage_reg.capacity')}</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="capacityUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('storage_reg.unit')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('farmer_reg.select_unit')} /></SelectTrigger></FormControl>
                    <SelectContent>{STORAGE_CAPACITY_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField
              control={form.control}
              name="keyFeatures"
              render={() => (
                <FormItem>
                  <FormLabel>{t('storage_reg.features')}</FormLabel>
                  <FormDescription>{t('storage_reg.features_desc')}</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {STORAGE_FEATURES.map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="keyFeatures"
                        render={({ field }) => {
                          return (
                            <FormItem key={feature} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), feature])
                                      : field.onChange((field.value || []).filter((value) => value !== feature));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{feature}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="servicesDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.description')}</FormLabel>
                <FormControl><Textarea placeholder="Describe your storage facility, security measures, and additional services." {...field} rows={4} maxLength={1000} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Document Uploads */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" /> {t('storage_reg.media')}</h3>
            <FormField control={form.control} name="facilityPhotos" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.photos')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, "facilityPhotos", setFacilityPhotosPreview)} className="hidden" id="facilityPhotosUpload" /></FormControl>
                <label htmlFor="facilityPhotosUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {facilityPhotosPreview.length > 0 ?
                    <div className="flex flex-wrap gap-2 p-2 justify-center">
                      {facilityPhotosPreview.map((src, idx) => <Image key={idx} src={src} alt={`Facility preview ${idx + 1}`} width={60} height={60} className="h-16 w-16 object-cover rounded-md" data-ai-hint="facility photo" />)}
                    </div>
                    : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{facilityPhotosPreview.length > 0 ? `${facilityPhotosPreview.length} photos selected` : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companyLogo" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('storage_reg.logo')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "companyLogo", setLogoPreview)} className="hidden" id="storageLogoUpload" /></FormControl>
                <label htmlFor="storageLogoUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {logoPreview ? <Image src={logoPreview} alt="Company logo preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="company logo" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{logoPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">{t('storage_reg.terms')}</a> of {APP_NAME}.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('storage_reg.submitting') : t('storage_reg.submit')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
