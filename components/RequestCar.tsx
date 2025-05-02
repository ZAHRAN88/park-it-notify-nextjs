
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CarFront } from "lucide-react";
import { useValet } from "@/context/ValetContext";
import { toast } from "@/components/ui/use-toast";

const RequestCar: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const { requestCar, getTicketByNumber } = useValet();

  const handleRequestCar = () => {
    if (!ticketNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket number.",
        variant: "destructive",
      });
      return;
    }

    const ticket = getTicketByNumber(ticketNumber.trim());
    if (!ticket) {
      toast({
        title: "Error",
        description: "Invalid ticket number. Please check and try again.",
        variant: "destructive", 
      });
      return;
    }

    requestCar(ticketNumber.trim());
    setTicketNumber("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CarFront className="mr-2" /> Request Car
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ticketNumber">Ticket Number</Label>
            <Input
              id="ticketNumber"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Enter ticket number"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRequestCar}
          disabled={!ticketNumber.trim()}
          className="w-full"
        >
          Request Car
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RequestCar;
