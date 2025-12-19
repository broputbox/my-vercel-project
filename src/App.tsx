import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebsiteBuilderProvider } from "@/contexts/WebsiteBuilderContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Auth from "./pages/Auth";
import Overview from "./pages/Overview";
import LeadsEnhanced from "./pages/LeadsEnhanced";
import Automations from "./pages/Automations";
import CRM from "./pages/CRM";
import SettingsEnhanced from "./pages/SettingsEnhanced";
import NotFound from "./pages/NotFound";

// Website Builder Pages
import WebsiteBuilderHome from "./pages/WebsiteBuilder/Home";
import Questionnaire from "./pages/WebsiteBuilder/Questionnaire";
import TemplateSelector from "./pages/WebsiteBuilder/TemplateSelector";
import GenerateWebsite from "./pages/WebsiteBuilder/GenerateWebsite";
import Publish from "./pages/WebsiteBuilder/Publish";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WebsiteBuilderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Website Builder Routes (public) */}
              <Route path="/website-builder" element={<WebsiteBuilderHome />} />
              <Route path="/website-builder/questionnaire" element={<Questionnaire />} />
              <Route path="/website-builder/templates" element={<TemplateSelector />} />
              <Route path="/website-builder/generate" element={<GenerateWebsite />} />
              <Route path="/website-builder/publish" element={<Publish />} />
              
              {/* Dashboard Routes (protected) */}
              <Route path="/" element={<DashboardLayout><Overview /></DashboardLayout>} />
              <Route path="/leads" element={<DashboardLayout><LeadsEnhanced /></DashboardLayout>} />
              <Route path="/automations" element={<DashboardLayout><Automations /></DashboardLayout>} />
              <Route path="/crm" element={<DashboardLayout><CRM /></DashboardLayout>} />
              <Route path="/settings" element={<DashboardLayout><SettingsEnhanced /></DashboardLayout>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WebsiteBuilderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
