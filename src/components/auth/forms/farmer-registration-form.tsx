
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, CheckCircle, User } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, FARM_SIZE_UNITS, MAIN_CROP_CATEGORIES } from "@/lib/constants";
import { useTranslations } from 'next-intl';

export function FarmerRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const farmerRegistrationSchema = z.object({
    fullName: z.string().min(3, t('farmer_reg.validation.name_min')),
    phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, t('farmer_reg.validation.phone_invalid')),
    email: z.string().email(t('farmer_reg.validation.email_invalid')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    farmLocation: z.string().min(1, t('farmer_reg.validation.location_required')),
    farmSize: z.coerce.number().positive(t('farmer_reg.validation.size_positive')),
    farmSizeUnit: z.string().min(1, t('farmer_reg.validation.unit_required')),
    mainCrops: z.array(z.string()).min(1, t('farmer_reg.validation.crops_required')),
    yearsExperience: z.coerce.number().min(0, t('farmer_reg.validation.exp_negative')),
    licenseNumber: z.string().optional(),
    profilePicture: z.any().optional(),
    agreeToTerms: z.boolean().refine(value => value === true, {
      message: t('farmer_reg.validation.terms_required'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

  type FarmerRegistrationFormValues = z.infer<typeof farmerRegistrationSchema>;

  const form = useForm<FarmerRegistrationFormValues>({
    resolver: zodResolver(farmerRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      farmLocation: "",
      farmSize: 0,
      farmSizeUnit: "",
      mainCrops: [],
      yearsExperience: 0,
      licenseNumber: "",
      agreeToTerms: false,
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setPreview: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profilePicture", event.target.files);
    } else {
      setPreview(null);
      form.resetField("profilePicture");
    }
  };

  async function onSubmit(values: FarmerRegistrationFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.fullName,
          role: 'farmer',
          phone: values.phoneNumber,
          location: values.farmLocation,
          farmSize: values.farmSize,
          farmSizeUnit: values.farmSizeUnit,
          specialization: values.mainCrops.join(', '),
          experienceYears: values.yearsExperience,
          licenseNumber: values.licenseNumber || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration Successful!',
        description: data.message || `Welcome ${values.fullName}! You can now login.`,
        action: <CheckCircle className="text-green-500" />,
      });

      form.reset();
      setProfilePicPreview(null);

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
        <CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-primary" /> {t('farmer_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('farmer_reg.full_name')}</FormLabel>
                <FormControl><Input placeholder={t('farmer_reg.full_name_placeholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('farmer_reg.phone')}</FormLabel>
                  <FormControl><Input placeholder={t('farmer_reg.phone_placeholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('farmer_reg.email')}</FormLabel>
                  <FormControl><Input type="email" placeholder={t('farmer_reg.email_placeholder')} {...field} /></FormControl>
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
            <FormField control={form.control} name="farmLocation" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('farmer_reg.farm_location')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('farmer_reg.select_location')} /></SelectTrigger></FormControl>
                  <SelectContent>{ETHIOPIAN_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="farmSize" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('farmer_reg.farm_size')}</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder={t('farmer_reg.farm_size_placeholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="farmSizeUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('farmer_reg.unit')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('farmer_reg.select_unit')} /></SelectTrigger></FormControl>
                    <SelectContent>{FARM_SIZE_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField
              control={form.control}
              name="mainCrops"
              render={() => (
                <FormItem>
                  <FormLabel>{t('farmer_reg.main_crops')}</FormLabel>
                  <FormDescription>{t('farmer_reg.select_all')}</FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {MAIN_CROP_CATEGORIES.map((crop) => (
                      <FormField
                        key={crop}
                        control={form.control}
                        name="mainCrops"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={crop}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(crop)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), crop])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== crop
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {crop}
                              </FormLabel>
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
            <FormField control={form.control} name="yearsExperience" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('farmer_reg.years_exp')}</FormLabel>
                <FormControl><Input type="number" placeholder={t('farmer_reg.years_exp_placeholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profilePicture" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('farmer_reg.profile_pic')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePicPreview)} className="hidden" id="farmerProfilePicUpload" /></FormControl>
                <label htmlFor="farmerProfilePicUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {profilePicPreview ? <Image src={profilePicPreview} alt="Profile preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="profile photo" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{profilePicPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('farmer_reg.agree')} <a href="/terms" target="_blank" className="text-primary hover:underline">{t('farmer_reg.terms')}</a>.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('farmer_reg.submitting') : t('farmer_reg.submit')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
