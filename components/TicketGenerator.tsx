import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Ticket } from "lucide-react";
import { useValet, Ticket as TicketType } from "@/context/ValetContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TicketGenerator: React.FC = () => {
  const [price, setPrice] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [generatedTicket, setGeneratedTicket] = useState<TicketType | null>(null);
  const { generateTicket } = useValet();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTicket = async () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0 || !ticketType) {
      return;
    }

    try {
      setIsGenerating(true);
      const newTicket = await generateTicket(parseFloat(price), ticketType, instructions);
      setGeneratedTicket(newTicket);
      setPrice("");
      setInstructions("");
      setTicketType("");
    } catch (error) {
      console.error("Error generating ticket:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!generatedTicket) return;
    
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
    const formattedDate = generatedTicket.issueDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Format time for receipt header
    const formattedTime = generatedTicket.issueDate.toLocaleTimeString('en-US', {
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
            <title>Receipt ${generatedTicket.ticketNumber}</title>
            <style>
              img{
                width: 100%;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 8px;
                width: 80mm;
                margin: auto;
                padding: 0;
                margin-top:-1mm;
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
                font-size: 8px;
                margin: 5mm 0;
                text-align: center;
              }
              .price {
                font-size: 18px;
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
                width: 35mm;
                height: 35mm;
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
                font-size: 8px;
                color: #000;
                margin: 3mm 0;
              }
              .logo {
                margin-bottom: 20mm;
                opacity: 0.6;
                max-width: 100%;
                height: 4mm;
                position: relative;
                left: 23mm;
                z-index: -1;
             
              }
              .logo img {
               width: 40mm;
              }
              @media print {
                body { width: 80mm; }
              }
            </style>
          </head>
          <body>
          <div class="logo">
            <img src="./logo.jpg" alt="Logo" />
          </div>
            <div class="receipt">
              
              <div class="date-time">
                <div>Date: ${formattedDate}</div>
              <div>Time: ${formattedTime}</div>
              </div>
              
              <div class="company-name">The Best Valet</div>
              
              <div class="instructions">
                 لاستدعاء سيارتك يرجى اعطاء الكارت للكاشير او مسح الرمز بالاسفل
                حال تواجد أية شكوى لا بد أن تقدم قبل مغادرة السيارة الكراج. كما أننا غير مسؤولين عن الأغراض التي تترك داخل السيارة.
              </div>
              
              <div class="price">
                Price: ${generatedTicket.price.toFixed(2)} KD
              </div>
              
              <div class="info-text">
                Your car will be ready within 10 minutes
              </div>
              
              <div class="ticket-number">
                Ticket No&nbsp;&nbsp;&nbsp;${generatedTicket.ticketNumber.padStart(5, '0')}
              </div>
              
            
              
              <div class="arabic">
                خدمة صف السيارات ذا بيست فاليه
              </div>
              
             
              
              <div class="arabic">
                سيارتك ستكون جاهزة خلال 10 دقائق
              </div>
              
              <div class="qr-code">
                <div class="qr-placeholder"><img src="./yt.png" alt="QR Code" /></div>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="mr-2" /> Generate Parking Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticketType">Ticket Type</Label>
              <Select 
                value={ticketType} 
                onValueChange={setTicketType}
              >
                <SelectTrigger id="ticketType">
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GYM">GYM</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Mall">Mall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Parking Fee ($)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter parking fee"
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Special Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for the valet..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateTicket}
            disabled={isGenerating || !price || isNaN(parseFloat(price)) || parseFloat(price) <= 0 || !ticketType}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Ticket"}
          </Button>
        </CardFooter>
      </Card>

      {generatedTicket && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Ticket</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint} 
                  className="flex items-center"
                >
                  <Printer className="mr-1 h-4 w-4" /> Print
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ticket Preview */}
              <div className="print-ticket border rounded-md p-4 mx-auto bg-white">
                <div className="text-center mb-4 border-b pb-2">
                  <h2 className="text-xl font-bold">The Best Valet</h2>
                  <p className="text-sm text-gray-600">Valet Parking Ticket</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket No:</span>
                    <span className="font-bold">{generatedTicket.ticketNumber.padStart(5, '0')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-bold">{generatedTicket.ticketType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(generatedTicket.issueDate)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-bold">${generatedTicket.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={generatedTicket.isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {generatedTicket.isPaid ? "PAID" : "UNPAID"}
                    </span>
                  </div>
                </div>
                
                {generatedTicket.instructions && (
                  <div className="mt-3 pt-2 border-t">
                    <p className="text-sm text-gray-600">Instructions:</p>
                    <p className="text-sm">{generatedTicket.instructions}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-2 border-t text-center">
                  <div className="border border-dashed mx-auto p-3 w-36 h-36 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">QR Code</p>
                      <p className="text-xs text-gray-500">{generatedTicket.ticketNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center text-xs text-gray-500">
                  <p>Thank you for using our valet service</p>
                  <p className="mt-1">Present this ticket when retrieving your vehicle</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center text-sm text-gray-500 no-print">
              Two copies will be printed. One for customer, one for records.
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketGenerator;
