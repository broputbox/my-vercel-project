import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWebsiteBuilder } from '@/contexts/WebsiteBuilderContext';
import { Loader2, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import BaseTemplate from '@/components/website-builder/templates/BaseTemplate';

const heroImages: Record<string, string> = {
  construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80',
  roofing: 'https://images.unsplash.com/photo-1632759145954-1e5c6d1eb8d0?w=1920&q=80',
  'real-estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
  dentist: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
  general: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
};

const GenerateWebsite = () => {
  const navigate = useNavigate();
  const { websiteData, setIsGenerated, isGenerated } = useWebsiteBuilder();
  const [isGenerating, setIsGenerating] = useState(!isGenerated);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(isGenerated);

  useEffect(() => {
    if (!websiteData.selectedTemplate || !websiteData.businessName) {
      navigate('/website-builder');
      return;
    }

    if (!isGenerated) {
      // Simulate generation process
      const steps = [
        'Analyzing your business...',
        'Generating content...',
        'Applying template...',
        'Setting up lead capture...',
        'Finalizing website...',
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps.length) * 100);
        
        if (currentStep >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            setShowPreview(true);
            setIsGenerated(true);
          }, 500);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [websiteData, navigate, isGenerated, setIsGenerated]);

  const heroImage = heroImages[websiteData.selectedTemplate || 'general'];

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div 
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
            />
            <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Building Your Website
          </h2>
          <p className="text-muted-foreground mb-6">
            AI is creating your professional website...
          </p>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Banner */}
      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <Check className="h-5 w-5" />
          <span className="font-medium">
            Your website is now live and connected to your lead dashboard!
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/website-builder/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={() => navigate('/website-builder/publish')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Publish Website
            </Button>
          </div>
        </div>
      </div>

      {/* Website Preview */}
      {showPreview && (
        <div className="border-8 border-muted rounded-lg mx-4 my-4 overflow-hidden shadow-2xl">
          <BaseTemplate 
            data={websiteData} 
            heroImage={heroImage}
            heroGradient={websiteData.primaryColor}
          />
        </div>
      )}
    </div>
  );
};

export default GenerateWebsite;
