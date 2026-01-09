
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, CheckCircle, BookOpen, GraduationCap, FileText } from "lucide-react";
import { EDUCATOR_EXPERTISE_AREAS } from "@/lib/constants";
import { useTranslations } from 'next-intl';

const educatorRegistrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, "Valid Ethiopian mobile (+2519... or +2517...)."),
  email: z.string().email("Invalid email address."),
  areaOfExpertise: z.array(z.string()).min(1, "Select at least one area of expertise."),
  yearsExperience: z.coerce.number().min(0, "Years of experience cannot be negative."),
  qualifications: z.string().min(10, "Please provide a brief summary of your qualifications/certifications.").optional(),
  qualificationsDoc: z.any().optional(), // File upload for proof
  bio: z.string().min(20, "Bio must be at least 20 characters.").max(500, "Bio cannot exceed 500 characters."),
  profilePicture: z.any().optional(),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type EducatorRegistrationFormValues = z.infer<typeof educatorRegistrationSchema>;

export function EducatorRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);


  const form = useForm<EducatorRegistrationFormValues>({
    resolver: zodResolver(educatorRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      areaOfExpertise: [],
      yearsExperience: 0,
      qualifications: "",
      bio: "",
      agreeToTerms: false,
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof EducatorRegistrationFormValues,
    setPreview: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue(fieldName, event.target.files);
    } else {
      setPreview(null);
      form.resetField(fieldName);
    }
  };

  async function onSubmit(values: EducatorRegistrationFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Educator Registration Data:", values);
    toast({
      title: t('transport_reg.success_title'), // Reusing success title
      description: t('transport_reg.success_desc', { name: values.fullName }), // Reusing success desc structure
      action: <CheckCircle className="text-green-500" />,
    });
    form.reset();
    setProfilePicPreview(null);
    setDocPreview(null);
    setIsSubmitting(false);
    router.push('/dashboard?role=educator');
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" /> {t('educator_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('educator_reg.full_name')}</FormLabel>
                <FormControl><Input placeholder="Dr. Almaz Kebede" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('educator_reg.phone')}</FormLabel>
                  <FormControl><Input placeholder="+251912345678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('educator_reg.email')}</FormLabel>
                  <FormControl><Input type="email" placeholder="almaz@university.edu.et" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField
              control={form.control}
              name="areaOfExpertise"
              render={() => (
                <FormItem>
                  <FormLabel>{t('educator_reg.expertise')}</FormLabel>
                  <FormDescription>{t('educator_reg.expertise_desc')}</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                    {EDUCATOR_EXPERTISE_AREAS.map((area) => (
                      <FormField
                        key={area}
                        control={form.control}
                        name="areaOfExpertise"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={area}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(area)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), area])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== area
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {area}
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
                <FormLabel>{t('educator_reg.experience')}</FormLabel>
                <FormControl><Input type="number" min="0" placeholder="e.g., 5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="qualifications" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('educator_reg.qualifications')}</FormLabel>
                <FormControl><Textarea placeholder="List your degrees, certifications, or relevant training." {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="qualificationsDoc" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('educator_reg.qualifications_doc')}</FormLabel>
                <FormControl><Input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, "qualificationsDoc", setDocPreview)} className="hidden" id="educatorQualDocUpload" /></FormControl>
                <label htmlFor="educatorQualDocUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {docPreview ? <div className="flex items-center gap-2"><FileText className="h-8 w-8 text-primary" /> <span className="text-sm text-primary">Document Selected</span></div> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{docPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('educator_reg.bio')}</FormLabel>
                <FormControl><Textarea placeholder="Tell us about yourself and your agricultural background." {...field} rows={4} maxLength={500} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profilePicture" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('educator_reg.profile_pic')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profilePicture", setProfilePicPreview)} className="hidden" id="educatorProfilePicUpload" /></FormControl>
                <label htmlFor="educatorProfilePicUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {profilePicPreview ? <Image src={profilePicPreview} alt="Profile preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{profilePicPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('educator_reg.agree_terms')} <a href="/terms" target="_blank" className="text-primary hover:underline">{t('educator_reg.terms')}</a>.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('educator_reg.submitting') : t('educator_reg.submit')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
