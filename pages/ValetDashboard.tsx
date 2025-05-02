
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Ticket, useValet } from "@/context/ValetContext";
import { CarFront, Home, Search } from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";

const ValetDashboard: React.FC = () => {
  const { state, getTicketByNumber } = useValet();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const pendingRequests = state.carRequests.filter(req => req.status === 'pending');

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const tickets = state.tickets.filter(ticket => 
      ticket.ticketNumber.includes(searchQuery.trim())
    );

    if (tickets.length === 0) {
      toast({
        title: "No Results",
        description: "No tickets found matching your search.",
      });
    }

    setSearchResults(tickets);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check for new notifications
  useEffect(() => {
    if (pendingRequests.length > 0) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));

      if (Notification.permission === 'granted') {
        const latestRequest = pendingRequests[0];
        const ticket = getTicketByNumber(
          state.tickets.find(t => t.id === latestRequest.ticketId)?.ticketNumber || ''
        );
        
        if (ticket) {
          new Notification('New Car Request', {
            body: `Car with ticket #${ticket.ticketNumber} has been requested.`,
          });
        }
      }
    }
  }, [pendingRequests.length]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <CarFront className="mr-2" />
            <h1 className="text-xl font-bold">Valet Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {pendingRequests.length > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 animate-pulse bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {pendingRequests.length}
                </div>
              )}
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
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="notifications">
                Notifications
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="search">Search Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationPanel />
            </TabsContent>
            
            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Tickets</CardTitle>
                  <CardDescription>
                    Find ticket information by ticket number
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter ticket number"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                          }}
                        />
                      </div>
                      <Button onClick={handleSearch} className="flex items-center">
                        <Search className="h-4 w-4 mr-2" /> Search
                      </Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border rounded-md divide-y">
                        {searchResults.map(ticket => (
                          <div key={ticket.id} className="p-3">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">Ticket #{ticket.ticketNumber}</p>
                                <p className="text-sm text-gray-500">{formatDate(ticket.issueDate)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${ticket.price.toFixed(2)}</p>
                                <span 
                                  className={`text-xs px-2 py-1 rounded ${
                                    ticket.isPaid 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ticket.isPaid ? "PAID" : "UNPAID"}
                                </span>
                              </div>
                            </div>
                            {ticket.instructions && (
                              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {ticket.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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

export default ValetDashboard;
