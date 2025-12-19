import { WebsiteData } from '@/contexts/WebsiteBuilderContext';
import LeadCaptureForm from '../LeadCaptureForm';
import { Phone, Mail, MapPin, Check } from 'lucide-react';

interface BaseTemplateProps {
  data: WebsiteData;
  heroImage: string;
  heroGradient: string;
}

const BaseTemplate = ({ data, heroImage, heroGradient }: BaseTemplateProps) => {
  const { businessName, description, location, phone, email, services, primaryColor, brandingStyle } = data;

  const getBrandingClasses = () => {
    switch (brandingStyle) {
      case 'bold':
        return {
          heading: 'text-5xl md:text-7xl font-black',
          container: 'rounded-none',
          shadow: 'shadow-2xl',
        };
      case 'minimal':
        return {
          heading: 'text-4xl md:text-5xl font-light tracking-tight',
          container: 'rounded-3xl',
          shadow: 'shadow-sm',
        };
      default: // modern
        return {
          heading: 'text-4xl md:text-6xl font-bold',
          container: 'rounded-2xl',
          shadow: 'shadow-xl',
        };
    }
  };

  const styles = getBrandingClasses();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] flex items-center"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}88), url(${heroImage}) center/cover`
        }}
      >
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl text-white">
            <h1 className={`${styles.heading} mb-6`}>
              {businessName}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              {description || `Professional services in ${location}`}
            </p>
            <a 
              href="#contact"
              className={`inline-block px-8 py-4 bg-white text-gray-900 font-semibold ${styles.container} hover:scale-105 transition-transform`}
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.length > 0 ? services.map((service, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 ${styles.container} ${styles.shadow} hover:-translate-y-1 transition-transform`}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Check className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500">
                No services listed
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose {businessName}?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We're committed to providing exceptional service to our clients in {location} and surrounding areas. 
              With years of experience and a dedication to quality, we ensure every project exceeds expectations.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {['Quality Work', 'Fast Response', 'Fair Pricing'].map((item, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-300 mb-8">
                Ready to get started? Fill out the form and we'll get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="font-medium">{phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="font-medium">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="font-medium">{location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`bg-white text-gray-900 p-8 ${styles.container}`}>
              <h3 className="text-xl font-semibold mb-6">Request a Quote</h3>
              <LeadCaptureForm primaryColor={primaryColor} businessName={businessName} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 text-gray-400 text-center">
        <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BaseTemplate;
