import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useValet } from "@/context/ValetContext";
import { Bell, Home, Ticket, List, Plus, Car, BellRing } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketGenerator from "@/components/TicketGenerator";
import RequestCar from "@/components/RequestCar";
import TicketDetails from "@/components/TicketDetails";
import TicketList from "@/components/TicketList";
import EntranceNotificationPanel from "@/components/EntranceNotificationPanel";

const EntranceDashboard: React.FC = () => {
  const { getPendingRequests } = useValet();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const pendingRequests = getPendingRequests();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Ticket className="mr-2" />
            <h1 className="text-xl font-bold">Entrance Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white hover:bg-primary/80 relative"
                onClick={() => document.getElementById('notifications-tab')?.click()}
                title="View Notifications"
              >
                <Bell className="h-5 w-5" />
                {pendingRequests.length > 0 && (
                  <span className="notification-badge animate-pulse">{pendingRequests.length}</span>
                )}
              </Button>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center">
                <Home className="h-4 w-4 mr-1" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {selectedTicket ? (
          <div className="max-w-lg mx-auto">
            <TicketDetails ticketNumber={selectedTicket} onClose={() => setSelectedTicket(null)} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue={pendingRequests.length > 0 ? "notifications" : "generate"} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="generate" className="flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Ticket
                </TabsTrigger>
                <TabsTrigger value="request" className="flex items-center justify-center">
                  <Car className="mr-2 h-4 w-4" />
                  Request Car
                </TabsTrigger>
                <TabsTrigger value="tickets" className="flex items-center justify-center">
                  <List className="mr-2 h-4 w-4" />
                  All Tickets
                </TabsTrigger>
                <TabsTrigger 
                  id="notifications-tab"
                  value="notifications" 
                  className="flex items-center justify-center"
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  Notifications
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="mt-6">
                <TicketGenerator />
              </TabsContent>
              
              <TabsContent value="request">
                <RequestCar />
              </TabsContent>
              
              <TabsContent value="tickets">
                <TicketList onSelectTicket={setSelectedTicket} />
              </TabsContent>
              
              <TabsContent value="notifications">
                <EntranceNotificationPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 p-4 border-t mt-auto">
        <div className="container mx-auto text-center text-gray-600">
          <p>© {new Date().getFullYear()} Valet Parking Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default EntranceDashboard;
