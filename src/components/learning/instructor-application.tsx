'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  User, 
  FileText, 
  Award, 
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface InstructorApplicationProps {
  onSuccess?: () => void;
}

export function InstructorApplication({ onSuccess }: InstructorApplicationProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const { user } = useApp();

  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [isInstructor, setIsInstructor] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    expertiseAreas: [] as string[],
    experienceYears: '',
    educationBackground: '',
    certifications: '',
    portfolioUrl: '',
    sampleContentUrl: '',
    motivation: '',
    teachingPhilosophy: ''
  });

  const expertiseOptions = [
    'Agricultural Techniques',
    'Crop Production',
    'Livestock Management',
    'Soil Management',
    'Pest & Disease Control',
    'Irrigation Systems',
    'Organic Farming',
    'Precision Agriculture',
    'Agricultural Business',
    'Marketing & Sales',
    'Financial Management',
    'Cooperative Management',
    'Food Processing',
    'Post-Harvest Technology',
    'Agricultural Technology',
    'Sustainable Farming',
    'Climate-Smart Agriculture',
    'Agricultural Policy',
    'Rural Development',
    'Extension Services'
  ];

  useEffect(() => {
    if (user) {
      fetchApplicationStatus();
    }
  }, [user]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await fetch('/api/instructor/apply');
      const result = await response.json();

      if (response.ok) {
        setApplicationStatus(result.application);
        setIsInstructor(result.isInstructor);
        
        // Pre-fill form if there's an existing application
        if (result.application) {
          setFormData({
            bio: result.application.bio || '',
            expertiseAreas: result.application.expertise_areas || [],
            experienceYears: result.application.experience_years?.toString() || '',
            educationBackground: result.application.education_background || '',
            certifications: result.application.certifications || '',
            portfolioUrl: result.application.portfolio_url || '',
            sampleContentUrl: result.application.sample_content_url || '',
            motivation: result.application.motivation || '',
            teachingPhilosophy: result.application.teaching_philosophy || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch application status:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpertiseToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(area)
        ? prev.expertiseAreas.filter(a => a !== area)
        : [...prev.expertiseAreas, area]
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.bio.trim() || formData.bio.length < 100) {
      errors.push('Bio must be at least 100 characters');
    }

    if (formData.expertiseAreas.length === 0) {
      errors.push('Please select at least one area of expertise');
    }

    if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) {
      errors.push('Please enter valid years of experience');
    }

    if (!formData.educationBackground.trim()) {
      errors.push('Education background is required');
    }

    if (!formData.motivation.trim() || formData.motivation.length < 50) {
      errors.push('Motivation must be at least 50 characters');
    }

    if (formData.portfolioUrl && !isValidUrl(formData.portfolioUrl)) {
      errors.push('Please enter a valid portfolio URL');
    }

    if (formData.sampleContentUrl && !isValidUrl(formData.sampleContentUrl)) {
      errors.push('Please enter a valid sample content URL');
    }

    return errors;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0],
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/instructor/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: formData.bio,
          expertiseAreas: formData.expertiseAreas,
          experienceYears: parseInt(formData.experienceYears),
          educationBackground: formData.educationBackground,
          certifications: formData.certifications,
          portfolioUrl: formData.portfolioUrl || null,
          sampleContentUrl: formData.sampleContentUrl || null,
          motivation: formData.motivation,
          teachingPhilosophy: formData.teachingPhilosophy || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      toast({
        title: 'Success',
        description: result.message,
        variant: 'default'
      });

      // Refresh application status
      await fetchApplicationStatus();
      onSuccess?.();

    } catch (error: any) {
      console.error('Submit application error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'revision_required':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please log in to apply as an instructor.
        </AlertDescription>
      </Alert>
    );
  }

  if (user.verification_level !== 'verified') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You must complete account verification before applying to become an instructor.
          Please visit the verification page to upload required documents.
        </AlertDescription>
      </Alert>
    );
  }

  if (isInstructor) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Congratulations! You are already an approved instructor. You can now create and manage courses.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Status */}
      {applicationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(applicationStatus.application_status)}
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(applicationStatus.application_status)}>
                  {applicationStatus.application_status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Applied: {new Date(applicationStatus.applied_at).toLocaleDateString()}
                </span>
              </div>

              {applicationStatus.review_notes && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Review Notes:</strong> {applicationStatus.review_notes}
                  </AlertDescription>
                </Alert>
              )}

              {applicationStatus.application_status === 'pending' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your application is under review. We typically respond within 3-5 business days.
                  </AlertDescription>
                </Alert>
              )}

              {applicationStatus.application_status === 'revision_required' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please review the feedback above and resubmit your application with the requested changes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {(!applicationStatus || applicationStatus.application_status === 'revision_required' || applicationStatus.application_status === 'rejected') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Tell us about yourself and your background in agriculture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Describe your professional background, experience, and what makes you qualified to teach..."
                  rows={5}
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/100 characters minimum
                </div>
              </div>

              <div>
                <Label htmlFor="experienceYears">Years of Experience *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  placeholder="e.g., 5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="educationBackground">Education Background *</Label>
                <Textarea
                  id="educationBackground"
                  value={formData.educationBackground}
                  onChange={(e) => handleInputChange('educationBackground', e.target.value)}
                  placeholder="Describe your educational qualifications, degrees, certifications..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="certifications">Professional Certifications (Optional)</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="List any relevant professional certifications, licenses, or credentials..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expertise Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Areas of Expertise
              </CardTitle>
              <CardDescription>
                Select the agricultural topics you're qualified to teach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {expertiseOptions.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.expertiseAreas.includes(area)}
                      onCheckedChange={() => handleExpertiseToggle(area)}
                    />
                    <Label htmlFor={area} className="text-sm">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Selected: {formData.expertiseAreas.length} areas
              </div>
            </CardContent>
          </Card>

          {/* Portfolio & Samples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Portfolio & Samples
              </CardTitle>
              <CardDescription>
                Showcase your work and teaching materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div>
                <Label htmlFor="sampleContentUrl">Sample Content URL (Optional)</Label>
                <Input
                  id="sampleContentUrl"
                  type="url"
                  value={formData.sampleContentUrl}
                  onChange={(e) => handleInputChange('sampleContentUrl', e.target.value)}
                  placeholder="https://sample-lesson.com or video link"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Link to a sample lesson, video, or teaching material
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Philosophy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teaching Approach
              </CardTitle>
              <CardDescription>
                Share your motivation and teaching philosophy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motivation">Why do you want to teach? *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  placeholder="Explain your motivation for becoming an instructor on our platform..."
                  rows={4}
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.motivation.length}/50 characters minimum
                </div>
              </div>

              <div>
                <Label htmlFor="teachingPhilosophy">Teaching Philosophy (Optional)</Label>
                <Textarea
                  id="teachingPhilosophy"
                  value={formData.teachingPhilosophy}
                  onChange={(e) => handleInputChange('teachingPhilosophy', e.target.value)}
                  placeholder="Describe your teaching approach, methods, and beliefs about education..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'Submitting...' : 
               applicationStatus ? 'Resubmit Application' : 'Submit Application'}
            </Button>
          </div>
        </form>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <div className="font-medium">Application Review</div>
                <div className="text-muted-foreground">Our team reviews your application within 3-5 business days</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">2</div>
              <div>
                <div className="font-medium">Approval & Setup</div>
                <div className="text-muted-foreground">Once approved, you can create your instructor profile and start building courses</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">3</div>
              <div>
                <div className="font-medium">Course Creation</div>
                <div className="text-muted-foreground">Create engaging courses with lessons, quizzes, and interactive content</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">4</div>
              <div>
                <div className="font-medium">Start Teaching</div>
                <div className="text-muted-foreground">Publish your courses and start earning from your expertise</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}