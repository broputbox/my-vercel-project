import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, FileText, Layout, Rocket } from 'lucide-react';

const WebsiteBuilderHome = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: FileText,
      title: 'Answer Questions',
      description: 'Tell us about your business, services, and style preferences',
    },
    {
      icon: Layout,
      title: 'Choose Template',
      description: 'Select from our premium templates designed for your industry',
    },
    {
      icon: Rocket,
      title: 'Launch & Connect',
      description: 'Your website goes live with leads flowing to your dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Website Builder
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Create Your Professional Website in Minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Answer a few questions, pick a template, and watch AI build your perfect business website — automatically connected to your lead dashboard.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate('/website-builder/questionnaire')}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Building Now
          </Button>
        </div>

        {/* 3-Step Process */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why Choose Our Builder?</h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              'AI-Generated Content',
              'Mobile Responsive',
              'Lead Capture Forms',
              'Instant Publishing',
            ].map((feature, i) => (
              <div key={i} className="bg-card border rounded-xl p-4 text-sm font-medium text-foreground">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilderHome;
