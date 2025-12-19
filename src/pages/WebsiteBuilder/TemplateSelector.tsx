import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWebsiteBuilder } from '@/contexts/WebsiteBuilderContext';
import { ArrowLeft, Check, Wrench, Home, Hammer, Building2, Smile, Dumbbell } from 'lucide-react';

const templates = [
  {
    id: 'construction',
    name: 'Construction Pro',
    description: 'Perfect for builders, contractors, and construction companies',
    icon: Hammer,
    gradient: 'from-amber-500 to-orange-600',
    niches: ['construction', 'general'],
  },
  {
    id: 'plumber',
    name: 'Plumber Plus',
    description: 'Designed for plumbing and home service professionals',
    icon: Wrench,
    gradient: 'from-blue-500 to-cyan-600',
    niches: ['plumber', 'general'],
  },
  {
    id: 'roofing',
    name: 'Roofing Expert',
    description: 'Showcase your roofing services with stunning visuals',
    icon: Home,
    gradient: 'from-slate-600 to-slate-800',
    niches: ['roofing', 'construction', 'general'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate Elite',
    description: 'Elegant design for real estate agents and brokers',
    icon: Building2,
    gradient: 'from-emerald-500 to-teal-600',
    niches: ['real-estate', 'general'],
  },
  {
    id: 'dentist',
    name: 'Dental Care',
    description: 'Professional and trustworthy look for dental practices',
    icon: Smile,
    gradient: 'from-sky-400 to-blue-500',
    niches: ['dentist', 'general'],
  },
  {
    id: 'general',
    name: 'Business Classic',
    description: 'Versatile template that works for any business type',
    icon: Dumbbell,
    gradient: 'from-purple-500 to-indigo-600',
    niches: ['personal-trainer', 'general'],
  },
];

const TemplateSelector = () => {
  const navigate = useNavigate();
  const { websiteData, updateWebsiteData, setCurrentStep } = useWebsiteBuilder();

  const handleSelectTemplate = (templateId: string) => {
    updateWebsiteData({ selectedTemplate: templateId });
  };

  const handleContinue = () => {
    if (websiteData.selectedTemplate) {
      navigate('/website-builder/generate');
    }
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/website-builder/questionnaire');
  };

  // Sort templates to show matching niche first
  const sortedTemplates = [...templates].sort((a, b) => {
    const aMatches = a.niches.includes(websiteData.niche);
    const bMatches = b.niches.includes(websiteData.niche);
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Choose Your Template
            </h1>
            <p className="text-muted-foreground">
              Select the design that best fits your business. Each template will be customized with your information.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedTemplates.map((template) => {
              const isRecommended = template.niches.includes(websiteData.niche);
              const isSelected = websiteData.selectedTemplate === template.id;

              return (
                <Card
                  key={template.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    isSelected
                      ? 'ring-4 ring-primary shadow-xl'
                      : 'hover:shadow-xl border-0 shadow-lg'
                  }`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {isRecommended && (
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full z-10">
                      Recommended
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground p-1 rounded-full z-10">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Template Preview */}
                  <div className={`h-40 bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
                    <template.icon className="h-16 w-16 text-white/80" />
                  </div>
                  
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questions
            </Button>
            <Button 
              size="lg" 
              onClick={handleContinue}
              disabled={!websiteData.selectedTemplate}
              className="px-8"
            >
              Generate My Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
