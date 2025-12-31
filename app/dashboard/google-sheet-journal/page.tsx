"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  BarChart3,
  Users,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  Grid3x3,
  PieChart,
  FileSpreadsheet,
  Copy,
  Settings,
  LineChart,
} from "lucide-react";

export default function GoogleSheetJournalPage() {
  const googleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1HOe_Rzu91IKjBKJIMy983qw2BkH1rh0vK-bmsnAh85w/edit?usp=sharing";

  const sheetFeatures = [
    {
      id: "daily-pnl",
      title: "Clients Daily PNL",
      icon: Calendar,
      description:
        "Track daily profit and loss for all your clients with comprehensive metrics",
      features: [
        "Daily PNL tracking by date",
        "Cumulative P&L calculation",
        "Drawdown (DD) calculation",
        "Multi-client support with separate columns",
        "Color-coded profit/loss indicators",
        "Month and day filtering",
        "Total summary across all clients",
      ],
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      id: "overall-dashboard",
      title: "Overall Dashboard",
      icon: BarChart3,
      description:
        "Comprehensive overview with heatmap visualization and performance metrics",
      features: [
        "Win/Loss ratio tracking",
        "Average profit on winning days",
        "Average loss on losing days",
        "Maximum profit and loss records",
        "Monthly calendar heatmap view",
        "Returns by day of week analysis",
        "Total PNL summary with date range",
        "Visual color-coded performance indicators",
      ],
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      borderColor: "border-green-500/20",
    },
  ];

  const keyBenefits = [
    {
      title: "Multi-Client Management",
      description:
        "Track multiple clients or trading strategies in one unified system",
      icon: Users,
    },
    {
      title: "Real-time Analytics",
      description:
        "Get instant insights into your trading performance with automated calculations",
      icon: TrendingUp,
    },
    {
      title: "Visual Heatmaps",
      description:
        "See your trading patterns at a glance with color-coded calendar views",
      icon: Grid3x3,
    },
    {
      title: "Comprehensive Metrics",
      description: "Track win ratios, drawdowns, average profits, and more",
      icon: PieChart,
    },
  ];

  const howToSteps = [
    {
      step: "1",
      title: "Make a Copy",
      description:
        'Click the "Open Google Sheet" button and make a copy of the template to your Google Drive.',
      icon: Copy,
    },
    {
      step: "2",
      title: "Customize for Your Needs",
      description:
        "Add your client names, update capital amounts, and customize the sheets according to your trading setup.",
      icon: Settings,
    },
    {
      step: "3",
      title: "Start Tracking",
      description:
        'Begin entering your daily PNL data in the "Clients Daily PNL" sheet. The dashboard will automatically calculate metrics.',
      icon: FileSpreadsheet,
    },
    {
      step: "4",
      title: "Analyze Performance",
      description:
        "Use the Overall Dashboard to analyze your trading patterns and make data-driven improvements.",
      icon: LineChart,
    },
  ];

  return (
    <div className="flex-1 bg-background p-3 sm:p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sheet Journal
                </h1>
                <p className="text-muted-foreground">
                  Google Sheets template for tracking trading performance
                </p>
              </div>
            </div>
            <Button asChild size="default" className="gap-2">
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Google Sheet
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {keyBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {benefit.title}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sheet Features */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Sheet Features
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sheetFeatures.map((sheet) => {
              const Icon = sheet.icon;
              return (
                <Card
                  key={sheet.id}
                  className={`bg-card border-2 ${sheet.borderColor} hover:shadow-lg transition-shadow`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${sheet.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{sheet.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {sheet.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sheet.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howToSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {step.step}
                        </span>
                      </div>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Ready to Get Started?
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
              Access the full Google Sheets template and start tracking your
              trading performance today. The template is fully customizable and
              ready to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="default" className="gap-2">
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Google Sheet Template
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
