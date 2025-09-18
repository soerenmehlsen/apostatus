import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="space-y-6 px-6 py-4">
      <h1 className="text-2xl font-bold">Create New Stocktake Session</h1>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold py-4">
          Drag and drop your CSV files here
        </h2>
        <p className="text-lg font-medium">
          You can upload multiple files at once. Each file should contain stock
          data for a specific location.
        </p>
        <p className="text-lg font-medium">data for a specific location.</p>
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4 mt-4" />
      </div>

      <Progress value={33} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="font-medium">Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>stock_data_location_6.csv</TableCell>
                  <TableCell>JSN</TableCell>
                  <TableCell>6123</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>stock_data_location_8.csv</TableCell>
                  <TableCell>JSN</TableCell>
                  <TableCell>8123</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>stock_data_location_9.csv</TableCell>
                  <TableCell>JSN</TableCell>
                  <TableCell>C789</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
