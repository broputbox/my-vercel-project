import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWebsiteBuilder } from '@/contexts/WebsiteBuilderContext';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const niches = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'construction', label: 'Construction' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'personal-trainer', label: 'Personal Trainer' },
  { value: 'general', label: 'General Business' },
];

const brandingStyles = [
  { value: 'modern', label: 'Modern', description: 'Clean lines, gradients, contemporary feel' },
  { value: 'bold', label: 'Bold', description: 'Strong colors, impactful typography' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, elegant, lots of whitespace' },
];

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#06B6D4', label: 'Cyan' },
];

const Questionnaire = () => {
  const navigate = useNavigate();
  const { websiteData, updateWebsiteData, currentStep, setCurrentStep } = useWebsiteBuilder();
  const [servicesInput, setServicesInput] = useState(websiteData.services.join(', '));

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep === 2) {
      updateWebsiteData({ services: servicesInput.split(',').map(s => s.trim()).filter(Boolean) });
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/website-builder/templates');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/website-builder');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return websiteData.businessName && websiteData.niche;
      case 2:
        return websiteData.description && servicesInput;
      case 3:
        return websiteData.brandingStyle && websiteData.primaryColor;
      case 4:
        return websiteData.phone && websiteData.email && websiteData.location;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "Tell us about your business"}
              {currentStep === 2 && "Describe your services"}
              {currentStep === 3 && "Choose your style"}
              {currentStep === 4 && "Contact information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Smith Plumbing Services"
                    value={websiteData.businessName}
                    onChange={(e) => updateWebsiteData({ businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Industry / Niche *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {niches.map((niche) => (
                      <button
                        key={niche.value}
                        onClick={() => updateWebsiteData({ niche: niche.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          websiteData.niche === niche.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">{niche.label}</span>
                        {websiteData.niche === niche.value && (
                          <Check className="h-4 w-4 float-right" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what your business does..."
                    rows={4}
                    value={websiteData.description}
                    onChange={(e) => updateWebsiteData({ description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services">Services Offered *</Label>
                  <Textarea
                    id="services"
                    placeholder="e.g., Emergency repairs, Water heater installation, Drain cleaning"
                    rows={3}
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Separate each service with a comma</p>
                </div>
              </>
            )}

            {/* Step 3: Branding */}
            {currentStep === 3 && (
              <>
                <div className="space-y-3">
                  <Label>Branding Style *</Label>
                  <RadioGroup
                    value={websiteData.brandingStyle}
                    onValueChange={(value) => updateWebsiteData({ brandingStyle: value as any })}
                  >
                    {brandingStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          websiteData.brandingStyle === style.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateWebsiteData({ brandingStyle: style.value as any })}
                      >
                        <RadioGroupItem value={style.value} id={style.value} />
                        <div>
                          <Label htmlFor={style.value} className="font-medium cursor-pointer">
                            {style.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{style.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label>Primary Color *</Label>
                  <div className="flex gap-3 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateWebsiteData({ primaryColor: color.value })}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          websiteData.primaryColor === color.value
                            ? 'ring-4 ring-offset-2 ring-primary scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Contact */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Business Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Los Angeles, CA"
                    value={websiteData.location}
                    onChange={(e) => updateWebsiteData({ location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={websiteData.phone}
                    onChange={(e) => updateWebsiteData({ phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@yourbusiness.com"
                    value={websiteData.email}
                    onChange={(e) => updateWebsiteData({ email: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                {currentStep === totalSteps ? 'Choose Template' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaire;
