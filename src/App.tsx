import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Platforms from "./pages/Platforms";
import ForBusiness from "./pages/ForBusiness";
import ForCreators from "./pages/ForCreators";
import About from "./pages/About";
import GrowthGoals from "./pages/GrowthGoals";
import GrowthGoalDetail from "./pages/GrowthGoalDetail";
import AdminGrowth from "./pages/AdminGrowth";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
import AddFunds from "./pages/AddFunds";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import WalletSuccess from "./pages/WalletSuccess";
import WalletCancel from "./pages/WalletCancel";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/for-business" element={<ForBusiness />} />
            <Route path="/for-creators" element={<ForCreators />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/goals"
              element={
                <RequireAuth>
                  <GrowthGoals />
                </RequireAuth>
              }
            />
            <Route
              path="/goals/:id"
              element={
                <RequireAuth>
                  <GrowthGoalDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/growth"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminGrowth />
                </RequireAuth>
              }
            />
            {/*
              The delivery catalogue is an internal tool, not a storefront:
              nothing public links to it and visitors never see a price list.
            */}
            <Route
              path="/services"
              element={
                <RequireAuth>
                  <Services />
                </RequireAuth>
              }
            />
            <Route
              path="/services/:id"
              element={
                <RequireAuth>
                  <ServiceDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/order"
              element={
                <RequireAuth fallbackPath="/register">
                  <Order />
                </RequireAuth>
              }
            />
            <Route
              path="/add-funds"
              element={
                <RequireAuth>
                  <AddFunds />
                </RequireAuth>
              }
            />
            <Route
              path="/wallet/success"
              element={
                <RequireAuth>
                  <WalletSuccess />
                </RequireAuth>
              }
            />
            <Route
              path="/wallet/cancel"
              element={
                <RequireAuth>
                  <WalletCancel />
                </RequireAuth>
              }
            />
            <Route
              path="/tickets"
              element={
                <RequireAuth>
                  <Tickets />
                </RequireAuth>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <RequireAuth>
                  <TicketDetail />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
