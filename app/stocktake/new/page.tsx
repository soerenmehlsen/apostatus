"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockLocations } from "@/lib/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


interface Location {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  uploadDate: string;
  location: string;
  productCount: number;
}

export default function NewStocktake() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [initials, setInitials] = useState("");
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch available locations and files
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/newstocktake');
        const data = await response.json();
        
        if (response.ok) {
          setLocations(data.locations || []);
          setUploadedFiles(data.files || []);
        } else {
          toast.error("Failed to load data", {
            description: data.error,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load data", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

   const handleStartStocktake = async () => {
    if (selectedLocations.length === 0 || !initials.trim()) {
      toast.error("Missing information", {
        description: "Please enter your initials and select at least one location",
      });
      return;
    }

     setIsCreating(true);

    try {
      // Create stocktake session
      const response = await fetch('/api/newsession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: initials,
          locations: selectedLocations,
          createdBy: initials,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const params = new URLSearchParams({
          sessionId: data.sessionId,
          locations: selectedLocations.join(","),
          initials: initials,
        });

        toast.success("Stocktake session created", {
          description: "Redirecting to stock check...",
        });

        router.push(`/stocktake/check?${params.toString()}`);
      } else {
        toast.error("Failed to create stocktake", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Error creating stocktake:', error);
      toast.error("Failed to create stocktake", {
        description: "Please try again later",
      });
    } finally {
      setIsCreating(false);
    }
  };
   
   // Get files count for selected locations
  const getSelectedLocationStats = () => {
    const selectedFiles = uploadedFiles.filter(file => 
      selectedLocations.includes(file.location)
    );
    const totalProducts = selectedFiles.reduce((sum, file) => sum + file.productCount, 0);
    return { files: selectedFiles.length, products: totalProducts };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-6 py-4">
        <h1 className="text-2xl font-bold">New stocktake</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading locations...</div>
        </div>
      </div>
    );
  }

  const stats = getSelectedLocationStats();

  return (
    <div className="space-y-6 px-6 py-4">
      <h1 className="text-2xl font-bold">New stocktake</h1>

      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <Input
            placeholder="Enter your initials"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            disabled={isCreating}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
          {locations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No locations available. Please upload CSV files first.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {locations.map((location) => {
               const locationFiles = uploadedFiles.filter(file => file.location === location.id);
              const productCount = locationFiles.reduce((sum, file) => sum + file.productCount, 0);
              
              return (
                <div key={location.id} className="text-center">
                  <Button
                    variant={
                      selectedLocations.includes(location.id)
                        ? "default"
                        : "outline"
                    }
                    className="w-full h-20 flex flex-col"
                    disabled={productCount === 0 || isCreating}
                    onClick={() => {
                      if (selectedLocations.includes(location.id)) {
                        setSelectedLocations((prev) =>
                          prev.filter((id) => id !== location.id)
                        );
                      } else {
                        setSelectedLocations((prev) => [...prev, location.id]);
                      }
                    }}
                  >
                    <div className="text-lg font-bold">{location.id}</div>
                    <div className="text-xs">{location.name}</div>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          disabled={selectedLocations.length === 0 || !initials.trim() || isCreating}
          onClick={handleStartStocktake}
        >
          Start Stocktake
        </Button>
      </div>
    </div>
  );
}
