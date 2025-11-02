import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MyTradeJournal',
  description: 'Centralize and visualize your trading performance across multiple brokers. Track, analyze, and improve your trading journey with powerful analytics.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ThemeProvider>
        <div className="px-2 sm:px-6 lg:px-32">
          <SonnerToaster />
          <Toaster />
          <Navbar />
          <div className="mt-8 sm:mt-20 max-w-screen-xl mx-auto">
            {children}
          </div>
          <Footer />
        </div>
    </ThemeProvider>
  );
}
