import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold flex items-center">
            <CarFront className="mr-2" /> Valet Parking System
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Welcome to the Valet Parking System</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Entrance Dashboard Card */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-2xl">Request a Car</CardTitle>
              <CardDescription className="text-blue-100">For users to request a car</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Request a car with a QR code
                </li>
               
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/api/request" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Request Your Car</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-2xl">Garage Entrance</CardTitle>
              <CardDescription className="text-blue-100">For garage staff to manage tickets</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Generate parking tickets with QR codes
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Process car retrieval requests
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Update payment status
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Print parking ticket receipts
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/entrance" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Access Entrance Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Valet Dashboard Card */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <CardTitle className="text-2xl">Valet Dashboard</CardTitle>
              <CardDescription className="text-slate-300">For valet staff to retrieve cars</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Receive car retrieval notifications
                </li>
                <li className="flex items-center">
                  <span className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Accept and process requests
                </li>
                <li className="flex items-center">
                  <span className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Mark requests as completed
                </li>
                <li className="flex items-center">
                  <span className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">✓</span>
                  Access ticket information
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/valet" className="w-full">
                <Button className="w-full bg-slate-700 hover:bg-slate-800">Access Valet Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 p-4 border-t mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600">© {new Date().getFullYear()} Valet Parking System</p>
          <div className="mt-2 md:mt-0 flex space-x-4">
            <Link href="/embed/docs" className="text-blue-600 hover:underline text-sm">
              Embedding Documentation
            </Link>
           
            <a href="#" className="text-gray-600 hover:underline text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:underline text-sm">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
