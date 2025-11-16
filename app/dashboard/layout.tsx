import { ThemeProvider } from "@/context/theme-provider";
import { DataProvider } from "@/context/data-provider";
import { MockDataProvider } from "./components/mock-data-provider";
import { AuthProvider } from "@/context/auth-provider";
import { DashboardLayout } from "./components/dashboard-layout";
import Modals from "@/components/modals";
import { Toaster } from "@/components/ui/toaster";
import { RithmicSyncContextProvider } from "@/context/rithmic-sync-context";
import { RithmicSyncNotifications } from './components/import/rithmic/sync/rithmic-notifications'
import { TradovateSyncContextProvider } from "@/context/tradovate-sync-context";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { DashboardTooltipWrapper } from "./components/dashboard-tooltip-wrapper";
import { OnboardingTour } from "./components/onboarding-tour";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
      return (
        <DashboardTooltipWrapper>
          <ThemeProvider>
            <DataProvider>
              <AuthProvider>
                <MockDataProvider>
                  <RithmicSyncContextProvider>
                    <TradovateSyncContextProvider>
                      <RithmicSyncNotifications />
                      <div className="min-h-screen flex flex-col">
                            <SonnerToaster/>
                            <Toaster />
                            <OnboardingTour />
                            <DashboardLayout>
                              {children}
                            </DashboardLayout>
                            <Modals />
                      </div>
                    </TradovateSyncContextProvider>
                  </RithmicSyncContextProvider>
                </MockDataProvider>
              </AuthProvider>
            </DataProvider>
          </ThemeProvider>
        </DashboardTooltipWrapper>
      );
}