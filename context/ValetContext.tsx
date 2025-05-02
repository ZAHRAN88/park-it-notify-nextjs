"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Ticket = {
  id: string;
  ticketNumber: string;
  price: number;
  issueDate: Date;
  companyName: string;
  isPaid: boolean;
  instructions?: string;
  ticketType?: string;
};

export type CarRequest = {
  id: string;
  ticketId: string;
  status: 'pending' | 'accepted' | 'completed';
  requestTime: Date;
};

type ValetState = {
  tickets: Ticket[];
  carRequests: CarRequest[];
};

type ValetAction = 
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'SET_CAR_REQUESTS'; payload: CarRequest[] }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'REQUEST_CAR'; payload: CarRequest }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: 'pending' | 'accepted' | 'completed' } }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { ticketId: string; isPaid: boolean } };

const initialState: ValetState = {
  tickets: [],
  carRequests: [],
};

function valetReducer(state: ValetState, action: ValetAction): ValetState {
  switch (action.type) {
    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload,
      };
    case 'SET_CAR_REQUESTS':
      return {
        ...state,
        carRequests: action.payload,
      };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [...state.tickets, action.payload],
      };
    case 'REQUEST_CAR':
      return {
        ...state,
        carRequests: [...state.carRequests, action.payload],
      };
    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        carRequests: state.carRequests.map(request => 
          request.id === action.payload.id 
            ? { ...request, status: action.payload.status } 
            : request
        ),
      };
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        tickets: state.tickets.map(ticket => 
          ticket.id === action.payload.ticketId 
            ? { ...ticket, isPaid: action.payload.isPaid } 
            : ticket
        ),
      };
    default:
      return state;
  }
}

type ValetContextType = {
  state: ValetState;
  generateTicket: (price: number, ticketType: string, instructions?: string) => Promise<Ticket>;
  requestCar: (ticketNumber: string) => void;
  updateRequestStatus: (requestId: string, status: 'pending' | 'accepted' | 'completed') => void;
  updatePaymentStatus: (ticketId: string, isPaid: boolean) => void;
  getTicketByNumber: (ticketNumber: string) => Ticket | undefined;
  getRequestByTicketId: (ticketId: string) => CarRequest | undefined;
  getPendingRequests: () => CarRequest[];
};

const ValetContext = createContext<ValetContextType | undefined>(undefined);

export const ValetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(valetReducer, initialState);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*');
      
      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
      } else if (ticketsData) {
        // Convert data to our format
        const formattedTickets: Ticket[] = ticketsData.map((ticket: { id: any; ticket_number: any; price: any; issue_date: string | number | Date; company_name: any; is_paid: any; instructions: any; ticket_type: any; }) => ({
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          price: Number(ticket.price),
          issueDate: new Date(ticket.issue_date),
          companyName: ticket.company_name,
          isPaid: ticket.is_paid,
          instructions: ticket.instructions,
          ticketType: ticket.ticket_type,
        }));
        dispatch({ type: 'SET_TICKETS', payload: formattedTickets });
      }
      
      // Fetch car requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('car_requests')
        .select('*');
      
      if (requestsError) {
        console.error('Error fetching car requests:', requestsError);
      } else if (requestsData) {
        // Convert data to our format
        const formattedRequests: CarRequest[] = requestsData.map((request: { id: any; ticket_id: any; status: any; request_time: string | number | Date; }) => ({
          id: request.id,
          ticketId: request.ticket_id,
          status: request.status as 'pending' | 'accepted' | 'completed',
          requestTime: new Date(request.request_time),
        }));
        dispatch({ type: 'SET_CAR_REQUESTS', payload: formattedRequests });
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to changes in car_requests table
    const carRequestsChannel = supabase
      .channel('car_requests_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'car_requests'
        }, 
        async (payload) => {
          console.log('Car request change received:', payload);
          
          // Reload all car requests to keep things simple
          const { data, error } = await supabase
            .from('car_requests')
            .select('*');
          
          if (error) {
            console.error('Error refreshing car requests:', error);
            return;
          }
          
          if (data) {
            const formattedRequests: CarRequest[] = data.map(request => ({
              id: request.id,
              ticketId: request.ticket_id,
              status: request.status as 'pending' | 'accepted' | 'completed',
              requestTime: new Date(request.request_time),
            }));
            
            dispatch({ type: 'SET_CAR_REQUESTS', payload: formattedRequests });
            
            // Show notification for status changes
            if (payload.eventType === 'UPDATE') {
              const newData = payload.new;
              const ticketInfo = state.tickets.find(t => t.id === newData.ticket_id);
              
              if (newData.status === 'accepted') {
                toast({
                  title: "Car Request Accepted",
                  description: ticketInfo 
                    ? `Your car with ticket #${ticketInfo.ticketNumber} is being retrieved.`
                    : "Your car request has been accepted and is being retrieved.",
                });
              } else if (newData.status === 'completed') {
                toast({
                  title: "Car Ready",
                  description: ticketInfo 
                    ? `Your car with ticket #${ticketInfo.ticketNumber} is ready for pickup.`
                    : "Your car is ready for pickup.",
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(carRequestsChannel);
    };
  }, [state.tickets]);

  const generateTicket = async (price: number, ticketType: string, instructions?: string): Promise<Ticket> => {
    const ticketNumber = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ticket_number: ticketNumber,
        price,
        company_name: "Valet Parking Pro",
        is_paid: false,
        instructions,
        ticket_type: ticketType
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
    
    // Convert to our format
    const newTicket: Ticket = {
      id: data.id,
      ticketNumber: data.ticket_number,
      price: Number(data.price),
      issueDate: new Date(data.issue_date),
      companyName: data.company_name,
      isPaid: data.is_paid,
      instructions: data.instructions,
      ticketType: data.ticket_type
    };
    
    dispatch({ type: 'ADD_TICKET', payload: newTicket });
    return newTicket;
  };

  const requestCar = async (ticketNumber: string) => {
    const ticket = state.tickets.find(t => t.ticketNumber === ticketNumber);
    
    if (!ticket) {
      toast({
        title: "Error",
        description: `Ticket number ${ticketNumber} not found.`,
        variant: "destructive",
      });
      return;
    }

    const existingRequest = state.carRequests.find(
      req => req.ticketId === ticket.id && ['pending', 'accepted'].includes(req.status)
    );

    if (existingRequest) {
      toast({
        title: "Request already exists",
        description: `This car is already ${existingRequest.status === 'pending' ? 'requested' : 'being retrieved'}.`,
        variant: "destructive",
      });
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('car_requests')
      .insert({
        ticket_id: ticket.id,
        status: 'pending' as 'pending' | 'accepted' | 'completed'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating car request:', error);
      toast({
        title: "Error",
        description: "Failed to create car request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert to our format
    const newRequest: CarRequest = {
      id: data.id,
      ticketId: data.ticket_id,
      status: data.status as 'pending' | 'accepted' | 'completed',
      requestTime: new Date(data.request_time)
    };

    dispatch({ type: 'REQUEST_CAR', payload: newRequest });
    
    toast({
      title: "Car Requested",
      description: `Your request for car #${ticketNumber} has been sent to the valet.`,
      variant: "default",
    });
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'completed') => {
    // Update in Supabase
    const { error } = await supabase
      .from('car_requests')
      .update({ status })
      .eq('id', requestId);
      
    if (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'UPDATE_REQUEST_STATUS', payload: { id: requestId, status } });
    
    if (status === 'accepted') {
      toast({
        title: "Request Accepted",
        description: "The valet is retrieving your car.",
      });
    } else if (status === 'completed') {
      toast({
        title: "Request Completed",
        description: "The car has been delivered.",
      });
    }
  };

  const updatePaymentStatus = async (ticketId: string, isPaid: boolean) => {
    // Update in Supabase
    const { error } = await supabase
      .from('tickets')
      .update({ is_paid: isPaid })
      .eq('id', ticketId);
      
    if (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { ticketId, isPaid } });
    
    toast({
      title: isPaid ? "Payment Completed" : "Payment Updated",
      description: isPaid ? "The ticket has been marked as paid." : "The payment status has been updated.",
    });
  };

  const getTicketByNumber = (ticketNumber: string) => {
    return state.tickets.find(t => t.ticketNumber === ticketNumber);
  };

  const getRequestByTicketId = (ticketId: string) => {
    return state.carRequests.find(r => r.ticketId === ticketId && r.status !== 'completed');
  };

  const getPendingRequests = () => {
    return state.carRequests.filter(r => r.status === 'pending');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading valet data...</div>;
  }

  return (
    <ValetContext.Provider value={{
      state,
      generateTicket,
      requestCar,
      updateRequestStatus,
      updatePaymentStatus,
      getTicketByNumber,
      getRequestByTicketId,
      getPendingRequests
    }}>
      {children}
    </ValetContext.Provider>
  );
};

export const useValet = (): ValetContextType => {
  const context = useContext(ValetContext);
  if (!context) {
    throw new Error('useValet must be used within a ValetProvider');
  }
  return context;
};
