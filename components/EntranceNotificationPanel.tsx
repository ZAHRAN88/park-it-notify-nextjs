import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useValet, CarRequest } from "@/context/ValetContext";
import {  CarFront, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TicketCache {
  [key: string]: string;
}

const EntranceNotificationPanel: React.FC = () => {
  const { state } = useValet();
  const pendingRequests = state.carRequests.filter(req => req.status === 'pending');
  const acceptedRequests = state.carRequests.filter(req => req.status === 'accepted');
  const [ticketCache, setTicketCache] = useState<TicketCache>({});

  // Fetch ticket numbers for all requests on mount and when requests change
  useEffect(() => {
    const fetchTicketNumbers = async () => {
      const allRequests = [...pendingRequests, ...acceptedRequests];
      const ticketIdsToFetch = allRequests
        .filter(req => !ticketCache[req.ticketId])
        .map(req => req.ticketId);
      
      if (ticketIdsToFetch.length === 0) return;
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number')
        .in('id', ticketIdsToFetch);
      
      if (error) {
        console.error('Error fetching ticket numbers:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const newCache = { ...ticketCache };
        data.forEach((ticket: { id: string | number; ticket_number: string; }) => {
          newCache[ticket.id] = ticket.ticket_number;
        });
        setTicketCache(newCache);
      }
    };
    
    fetchTicketNumbers();
  }, [pendingRequests, acceptedRequests, ticketCache]);

  const getTicketNumberFromRequest = (request: CarRequest) => {
    // First check our cache
    if (ticketCache[request.ticketId]) {
      return ticketCache[request.ticketId];
    }
    
    // Fallback to state (this might return Unknown)
    const ticket = state.tickets.find(t => t.id === request.ticketId);
    return ticket ? ticket.ticketNumber : 'Unknown';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Request Notifications</CardTitle>
        <CardDescription>
          View status of current car retrieval requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <CarFront className="h-6 w-6 text-gray-400" />
            </div>
            <p>No active car requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-amber-600 flex items-center">
                  <span className="bg-amber-100 text-amber-600 p-1 rounded mr-2">
                    <Clock className="h-4 w-4" />
                  </span>
                  Waiting for Valet
                </h3>
                <div className="divide-y">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            Ticket #{getTicketNumberFromRequest(request)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested at {formatTime(request.requestTime)}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {acceptedRequests.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-green-600 flex items-center">
                  <span className="bg-green-100 text-green-600 p-1 rounded mr-2">
                    <Check className="h-4 w-4" />
                  </span>
                  Cars Being Retrieved
                </h3>
                <div className="divide-y">
                  {acceptedRequests.map((request) => (
                    <div key={request.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            Ticket #{getTicketNumberFromRequest(request)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Accepted at {formatTime(request.requestTime)}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          In Progress
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntranceNotificationPanel; 