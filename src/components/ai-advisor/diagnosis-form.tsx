"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { diagnosePestDisease, DiagnosePestDiseaseOutput } from "@/ai/flows/ai-pest-disease-diagnosis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, CheckCircle, AlertTriangle, Bot, Sparkles, ScanLine, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const diagnosisSchema = z.object({
  image: z.any().refine(fileList => fileList instanceof FileList && fileList.length > 0, "An image is required."),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

export function DiagnosisForm() {
  const { toast } = useToast();
  const t = useTranslations();
  const locale = useLocale();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosePestDiseaseOutput | null>(null);
  const [isSafeModeResult, setIsSafeModeResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseLanguage, setResponseLanguage] = useState<'en' | 'am' | 'om' | 'ti' | 'so'>(locale as any || 'en');

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", event.target.files);
    } else {
      setImagePreview(null);
      form.resetField("image");
    }
  };

  const resizeImage = (dataUri: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUri;
    });
  };

  async function onSubmit(values: DiagnosisFormValues) {
    if (!values.image || values.image.length === 0) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const file = values.image[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      setIsLoading(true);
      setError(null);
      setDiagnosisResult(null);

      try {
        const rawDataUri = reader.result as string;
        // Resize image to reduce latency and bandwidth
        const dataUri = await resizeImage(rawDataUri);

        // 🔄 REAL AI INTEGRATION: Call actual Genkit diagnosis flow
        const result = await diagnosePestDisease({
          photoDataUri: dataUri,
          language: responseLanguage as 'en' | 'am' | 'om' | 'ti' | 'so',
        });

        if (result.success && result.data) {
          setDiagnosisResult(result.data);
          setIsSafeModeResult(result.isMock || false);
          toast({
            title: t('ai.diagnosis_complete') || "Diagnosis Complete",
            description: t('ai.diagnosis_complete_desc') || "AI has analyzed your crop image.",
            action: <CheckCircle className="text-green-500" />,
          });
        } else {
          // If the AI service failed, we show a Safe Mode diagnosis with user-friendly messaging.
          const code = result.error || "AI_SERVICE_UNAVAILABLE";

          let friendlyDiagnosis = "Safe-Mode Diagnosis (Demo)";
          let friendlySolution =
            "Our real-time AI services are temporarily unavailable. This is a demonstration diagnosis only. For urgent issues, please consult your local agricultural extension worker.";

          if (code === "GEMINI_REGION_RESTRICTED") {
            friendlyDiagnosis = "AI Service Restricted in Your Region";
            friendlySolution =
              "Google Gemini is not available in this region for your current API key. The app has switched to a safe-mode diagnosis. Please contact the Azmera team if you need full AI support in production.";
          } else if (code === "SPECIALIST_KEY_ERROR") {
            friendlyDiagnosis = "Specialist Diagnosis Not Configured";
            friendlySolution =
              "The specialist plant-disease service (Plant.id) is not fully configured for this environment. The Azmera AI advisor is running in safe mode. Please contact the platform administrator to configure the correct API keys.";
          } else if (code === "SPECIALIST_RATE_LIMITED") {
            friendlyDiagnosis = "Specialist Service Temporarily Over Capacity";
            friendlySolution =
              "The specialist plant-disease service has reached its free-tier limit. You can retry in a few minutes or upgrade the API plan for continuous real-time diagnoses. The current result is a safe-mode demonstration.";
          } else if (result.isRateLimited) {
            friendlyDiagnosis = "AI Service Temporarily Busy";
            friendlySolution =
              "Our AI translation service is temporarily at maximum capacity. Please wait a minute and try again, or contact the Azmera team about upgrading to a higher-capacity key. In the meantime, use traditional scouting and local expertise.";
          }

          // Surface only a short, friendly error line to the inline alert
          setError(friendlyDiagnosis);
          setIsSafeModeResult(true); // Always true if AI service failed
          setDiagnosisResult({
            diagnosis: friendlyDiagnosis,
            solution: friendlySolution,
          });

          const toastDescription =
            code === "SPECIALIST_RATE_LIMITED" || result.isRateLimited
              ? "Real-time AI hit a temporary usage limit. We have switched to safe-mode diagnosis. Please try again shortly."
              : "Real-time AI is not fully available in this environment. The current result is a safe-mode demonstration.";

          toast({
            title: t('ai.safe_mode_active') || "Safe Mode Active",
            description: toastDescription,
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('AI Diagnosis Unexpected Error:', err);
        setError(`Failed to analyze image: ${err instanceof Error ? err.message : String(err)}`);
        toast({
          title: "Unexpected Error",
          description: `Failed to analyze image: ${err instanceof Error ? err.message : String(err)}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start p-1">
      <Card className="bg-white/80 dark:bg-black/40 backdrop-blur-md border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t('ai.upload_image') || 'Upload Crop Image'}
          </CardTitle>
          <CardDescription>
            {t('ai.upload_image_desc') || 'Upload an image of the affected crop for AI-powered diagnosis.'}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('ai.response_language')}</label>
                <Select value={responseLanguage} onValueChange={(value: 'en' | 'am' | 'om' | 'ti' | 'so') => setResponseLanguage(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                    <SelectItem value="om">Afaan Oromoo (Oromo)</SelectItem>
                    <SelectItem value="ti">ትግርኛ (Tigrinya)</SelectItem>
                    <SelectItem value="so">Soomaali (Somali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="imageUpload" className="sr-only">Crop Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                      />
                    </FormControl>
                    <label htmlFor="imageUpload" className={`mt-1 flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${imagePreview ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : 'border-muted-foreground/25 hover:border-green-500 hover:bg-green-50/20 dark:hover:bg-green-900/10'}`}>
                      {imagePreview ? (
                        <div className="relative w-full h-full p-2">
                          <Image src={imagePreview} alt="Crop preview" fill className="object-contain rounded-lg" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-white font-medium flex items-center gap-2">
                              <UploadCloud className="h-5 w-5" /> Change Image
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 space-y-4">
                          <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                            <UploadCloud className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-foreground">Click to upload</p>
                            <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-muted-foreground/70">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-12 text-lg" disabled={isLoading || !imagePreview}>
                {isLoading ? (
                  <>
                    <ScanLine className="mr-2 h-5 w-5 animate-pulse" /> {t('ai.analyzing') || "Analyzing Crop..."}
                  </>
                ) : (
                  <>
                    {t('ai.get_diagnosis') || "Diagnose Disease"} <Bot className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="bg-white/80 dark:bg-black/40 backdrop-blur-md border-none shadow-xl min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            <Sparkles className="h-6 w-6 text-amber-500" />
            {t('ai.diagnosis_solution') || 'AI Diagnosis & Solution'}
          </CardTitle>
          <CardDescription>{t('ai.results_appear') || 'Results from the AI analysis will appear here.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-8 py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                  <ScanLine className="h-16 w-16 text-green-600 animate-bounce" />
                </div>
                <div className="space-y-2 text-center max-w-xs">
                  <p className="text-lg font-medium text-green-700 dark:text-green-400">Scanning leaf patterns...</p>
                  <Skeleton className="h-2 w-full bg-green-200 dark:bg-green-900/50" />
                  <Skeleton className="h-2 w-2/3 mx-auto bg-green-200 dark:bg-green-900/50" />
                </div>
              </div>
            </div>
          )}

          {error && !diagnosisResult && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('common.error') || 'Error'}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {diagnosisResult && isSafeModeResult && !isLoading && (
            <div className="mb-4">
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 animate-pulse">
                {t('ai.safe_mode_active') || "Safe Mode Active"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {responseLanguage === 'am' ? "የእውነተኛ ጊዜ AI ሥራ የሚበዛበት ነው፤ የአካባቢ ምርመራን በመጠቀም ላይ።" : "Real-time AI is busy; using local diagnosis logic."}
              </p>
            </div>
          )}

          {diagnosisResult && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                <h3 className="font-semibold text-lg text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('ai.diagnosis_label') || 'Detected Issue'}
                </h3>
                <p className="text-lg font-medium text-foreground">{diagnosisResult.diagnosis}</p>
              </div>

              <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <h3 className="font-semibold text-lg text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5" />
                  {t('ai.solution_label') || 'Recommended Solution'}
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {diagnosisResult.solution}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-green-200 hover:bg-green-50 text-green-700">
                  Save to History
                </Button>
                <Button variant="outline" className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700">
                  Find Treatment
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && !diagnosisResult && (
            <div className="text-center py-12 space-y-4">
              <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium">AI Agronomist Ready</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                  Upload a clear photo of your crop to identify pests or diseases instantly.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
