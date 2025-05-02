import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmbedDocs: React.FC = () => {
  const baseUrl = window.location.origin;
  const iframeUrl = `${baseUrl}/embed/request`;
  const apiIframeUrl = `${baseUrl}/embed/api-request`;
  
  const iframeCode = `<iframe 
  src="${iframeUrl}" 
  width="300" 
  height="300" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`;

  const apiIframeCode = `<iframe 
  src="${apiIframeUrl}" 
  width="300" 
  height="300" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`;

  const responseHandler = `<script>
  // Listen for messages from the iframe
  window.addEventListener('message', function(event) {
    // Make sure the message is from your iframe
    if (event.origin !== '${baseUrl}') return;
    
    // Handle the message
    if (event.data.type === 'carRequested') {
      // Car was successfully requested
      console.log('Car requested:', event.data.ticketNumber);
      // Do something on your site like showing a success message
    }
  });
</script>`;

  const apiCodeExample = `// Request a car using fetch
fetch('https://park-it-notify-go.vercel.app/api/request-car', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ticketNumber: '12345'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Car requested:', data);
})
.catch(error => {
  console.error('Error:', error);
});`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Embedding the Car Request Widget</CardTitle>
            <p className="text-gray-500 mt-2">
              Follow these instructions to add the car request widget to your website.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="database">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="database">Database Integration</TabsTrigger>
                <TabsTrigger value="api">API Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-6">
                <h3 className="text-lg font-medium">Option 1: Simple iFrame Embed</h3>
                <p>
                  The simplest way to add the car request widget to your website is by using an iframe.
                  Copy and paste the following code into your HTML:
                </p>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">{iframeCode}</pre>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div dangerouslySetInnerHTML={{ __html: iframeCode }} />
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Advanced Integration with Database</h3>
                  
                  <p>
                    For a more interactive experience, you can set up a message listener to receive
                    notifications when a car is requested:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">{responseHandler}</pre>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    This script listens for messages sent from the iframe when a car is requested,
                    allowing your website to respond accordingly.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="api" className="space-y-6">
                <h3 className="text-lg font-medium">Option 1: API iFrame Embed</h3>
                <p>
                  This version uses an external API endpoint instead of direct database access.
                  Copy and paste the following code into your HTML:
                </p>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">{apiIframeCode}</pre>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div dangerouslySetInnerHTML={{ __html: apiIframeCode }} />
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Option 2: Direct API Integration</h3>
                  
                  <p>
                    For complete control, you can integrate directly with our API endpoint:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">{apiCodeExample}</pre>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    This method allows you to build your own custom UI while using our backend service.
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-4">
                    <h4 className="font-medium text-amber-800 mb-2">API Response Format</h4>
                    <p className="text-sm text-amber-700">
                      The API returns a JSON response with the following structure:
                    </p>
                    <div className="bg-amber-100 p-2 rounded mt-2 text-xs font-mono text-amber-800">
                      {`{
  "success": true,
  "message": "Your car has been requested successfully",
  "data": {
    "ticketNumber": "12345",
    "requestId": "abc123",
    "timestamp": "2023-05-20T15:30:45Z"
  }
}`}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-2">Customization Options</h3>
              <p>
                You can customize the appearance of the widget by adding the following query parameters to the iframe URL:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><code className="bg-gray-100 px-1 rounded">theme=dark</code> - Use dark theme</li>
                <li><code className="bg-gray-100 px-1 rounded">color=blue</code> - Change primary color (options: blue, green, purple, red)</li>
                <li><code className="bg-gray-100 px-1 rounded">hideTitle=true</code> - Hide the widget title</li>
              </ul>
              
              <p className="text-sm text-gray-500 mt-4">
                Example: <code className="bg-gray-100 px-1 rounded">{iframeUrl}?theme=dark&color=purple</code>
              </p>
            </div>
            
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-2">Need Help?</h3>
              <p>
                If you need any assistance with embedding the widget or have questions about the API,
                please contact our support team at <a href="mailto:support@valetparkingpro.com" className="text-blue-600 hover:underline">support@valetparkingpro.com</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmbedDocs; 