
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
import { UploadCloud, CheckCircle, Wrench } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, TOOL_CATEGORIES } from "@/lib/constants";
import { useTranslations } from 'next-intl';

const toolSellerRegistrationSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters."),
  contactPersonFullName: z.string().min(3, "Contact person's full name is required."),
  phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, "Valid Ethiopian mobile (+2519... or +2517...)."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  businessRegistrationNumber: z.string().min(1, "Business registration number is required."),
  location: z.string().min(1, "Business location is required."),
  toolCategoriesSold: z.array(z.string()).min(1, "Select at least one tool category."),
  companyLogo: z.any().optional(),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ToolSellerRegistrationFormValues = z.infer<typeof toolSellerRegistrationSchema>;

export function ToolSellerRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<ToolSellerRegistrationFormValues>({
    resolver: zodResolver(toolSellerRegistrationSchema),
    defaultValues: {
      businessName: "",
      contactPersonFullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessRegistrationNumber: "",
      location: "",
      toolCategoriesSold: [],
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
      form.setValue("companyLogo", event.target.files);
    } else {
      setPreview(null);
      form.resetField("companyLogo");
    }
  };

  async function onSubmit(values: ToolSellerRegistrationFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.businessName, // Using business name as main name
          role: 'tool_seller',
          phone: values.phoneNumber,
          location: values.location,
          licenseNumber: values.businessRegistrationNumber,
          specialization: values.toolCategoriesSold.join(', '),
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
        <CardTitle className="flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> {t('tool_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="businessName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tool_reg.business_name')}</FormLabel>
                <FormControl><Input placeholder="e.g., Addis Agro-Tools" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactPersonFullName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tool_reg.contact_person')}</FormLabel>
                <FormControl><Input placeholder="e.g., Kebede Tadesse" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tool_reg.phone')}</FormLabel>
                  <FormControl><Input placeholder="+251912345678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tool_reg.email')}</FormLabel>
                  <FormControl><Input type="email" placeholder="tools@example.com" {...field} /></FormControl>
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
                <FormLabel>{t('tool_reg.reg_number')}</FormLabel>
                <FormControl><Input placeholder="Enter business license number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tool_reg.location')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('buyer_reg.location_placeholder')} /></SelectTrigger></FormControl>
                  <SelectContent>{ETHIOPIAN_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="toolCategoriesSold"
              render={() => (
                <FormItem>
                  <FormLabel>{t('tool_reg.categories')}</FormLabel>
                  <FormDescription>{t('tool_reg.categories_desc')}</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {TOOL_CATEGORIES.map((category) => (
                      <FormField
                        key={category}
                        control={form.control}
                        name="toolCategoriesSold"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), category])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== category
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {category}
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
            <FormField control={form.control} name="companyLogo" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tool_reg.logo')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoPreview)} className="hidden" id="toolLogoUpload" /></FormControl>
                <label htmlFor="toolLogoUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {logoPreview ? <Image src={logoPreview} alt="Logo preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="company logo" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{logoPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('tool_reg.agree_terms')} <a href="/terms" target="_blank" className="text-primary hover:underline">{t('tool_reg.terms')}</a>.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('tool_reg.submitting') : t('tool_reg.submit')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
