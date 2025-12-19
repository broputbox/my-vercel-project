import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WebsiteData {
  businessName: string;
  description: string;
  location: string;
  brandingStyle: 'modern' | 'bold' | 'minimal';
  primaryColor: string;
  niche: string;
  phone: string;
  email: string;
  services: string[];
  heroHeadline: string;
  heroSubheadline: string;
  selectedTemplate: string | null;
}

interface WebsiteBuilderContextType {
  websiteData: WebsiteData;
  updateWebsiteData: (data: Partial<WebsiteData>) => void;
  resetWebsiteData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isGenerated: boolean;
  setIsGenerated: (generated: boolean) => void;
}

const defaultWebsiteData: WebsiteData = {
  businessName: '',
  description: '',
  location: '',
  brandingStyle: 'modern',
  primaryColor: '#3B82F6',
  niche: '',
  phone: '',
  email: '',
  services: [],
  heroHeadline: '',
  heroSubheadline: '',
  selectedTemplate: null,
};

const WebsiteBuilderContext = createContext<WebsiteBuilderContextType | undefined>(undefined);

export const WebsiteBuilderProvider = ({ children }: { children: ReactNode }) => {
  const [websiteData, setWebsiteData] = useState<WebsiteData>(defaultWebsiteData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerated, setIsGenerated] = useState(false);

  const updateWebsiteData = (data: Partial<WebsiteData>) => {
    setWebsiteData(prev => ({ ...prev, ...data }));
  };

  const resetWebsiteData = () => {
    setWebsiteData(defaultWebsiteData);
    setCurrentStep(1);
    setIsGenerated(false);
  };

  return (
    <WebsiteBuilderContext.Provider value={{
      websiteData,
      updateWebsiteData,
      resetWebsiteData,
      currentStep,
      setCurrentStep,
      isGenerated,
      setIsGenerated,
    }}>
      {children}
    </WebsiteBuilderContext.Provider>
  );
};

export const useWebsiteBuilder = () => {
  const context = useContext(WebsiteBuilderContext);
  if (!context) {
    throw new Error('useWebsiteBuilder must be used within WebsiteBuilderProvider');
  }
  return context;
};
