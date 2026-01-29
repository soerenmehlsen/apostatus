"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { mockLocations } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
  expectedQty: number;
}

interface StockCheckData {
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  checkedBy: string;
  status: string;
}

interface StockCheckClientProps {
  initialProducts?: Product[];
  initialLocations?: { id: string; name: string }[]; 
}

export default function StockCheckClient({
  initialProducts = [],
}: StockCheckClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [initials, setInitials] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState("");
  const [localChecks, setLocalChecks] = useState<Map<string, StockCheckData>>(new Map());
  const [isCompleting, setIsCompleting] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(!initialProducts.length);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const locationParam = searchParams.get("locations");
    const initialsParam = searchParams.get("initials");
    const sessionIdParam = searchParams.get("sessionId");

    if (locationParam) {
      const locations = locationParam.split(",");
      setSelectedLocations(locations);
      setCurrentLocation(locations[0]);
    }
    if (initialsParam) {
      setInitials(initialsParam);
    }
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);

 const fetchStocktakeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();
      if (sessionId) {
        searchParams.append('sessionId', sessionId);
      }
      const response = await fetch(`/api/stockcheck/stockdata?${searchParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data.products || []);
      } else {
        toast.error("Failed to load stocktake data", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error fetching stocktake data:", error);
      toast.error("Failed to load data", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!initialProducts.length && sessionId) {
      fetchStocktakeData();
    }
  }, [sessionId, initialProducts.length, fetchStocktakeData]);

  const updateProductCount = (productId: string, change: number) => {
    setProductCounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const setToExpectedQty = (productId: string, expectedQty: number) => {
    setProductCounts((prev) => ({
      ...prev,
      [productId]: expectedQty,
    }));
  };

  const toggleProductCheck = (productId: string) => {
    setCheckedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleProductCheck = async (productId: string) => {
    const currentCount = productCounts[productId] || 0;
    const product = filteredProducts.find((p) => p.id === productId);

    if (!product) return;

    const expectedQty = product.expectedQty || 0;
    const variance = currentCount - expectedQty;

    const checkData: StockCheckData = {
      productId,
      sessionId,
      expectedQty,
      countedQty: currentCount,
      variance,
      checkedBy: initials,
      status: "checked",
    };

    setLocalChecks((prev) => new Map(prev).set(productId, checkData));
    toggleProductCheck(productId);
  };

  const completeStocktake = async () => {
    if (!isAllChecked || localChecks.size === 0) return;

    setIsCompleting(true);

    const loadingToast = toast.loading("Completing stocktake...");

    try {
      const checksArray = Array.from(localChecks.values());

      const stockCheckResponse = await fetch("/api/stockcheck/saveproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checksArray),
      });

      if (!stockCheckResponse.ok) {
        throw new Error("Failed to save stock checks");
      }

      const response = await fetch("/api/stockcheck/completecheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          completedBy: initials,
        }),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Stocktake completed!", {
          description: `All ${checksArray.length} checks have been saved successfully`,
        });
        router.push("/dashboard");
      } else {
        throw new Error("Failed to complete stocktake");
      }
    } catch (error) {
      console.error("Error completing stocktake:", error);
      toast.error("Failed to complete stocktake", {
        description: "Please try again or check your connection",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      product.location === currentLocation
  );

  const availableLocations = mockLocations.filter((loc) =>
    selectedLocations.includes(loc.id)
  );

  const totalProducts = filteredProducts.length;
  const checkedCount = filteredProducts.filter((product) =>
    checkedProducts.has(product.id)
  ).length;
  const progressPercentage =
    totalProducts > 0 ? (checkedCount / totalProducts) * 100 : 0;
  const isAllChecked = checkedCount === totalProducts && totalProducts > 0;

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading stocktake data...</div>
        </div>
      </div>
    );
  }

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
            <Select value={currentLocation} onValueChange={setCurrentLocation}>
              <SelectTrigger className="w-42">
                <SelectValue placeholder="Location" />
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

          <ScrollArea className="h-[50vh] md:h-[60vh] lg:h-[65vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={
                      checkedProducts.has(product.id) ? "bg-primary/20" : ""
                    }
                  >
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-center">
                      {product.expectedQty}
                    </TableCell>
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
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 transition-all duration-150 active:scale-80"
                        onClick={() =>
                          setToExpectedQty(product.id, product.expectedQty)
                        }
                        disabled={checkedProducts.has(product.id)}
                      >
                        =
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button
                        className="w-20"
                        size="sm"
                        variant={
                          checkedProducts.has(product.id)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleProductCheck(product.id)}
                      >
                        {checkedProducts.has(product.id) ? "Checked" : "Check"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-6">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {checkedCount}/{totalProducts} Left
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={completeStocktake} disabled={!isAllChecked || isCompleting}>
              Complete Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}