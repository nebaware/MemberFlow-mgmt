
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
import { UploadCloud, CheckCircle, ShieldCheck, UserPlus, Truck, FileText, DollarSign, MapPin } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, VEHICLE_TYPES, PRICING_UNITS, SPECIAL_HANDLING_FEATURES, APP_NAME } from "@/lib/constants";
import { useTranslations } from 'next-intl';

const agentRegistrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, "Valid Ethiopian mobile (+2519... or +2517...)."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  vehicleType: z.string().min(1, "Vehicle type is required."),
  vehiclePlateNumber: z.string().min(3, "Vehicle plate number is required."),
  drivingLicenseNumber: z.string().min(5, "Driving license number is required."),
  baseLocation: z.string().min(1, "Base operating location is required."),
  serviceAreasDescription: z.string().min(10, "Service area description (e.g., towns, zones) is required."),
  operatingHours: z.string().min(5, "Operating hours (e.g., Mon-Sat, 8AM-6PM) is required."),
  priceRate: z.coerce.number().positive("Price rate must be a positive number."),
  priceUnit: z.string().min(1, "Pricing unit (e.g., per Km, per Trip) is required."),
  specialFeatures: z.array(z.string()).optional(),
  vehicleRegistrationDoc: z.any().refine((files) => files instanceof FileList && files.length > 0, "Vehicle registration document is required."),
  drivingLicenseScan: z.any().refine((files) => files instanceof FileList && files.length > 0, "Driving license scan is required."),
  profilePicture: z.any().optional(),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type AgentRegistrationFormValues = z.infer<typeof agentRegistrationSchema>;

export function AgentRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleRegPreview, setVehicleRegPreview] = useState<string | null>(null);
  const [licenseScanPreview, setLicenseScanPreview] = useState<string | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const form = useForm<AgentRegistrationFormValues>({
    resolver: zodResolver(agentRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      vehicleType: "",
      vehiclePlateNumber: "",
      drivingLicenseNumber: "",
      baseLocation: "",
      serviceAreasDescription: "",
      operatingHours: "",
      priceRate: 0,
      priceUnit: "",
      specialFeatures: [],
      agreeToTerms: false,
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof AgentRegistrationFormValues,
    setPreview: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue(fieldName, event.target.files as FileList);
    } else {
      setPreview(null);
      form.resetField(fieldName);
    }
  };


  async function onSubmit(values: AgentRegistrationFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.fullName,
          role: 'transporter',
          phone: values.phoneNumber,
          location: values.baseLocation,
          licenseNumber: values.drivingLicenseNumber,
          vehicleRegistration: values.vehiclePlateNumber,
          // Additional fields could be stored in a separate table or JSON field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration Successful!',
        description: data.message || `Welcome ${values.fullName}! Your account is pending verification.`,
        action: <CheckCircle className="text-green-500" />,
      });

      form.reset();
      setVehicleRegPreview(null);
      setLicenseScanPreview(null);
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
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserPlus className="h-6 w-6 text-primary" /> {t('transport_reg.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.full_name')}</FormLabel>
                <FormControl><Input placeholder="Abebe Bikila" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.phone')}</FormLabel>
                  <FormControl><Input placeholder="+251912345678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.email')}</FormLabel>
                  <FormControl><Input type="email" placeholder="abebe@example.com" {...field} /></FormControl>
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

            {/* Vehicle Information */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Vehicle & License</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="vehicleType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.vehicle_type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('transport_reg.vehicle_type_placeholder')} /></SelectTrigger></FormControl>
                    <SelectContent>{VEHICLE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="vehiclePlateNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.plate_number')}</FormLabel>
                  <FormControl><Input placeholder="e.g., A12345AA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="drivingLicenseNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.license_number')}</FormLabel>
                <FormControl><Input placeholder="Enter your driving license number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Service Details */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="baseLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.base_location')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('transport_reg.base_location_placeholder')} /></SelectTrigger></FormControl>
                    <SelectContent>{ETHIOPIAN_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="operatingHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.operating_hours')}</FormLabel>
                  <FormControl><Input placeholder="e.g., Mon-Fri 8AM-6PM, Sat 9AM-1PM" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="serviceAreasDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.service_areas')}</FormLabel>
                <FormControl><Textarea placeholder="Describe the regions, zones, or specific routes you cover." {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Pricing */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="priceRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.price_rate')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="e.g., 500" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="priceUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transport_reg.price_unit')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('transport_reg.price_unit_placeholder')} /></SelectTrigger></FormControl>
                    <SelectContent>{PRICING_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Special Features */}
            <FormField
              control={form.control}
              name="specialFeatures"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">{t('transport_reg.special_features')}</FormLabel>
                    <FormDescription>{t('transport_reg.special_features_desc')}</FormDescription>
                  </div>
                  {SPECIAL_HANDLING_FEATURES.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="specialFeatures"
                      render={({ field }) => {
                        return (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mb-2 p-2 border rounded-md hover:bg-muted/20">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Document Uploads */}
            <h3 className="text-lg font-medium pt-4 border-t mt-4 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Document Uploads</h3>
            <FormField control={form.control} name="vehicleRegistrationDoc" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.doc_vehicle_reg')}</FormLabel>
                <FormControl><Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "vehicleRegistrationDoc", setVehicleRegPreview)} className="hidden" id="vehicleRegUpload" /></FormControl>
                <label htmlFor="vehicleRegUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {vehicleRegPreview ? <Image src={vehicleRegPreview} alt="Vehicle registration preview" width={100} height={100} className="max-h-full max-w-full object-contain p-1" data-ai-hint="document scan" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{vehicleRegPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="drivingLicenseScan" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.doc_license')}</FormLabel>
                <FormControl><Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "drivingLicenseScan", setLicenseScanPreview)} className="hidden" id="licenseScanUpload" /></FormControl>
                <label htmlFor="licenseScanUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {licenseScanPreview ? <Image src={licenseScanPreview} alt="License scan preview" width={100} height={100} className="max-h-full max-w-full object-contain p-1" data-ai-hint="license scan" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{licenseScanPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profilePicture" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('transport_reg.profile_pic')}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profilePicture", setProfilePicPreview)} className="hidden" id="profilePicUpload" /></FormControl>
                <label htmlFor="profilePicUpload" className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  {profilePicPreview ? <Image src={profilePicPreview} alt="Profile picture preview" width={100} height={100} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="profile photo" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground">{profilePicPreview ? t('farmer_reg.change_image') : t('farmer_reg.upload')}</p>
                </label>
                <FormMessage />
              </FormItem>
            )} />

            {/* Terms and Conditions */}
            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4 border-t mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('transport_reg.agree_terms')} <a href="/terms" target="_blank" className="text-primary hover:underline">{t('transport_reg.terms')}</a> of {APP_NAME}.</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('transport_reg.submitting') : t('transport_reg.submit')}
              <ShieldCheck className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
