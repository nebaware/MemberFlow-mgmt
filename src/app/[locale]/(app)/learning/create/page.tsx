
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
// Use the new Postgres-backed API instead of Firestore
import { PlusCircle, UploadCloud, CheckCircle, BookOpen } from 'lucide-react';
import { MAIN_CROP_CATEGORIES } from '@/lib/constants'; // Assuming these can be used as categories
import { RoleGuard } from '@/components/auth/role-guard';

const learningContentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  contentType: z.string().min(1, "Content type is required."),
  contentBody: z.string().min(50, "Content body must be at least 50 characters (or a valid URL for video)."),
  category: z.string().min(1, "Category is required."),
  language: z.string().min(1, "Language is required."),
  thumbnail: z.any().optional(),
});

type LearningContentFormValues = z.infer<typeof learningContentSchema>;

const contentTypes = ["Article", "Video (Link)", "Quiz (Coming Soon)"];
const languages = ["English", "Amharic", "Oromo", "Tigrinya", "Somali"];

export default function CreateLearningContentPage() {
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LearningContentFormValues>({
    resolver: zodResolver(learningContentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "",
      contentBody: "",
      category: "",
      language: "English",
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("thumbnail", event.target.files);
    } else {
      setThumbnailPreview(null);
      form.resetField("thumbnail");
    }
  };

  async function onSubmit(values: LearningContentFormValues) {
    setIsSubmitting(true);
    try {
      // POST to server API which will persist to Postgres when configured
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          contentType: values.contentType,
          contentBody: values.contentBody,
          category: values.category,
          language: values.language,
          thumbnail: thumbnailPreview || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit');
      const json = await res.json();
      toast({
        title: 'Content Submitted!',
        description: `"${json.title || values.title}" has been saved to Azmera.`,
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Submission failed',
        description: String((err as any)?.message || err),
      });
    }
    form.reset();
    setThumbnailPreview(null);
    setIsSubmitting(false);
  }

  return (
    <RoleGuard requiredRole="educator">
      <PageTitle
        title="Create Learning Content"
        description="Develop new courses, modules, or educational resources for the platform."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            New Educational Material
          </CardTitle>
          <CardDescription>
            Fill in the details below to create and publish your content.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Advanced Teff Cultivation Techniques" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl><Textarea placeholder="A brief summary of what this content covers." {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="contentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select content type" /></SelectTrigger></FormControl>
                      <SelectContent>{contentTypes.map(type => <SelectItem key={type} value={type} disabled={type.includes("Coming Soon")}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {MAIN_CROP_CATEGORIES.concat(["General Agriculture", "Agri-Tech", "Agri-Business"]).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                    <SelectContent>{languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contentBody" render={({ field }) => (
                <FormItem>
                  <FormLabel>{form.watch("contentType") === "Video (Link)" ? "Video URL" : "Content Body (Article Text)"}</FormLabel>
                  <FormControl>
                    {form.watch("contentType") === "Video (Link)" ?
                      <Input type="url" placeholder="https://youtube.com/your-video-id" {...field} /> :
                      <Textarea placeholder="Write your article content here..." {...field} rows={10} />
                    }
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="thumbnail" render={({ field }) => ( // field is not directly used here but required by FormField
                <FormItem>
                  <FormLabel>Thumbnail Image (Optional)</FormLabel>
                  <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="thumbnailUpload" /></FormControl>
                  <label htmlFor="thumbnailUpload" className="mt-1 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                    {thumbnailPreview ? <Image src={thumbnailPreview} alt="Thumbnail preview" width={150} height={150} className="max-h-full max-w-full object-contain rounded-md p-1" data-ai-hint="course thumbnail" /> : <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />}
                    <p className="text-sm text-muted-foreground">{thumbnailPreview ? "Change image" : "Click or drag to upload"}</p>
                  </label>
                  <FormMessage />
                </FormItem>
              )} />

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Content for Review"} <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </RoleGuard>
  );
}
