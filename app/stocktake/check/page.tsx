"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockLocations, mockProducts } from "@/lib/data";

export default function StockCheck() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [initials, setInitials] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');

    const searchParams = useSearchParams();
    const router = useRouter();

    // Get data from URL parameters
  useEffect(() => {
    const locationParam = searchParams.get('locations');
    const initialsParam = searchParams.get('initials');
    
    if (locationParam) {
      const locations = locationParam.split(',');
      setSelectedLocations(locations);
      setCurrentLocation(locations[0]); // Set first location as default
    }
    if (initialsParam) {
      setInitials(initialsParam);
    }
  }, [searchParams]);

   // Filter products based on search term and current location
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter locations to only show selected ones
  const availableLocations = mockLocations.filter(loc => 
    selectedLocations.includes(loc.id)
  );

  return (
    <div className="space-y-6 px-6 py-4">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Check</h1>
        <div className="text-sm text-muted-foreground">
          Checking as: <span className="font-medium">{initials}</span>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select 
            value={currentLocation}
            onValueChange={setCurrentLocation}
            >
              <SelectTrigger className="w-42">
                <SelectValue placeholder="Location"/>
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.id} - {loc.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.qty}</TableCell>
                  <TableCell>{product.count}</TableCell>
                  <TableCell>
                    <Badge variant={
                      product.status === 'OK' ? 'secondary' :
                      product.status === 'Restocked' ? 'default' :
                      product.status === 'Missing' ? 'destructive' :
                      'outline'
                    }>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Check</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Progress value={75} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">6/7 left</p>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => alert('Stocktake completed!')}
            >
              Complete Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}