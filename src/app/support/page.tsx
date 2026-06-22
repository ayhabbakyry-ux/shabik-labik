
"use client";

import { AIChat } from "@/components/support/AIChat";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";

export default function SupportPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background">
      <DesktopHeader />
      
      <main className="max-w-4xl mx-auto h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] flex flex-col justify-center">
        <div className="p-4 flex-1">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold font-headline">Smart Support Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by Generative AI for real-time troubleshooting.</p>
          </div>
          <AIChat />
        </div>
      </main>

      <Navbar />
    </div>
  );
}
