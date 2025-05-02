import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Printer, X } from "lucide-react";
import { useValet, Ticket, CarRequest } from "@/context/ValetContext";

interface TicketDetailsProps {
  ticketNumber: string;
  onClose: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticketNumber, onClose }) => {
  const { getTicketByNumber, updatePaymentStatus, getRequestByTicketId } = useValet();
  const [ticket, setTicket] = useState<Ticket | undefined>();
  const [request, setRequest] = useState<CarRequest | undefined>();
  
  useEffect(() => {
    const currentTicket = getTicketByNumber(ticketNumber);
    setTicket(currentTicket);
    
    if (currentTicket) {
      const currentRequest = getRequestByTicketId(currentTicket.id);
      setRequest(currentRequest);
    }
  }, [ticketNumber, getTicketByNumber, getRequestByTicketId]);

  const handleTogglePayment = () => {
    if (ticket) {
      updatePaymentStatus(ticket.id, !ticket.isPaid);
      setTicket({
        ...ticket,
        isPaid: !ticket.isPaid
      });
    }
  };

  const handlePrint = () => {
    if (!ticket) return;
    
    // Create a hidden iframe for receipt printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    
    document.body.appendChild(printFrame);
    
    // Format date for receipt header
    const formattedDate = ticket.issueDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Format time for receipt header
    const formattedTime = ticket.issueDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Setup print content - optimized for receipt printers (typically 80mm width)
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt ${ticket.ticketNumber}</title>
            <style>
            img{
              width: 100%;
             
            }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0;
                padding: 0;
              }
              .receipt {
                padding: 8mm 5mm;
                text-align: center;
              }
              .header {
                margin-bottom: 5mm;
              }
              .date-time {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8mm;
              }
              .company-name {
                font-size: 16px;
                font-weight: bold;
                margin: 5mm 0;
              }
              .instructions {
                font-size: 11px;
                margin: 5mm 0;
                text-align: center;
              }
              .price {
                font-size: 14px;
                font-weight: bold;
                margin: 5mm 0;
              }
              .info-text {
                font-size: 11px;
                margin: 3mm 0;
              }
              .ticket-number {
                font-size: 22px;
                font-weight: bold;
                margin: 8mm 0 5mm 0;
              }
              .qr-code {
                margin: auto;
                width: 25mm;
                height: 25mm;
              }
              .qr-code img {
                width: 100%;
                height: 100%;
              }
              .qr-placeholder {
                border: 1px solid #000;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .arabic {
                font-size: 10px;
                color: #555;
                margin: 3mm 0;
              }
              .logo {
                opacity: 0.6;
                max-width: 100%;
                
                height: 10mm;
              }
              @media print {
                body { width: 80mm; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="logo">
                <img src="./lloogo.png" alt="Logo" />
              </div>
              
              <div class="date-time">
               
              </div>
              
              <div class="company-name">The Best Valet</div>
              
              <div class="instructions">
                To recall your car, Please submit the card<br>
                to the cashier
              </div>
              
              <div class="price">
                Price: ${ticket.price.toFixed(2)}
              </div>
              
              <div class="info-text">
                Your car will be ready within 10 minutes
              </div>
              
              <div class="ticket-number">
                Ticket No&nbsp;&nbsp;&nbsp;${ticket.ticketNumber.padStart(5, '0')}
              </div>
               <div>Date: ${formattedDate}</div>
                <div>Time: ${formattedTime}</div>
              <div class="arabic">
                خدمة صف السيارات ذا بيست فالي
              </div>
              
              <div class="arabic">
                لاستدعاء سيارتك يرجى اعطاء الكارت للكاشير
              </div>
              
              <div class="arabic">
                سيارتك ستكون جاهزة خلال 10 دقائق
              </div>
              
              <div class="qr-code">
                <div class="qr-placeholder"><img src="./request.png" alt="QR Code" /></div>
              </div>
            </div>
          </body>
        </html>
      `);
      frameDoc.close();
      
      // Wait for content to load then print
      printFrame.onload = () => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        
        // Remove the iframe after printing is done or canceled
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    }
  };

  if (!ticket) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="relative pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="print-ticket border rounded-md p-4 mx-auto bg-white mb-4">
          <div className="text-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">{ticket.companyName}</h2>
            <p className="text-sm text-gray-600">Valet Parking Ticket</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket No:</span>
              <span className="font-bold">{ticket.ticketNumber}</span>
            </div>
            
            {ticket.ticketType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-bold">{ticket.ticketType}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(ticket.issueDate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Fee:</span>
              <span className="font-bold">${ticket.price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={ticket.isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {ticket.isPaid ? "PAID" : "UNPAID"}
              </span>
            </div>
          </div>
          
          {ticket.instructions && (
            <div className="mt-3 pt-2 border-t">
              <p className="text-sm text-gray-600">Instructions:</p>
              <p className="text-sm">{ticket.instructions}</p>
            </div>
          )}
          
          <div className="mt-4 pt-2 border-t text-center">
            <div className="border border-dashed mx-auto p-3 w-36 h-36 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-500">QR Code</p>
                <p className="text-xs text-gray-500">{ticket.ticketNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center text-xs text-gray-500">
            <p>Thank you for using our valet service</p>
            <p className="mt-1">Present this ticket when retrieving your vehicle</p>
          </div>
        </div>

        {/* Payment switch - only visible when not printing */}
        <div className="no-print space-y-4">
          <div className="flex items-center space-x-4 pb-4">
            <Switch 
              id="payment-status"
              checked={ticket.isPaid}
              onCheckedChange={handleTogglePayment}
            />
            <Label htmlFor="payment-status">Mark as Paid</Label>
          </div>

          {request && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-700">
                Car Request Status: {request.status === 'pending' ? 'Waiting for valet' : 'Being retrieved'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Requested at: {formatDate(request.requestTime)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between no-print">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="default" onClick={handlePrint} className="flex items-center">
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketDetails;
