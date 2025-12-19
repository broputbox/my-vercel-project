import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWebsiteBuilder } from '@/contexts/WebsiteBuilderContext';
import { toast } from 'sonner';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  ArrowLeft, 
  Globe, 
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

const Publish = () => {
  const navigate = useNavigate();
  const { websiteData, resetWebsiteData } = useWebsiteBuilder();
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Generate a mock URL based on business name
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const websiteUrl = `https://${slugify(websiteData.businessName || 'my-business')}.adswift.site`;

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    setIsPublished(true);
    toast.success('Website published successfully!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleStartNew = () => {
    resetWebsiteData();
    navigate('/website-builder');
  };

  if (!websiteData.businessName) {
    navigate('/website-builder');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/website-builder/generate')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Preview
          </Button>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white text-center">
            {isPublished ? (
              <>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Your Website is Live!</h1>
                <p className="opacity-90">Leads will now flow directly to your dashboard</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Ready to Publish</h1>
                <p className="opacity-90">Your website is ready to go live</p>
              </>
            )}
          </div>

          <CardContent className="p-8">
            {/* Website URL */}
            <div className="mb-8">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Your Website URL
              </label>
              <div className="flex gap-2">
                <Input 
                  value={websiteUrl} 
                  readOnly 
                  className="font-mono text-lg h-12"
                />
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleCopyLink}>
                  <Copy className="h-5 w-5" />
                </Button>
                {isPublished && (
                  <Button size="icon" className="h-12 w-12" onClick={() => window.open(websiteUrl, '_blank')}>
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {!isPublished ? (
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>Publishing...</>
                  ) : (
                    <>
                      <Globe className="mr-2 h-5 w-5" />
                      Publish Now
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg"
                  onClick={() => navigate('/')}
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Lead Dashboard
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 h-14 text-lg"
                onClick={handleStartNew}
              >
                Create Another Website
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Zap, title: 'Instant Updates', desc: 'Changes go live immediately' },
                { icon: Shield, title: 'SSL Secured', desc: 'HTTPS encryption included' },
                { icon: BarChart3, title: 'Lead Tracking', desc: 'Connected to your dashboard' },
              ].map((feature, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-muted/50">
                  <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-0 shadow-lg bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Lead Capture Active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your website's contact form is automatically connected to your lead dashboard. 
                All submissions will appear in real-time under the Leads section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Publish;
