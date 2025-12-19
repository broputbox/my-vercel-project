import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

const WEBHOOK_URL = 'https://dsgdvirakfmplmyktakz.supabase.co/functions/v1/webhook-leads/259e13ac-c9ea-45e1-b7da-d03c5c23d145';

interface LeadCaptureFormProps {
  primaryColor?: string;
  businessName?: string;
}

const LeadCaptureForm = ({ primaryColor = '#3B82F6', businessName = 'us' }: LeadCaptureFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'website_build',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
        <p className="text-gray-600">We'll get back to you shortly.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setIsSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Your Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="h-12"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="h-12"
        />
      </div>
      <div>
        <Input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="h-12"
        />
      </div>
      <div>
        <Textarea
          placeholder="How can we help you?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 text-lg"
        style={{ backgroundColor: primaryColor }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Request a Quote
          </>
        )}
      </Button>
    </form>
  );
};

export default LeadCaptureForm;
