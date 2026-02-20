import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardView } from "@/views/DashboardView";
import { FacilitiesView } from "@/views/FacilitiesView";
import { WorkersView } from "@/views/WorkersView";
import { FaultsView } from "@/views/FaultsView";
import { ReportsView } from "@/views/ReportsView";
import { StatsView } from "@/views/StatsView";
import { CalendarView } from "@/views/CalendarView";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'facilities':
        return <FacilitiesView />;
      case 'workers':
        return <WorkersView />;
      case 'faults':
        return <FaultsView />;
      case 'reports':
        return <ReportsView />;
      case 'stats':
        return <StatsView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <DashboardView />;
    }
  };

  const handleCalendarClick = () => {
    setActiveTab('calendar');
  };

  const handleReportsClick = () => {
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCalendarClick={handleCalendarClick} 
        onReportsClick={handleReportsClick} 
      />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6">
          {renderView()}
        </main>
      </div>
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
