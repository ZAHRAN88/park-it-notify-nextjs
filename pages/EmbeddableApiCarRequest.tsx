/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CarFront, CheckCircle, AlertCircle } from "lucide-react";

const EmbeddableApiCarRequest: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>("");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [color, setColor] = useState<string>('blue');
  const [hideTitle, setHideTitle] = useState<boolean>(false);

  // Parse URL parameters for customization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('theme') === 'dark') setTheme('dark');
    if (params.get('color')) setColor(params.get('color') as string);
    if (params.get('hideTitle') === 'true') setHideTitle(true);
  }, []);

  // Send a message to the parent window
  const notifyParent = (type: string, data: any) => {
    // Only send if we're in an iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type, ...data }, '*');
    }
  };

  const handleRequestCar = async () => {
    if (!ticketNumber.trim()) {
      setRequestStatus('error');
      setMessage("Please enter a ticket number.");
      notifyParent('error', { message: "Please enter a ticket number." });
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
      notifyParent('carRequested', { 
        ticketNumber: ticketNumber.trim(),
        message: data.message || `Your request for car #${ticketNumber} has been sent to the valet.`
      });
      setTicketNumber("");

    } catch (error) {
      console.error('Error requesting car:', error);
      setRequestStatus('error');
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.";
      setMessage(errorMessage);
      notifyParent('error', { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const themeClass = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  const iconColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`p-4 rounded shadow-sm w-full max-w-xs mx-auto ${themeClass}`}>
      {!hideTitle && (
        <div className="text-center mb-4">
          <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${iconColorClass}`}>
            <CarFront className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Request Your Car</h2>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Enter your ticket number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            disabled={loading}
            className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
          />
        </div>
        
        {requestStatus !== 'idle' && (
          <div className={`p-2 rounded-md text-xs ${
            requestStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          } ${theme === 'dark' ? '!bg-opacity-20' : ''}`}>
            <div className="flex items-start">
              {requestStatus === 'success' ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
              )}
              <p>{message}</p>
            </div>
          </div>
        )}
        
        <Button 
          className="w-full" 
          onClick={handleRequestCar} 
          disabled={loading || !ticketNumber.trim()}
          size="sm"
        >
          {loading ? 'Requesting...' : 'Request Car'}
        </Button>
      </div>
    </div>
  );
};

export default EmbeddableApiCarRequest; 