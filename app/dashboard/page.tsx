import { Header } from "@/components/layout/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStocktakes } from "@/lib/data";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
       <div className="space-y-6 px-6 py-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button>
            Archive
          </Button>
          <Button>
            New Stocktake
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stocks need review</CardDescription>
            <CardTitle className="text-3xl">1</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stocktakes Completed</CardDescription>
            <CardTitle className="text-3xl">3 <span className="text-base">of 23</span></CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Stocktake</CardDescription>
            <CardTitle className="text-3xl">Maj 2026</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seneste Aktivitet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStocktakes.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.location}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === 'In Progress' ? 'secondary' :
                      item.status === 'Not confirmed' ? 'secondary' :
                      'default'
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
