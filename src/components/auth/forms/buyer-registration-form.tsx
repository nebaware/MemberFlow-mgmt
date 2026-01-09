
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
import { UploadCloud, CheckCircle, ShoppingBag } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, BUYER_TYPES, MAIN_CROP_CATEGORIES } from "@/lib/constants";
import { useTranslations } from 'next-intl';

export function BuyerRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const buyerRegistrationSchema = z.object({
    name: z.string().min(3, t('buyer_reg.validation.name_min')),
    phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, t('buyer_reg.validation.phone_invalid')),
    email: z.string().email(t('buyer_reg.validation.email_invalid')),
    businessType: z.string().min(1, t('buyer_reg.validation.type_required')),
    location: z.string().min(1, t('buyer_reg.validation.location_required')),
    primaryInterests: z.array(z.string()).min(1, t('buyer_reg.validation.interests_required')),
    profilePicture: z.any().optional(),
    agreeToTerms: z.boolean().refine(value => value === true, {
      message: t('buyer_reg.validation.terms_required'),
    }),
  });

  type BuyerRegistrationFormValues = z.infer<typeof buyerRegistrationSchema>;

  const form = useForm<BuyerRegistrationFormValues>({
    resolver: zodResolver(buyerRegistrationSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      businessType: "",
      location: "",
      primaryInterests: [],
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

  async function onSubmit(values: BuyerRegistrationFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Buyer Registration Data:", values);
    toast({
      title: t('buyer_reg.success_title'),
      description: t('buyer_reg.success_desc', { name: values.name }),
      action: <CheckCircle className="text-green-500" />,
    });
    form.reset();
    setProfilePicPreview(null);
    setIsSubmitting(false);
    router.push('/dashboard?role=buyer');
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> {t('buyer_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('buyer_reg.name_label')}</FormLabel>
                <FormControl><Input placeholder={t('buyer_reg.name_placeholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('buyer_reg.phone_label')}</FormLabel>
                  <FormControl><Input placeholder={t('buyer_reg.phone_placeholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('buyer_reg.email_label')}</FormLabel>
                  <FormControl><Input type="email" placeholder={t('buyer_reg.email_placeholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="businessType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('buyer_reg.type_label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('buyer_reg.type_placeholder')} /></SelectTrigger></FormControl>
                  <SelectContent>{BUYER_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('buyer_reg.location_label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('buyer_reg.location_placeholder')} /></SelectTrigger></FormControl>
                  <SelectContent>{ETHIOPIAN_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="primaryInterests"
              render={() => (
                <FormItem>
                  <FormLabel>{t('buyer_reg.interests_label')}</FormLabel>
                  <FormDescription>{t('buyer_reg.interests_desc')}</FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {MAIN_CROP_CATEGORIES.map((interest) => (
                      <FormField
                        key={interest}
                        control={form.control}
                        name="primaryInterests"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={interest}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(interest)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), interest])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== interest
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {interest}
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
            <FormField control={form.control} name="profilePicture" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('buyer_reg.profile_pic_label')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePicPreview)} className="hidden" id="buyerProfilePicUpload" /></FormControl>
                <label htmlFor="buyerProfilePicUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {profilePicPreview ? <Image src={profilePicPreview} alt="Profile/Logo preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="profile logo" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{profilePicPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('buyer_reg.agree_terms')} <a href="/terms" target="_blank" className="text-primary hover:underline">{t('buyer_reg.terms')}</a>.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('buyer_reg.submitting') : t('buyer_reg.submit')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
