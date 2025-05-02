import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CarFront, CheckCircle, AlertCircle } from "lucide-react";

const ApiCarRequest: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>("");

  const handleRequestCar = async () => {
    if (!ticketNumber.trim()) {
      setRequestStatus('error');
      setMessage("Please enter a ticket number.");
      return;
    }

    setLoading(true);
    setRequestStatus('idle');
    setMessage("");

    try {
      const response = await fetch('https://park-it-notify-go.vercel.app/api/request-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber: ticketNumber.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request car');
      }

      setRequestStatus('success');
      setMessage(data.message || `Your request for car #${ticketNumber} has been sent to the valet.`);
      setTicketNumber("");
      
      console.log('Car requested:', data);
    } catch (error) {
      console.error('Error requesting car:', error);
      setRequestStatus('error');
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CarFront className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Valet Car Request</CardTitle>
            <CardDescription>Using external API integration</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticketNumber">Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  placeholder="Enter your ticket number"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              
              {requestStatus !== 'idle' && (
                <div className={`p-3 rounded-md ${
                  requestStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-start">
                    {requestStatus === 'success' ? (
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
              disabled={loading || !ticketNumber.trim()}
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

export default ApiCarRequest; 