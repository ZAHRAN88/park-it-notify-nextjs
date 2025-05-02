import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CarFront, CheckCircle, AlertCircle } from "lucide-react";

const UserCarRequest: React.FC = () => {
  const [ticketDigits, setTicketDigits] = useState<string[]>(["", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error' | 'exists'>('idle');
  const [message, setMessage] = useState<string>("");

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
    // Focus first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newTicketDigits = [...ticketDigits];
    // Take only the last character if multiple are pasted
    newTicketDigits[index] = value.slice(-1);
    setTicketDigits(newTicketDigits);

    // Auto-focus next input if value was entered
    if (value !== "" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !ticketDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow navigation
    if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle left arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted content is all digits
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.split("").slice(0, 5);
    const newTicketDigits = [...ticketDigits];
    
    digits.forEach((digit, index) => {
      if (index < 5) {
        newTicketDigits[index] = digit;
      }
    });
    
    setTicketDigits(newTicketDigits);
    
    // Focus appropriate input after pasting
    if (digits.length < 5) {
      inputRefs.current[digits.length]?.focus();
    } else {
      inputRefs.current[4]?.focus();
    }
  };

  const handleRequestCar = async () => {
    const ticketNumber = ticketDigits.join("");
    
    if (ticketNumber.length !== 5) {
      setRequestStatus('error');
      setMessage("Please enter a complete 5-digit ticket number.");
      return;
    }

    setLoading(true);
    setRequestStatus('idle');
    setMessage("");

    try {
      // First, find the ticket by number
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('ticket_number', ticketNumber)
        .single();

      if (ticketError || !ticketData) {
        setRequestStatus('error');
        setMessage("Invalid ticket number. Please check and try again.");
        setLoading(false);
        return;
      }

      // Check if there's already an active request for this ticket
      const { data: existingRequests } = await supabase
        .from('car_requests')
        .select('id, status')
        .eq('ticket_id', ticketData.id)
        .in('status', ['pending', 'accepted']);

      if (existingRequests && existingRequests.length > 0) {
        const status = existingRequests[0].status;
        setRequestStatus('exists');
        setMessage(
          status === 'pending' 
            ? "Your car has already been requested and is waiting for a valet." 
            : "Your car is currently being retrieved by the valet."
        );
        setLoading(false);
        return;
      }

      // Create a new car request
      const { error: insertError } = await supabase
        .from('car_requests')
        .insert({
          ticket_id: ticketData.id,
          status: 'pending'
        });

      if (insertError) {
        setRequestStatus('error');
        setMessage("Failed to create car request. Please try again or contact the valet service.");
        console.error('Error creating car request:', insertError);
      } else {
        setRequestStatus('success');
        setMessage(`Your request for car #${ticketNumber} has been sent to the valet.`);
        setTicketDigits(["", "", "", "", ""]);
        // Focus first input after successful submission
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Error requesting car:', err);
      setRequestStatus('error');
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const clearTicket = () => {
    setTicketDigits(["", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CarFront className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">The Best Valet Car Request</CardTitle>
            <CardDescription>Enter your ticket number to request your car</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticketNumber">5-Digit Ticket Number</Label>
                <div className="flex justify-between mt-1 gap-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg font-medium"
                      value={ticketDigits[index]}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={loading}
                      ref={(el) => { void(inputRefs.current[index] = el as HTMLInputElement); }}
                    />
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearTicket}
                    disabled={loading || ticketDigits.every(digit => digit === "")}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              {requestStatus !== 'idle' && (
                <div className={`p-3 rounded-md ${
                  requestStatus === 'success' ? 'bg-green-50 text-green-700' :
                  requestStatus === 'exists' ? 'bg-blue-50 text-blue-700' : 
                  'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-start">
                    {requestStatus === 'success' ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : requestStatus === 'exists' ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <p>{message}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleRequestCar} 
              disabled={loading || ticketDigits.some(digit => digit === "")}
            >
              {loading ? 'Requesting...' : 'Request My Car'}
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} Valet Parking Pro
        </p>
      </div>
    </div>
  );
};

export default UserCarRequest; 