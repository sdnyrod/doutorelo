import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import AdminMarketplace from "./pages/AdminMarketplace";
import Clarity from "./pages/Clarity";
import ComponentShowcase from "./pages/ComponentShowcase";
import Consultations from "./pages/Consultations";
import Connections from "./pages/Connections";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import Memory from "./pages/Memory";
import NationalHealthDirectory from "./pages/NationalHealthDirectory";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Professionals from "./pages/Professionals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/app" component={Dashboard} />
      <Route path="/preparar-consulta" component={Clarity} />
      <Route path="/clareza" component={Clarity} />
      <Route path="/memoria" component={Memory} />
      <Route path="/consultas" component={Consultations} />
      <Route path="/conexoes" component={Connections} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/loja" component={Marketplace} />
      <Route path="/diretorio-nacional" component={NationalHealthDirectory} />
      <Route path="/profissionais/:professionalId" component={ProfessionalDetail} />
      <Route path="/profissionais" component={Professionals} />
      <Route path="/componentes" component={ComponentShowcase} />
      <Route path="/admin/marketplace" component={AdminMarketplace} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors closeButton position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
