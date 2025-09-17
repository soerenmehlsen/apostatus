'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockLocations } from "@/lib/data";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewStocktake() {
const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
const [initials, setInitials] = useState('');
const router = useRouter();

const handleStartStocktake = () => {
    const params = new URLSearchParams({
      locations: selectedLocations.join(','),
      initials: initials
    });
    
    router.push(`/stocktake/stock-check?${params.toString()}`);
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <h1 className="text-2xl font-bold">New stocktake</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <Input placeholder="Enter your initials" 
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockLocations.map((location) => (
              <div key={location.id} className="text-center">
                <Button
                  variant={selectedLocations.includes(location.id) ? "default" : "outline"}
                  className="w-full h-20 flex flex-col"
                  onClick={() => {
                    if (selectedLocations.includes(location.id)) {
                      setSelectedLocations(prev => prev.filter(id => id !== location.id));
                    } else {
                      setSelectedLocations(prev => [...prev, location.id]);
                    }
                  }}
                >
                  <div className="text-lg font-bold">{location.id}</div>
                  <div className="text-xs">{location.name}</div>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          disabled={selectedLocations.length === 0 || !initials.trim()}
          onClick={handleStartStocktake}
        >
          Start Stocktake
        </Button>
      </div>
    </div>
  );
}