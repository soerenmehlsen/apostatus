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
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});
    const [checkedProducts, setCheckedProducts] = useState<Set<string>>(new Set());

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

  // Update count for a specific product
    const updateProductCount = (productId: string, change: number) => {
        setProductCounts(prev => ({
            ...prev,
            [productId]: Math.max(0, (prev[productId] || 0) + change)
        }));
    };

       // Toggle check status for a product
    const toggleProductCheck = (productId: string) => {
        setCheckedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

   // Filter products based on search term and current location
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter locations to only show selected ones
  const availableLocations = mockLocations.filter(loc => 
    selectedLocations.includes(loc.id)
  );

  // Calculate progress
  const totalProducts = filteredProducts.length;
  const checkedCount = filteredProducts.filter(product => checkedProducts.has(product.id)).length;
  const progressPercentage = totalProducts > 0 ? (checkedCount / totalProducts) * 100 : 0;
  const isAllChecked = checkedCount === totalProducts && totalProducts > 0;

  return (
    <div className="space-y-6 py-4">
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
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                key={product.id}
                className={checkedProducts.has(product.id) ? "bg-primary/20" : ""}
                >
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-center">{product.qty}</TableCell>
                   <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 transition-all duration-150 active:scale-80"
                                                onClick={() => updateProductCount(product.id, -1)}
                                                disabled={checkedProducts.has(product.id)}
                                            >
                                                −
                                            </Button>
                                            <span className="w-8 text-center font-medium">
                                                {productCounts[product.id] || 0}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 transition-all duration-150 active:scale-80"
                                                onClick={() => updateProductCount(product.id, 1)}
                                                disabled={checkedProducts.has(product.id)}
                                            >
                                                +
                                            </Button>
                                        </div>
                    </TableCell>
                  <TableCell>
                    <Button
                    className="w-20" 
                    size="sm" 
                     variant={checkedProducts.has(product.id) ? "default" : "outline"}
                      onClick={() => toggleProductCheck(product.id)}
                    >
                      {checkedProducts.has(product.id) ? "Checked" : "Check"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">{checkedCount}/{totalProducts} Left</p>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => alert('Stocktake completed!')}
              disabled={!isAllChecked}
            >
              Complete Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}