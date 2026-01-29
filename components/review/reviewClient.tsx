"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CheckResult {
  id: string;
  article: string;
  name: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  value: number;
}

interface ReviewSession {
  id: string;
  date: string;
  location: string;
  locationId: string;
  status: string;
  name: string;
}

interface ReviewSummary {
  missingItems: number;
  totalValueVariance: number;
  totalDiscrepancies: number;
}

interface ReviewData {
  session: ReviewSession;
  summary: ReviewSummary;
  checkResults: CheckResult[];
}

interface ReviewClientProps {
  initialData?: ReviewData | null;
  sessionId?: string | null;
}

export default function ReviewClient({ initialData, sessionId }: ReviewClientProps) {
  const router = useRouter();

  const [reviewData, setReviewData] = useState<ReviewData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchReviewData = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = sessionId
        ? `/api/review?sessionId=${sessionId}`
        : '/api/review';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReviewData(data);
      } else {
        toast.error("Failed to load review data", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
      toast.error("Failed to load review data", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]); // Add sessionId as dependency since it's used in the function

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  const handleConfirm = async () => {
    if (!reviewData) return;

    try {
      setIsConfirming(true);
      const response = await fetch('/api/review/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: reviewData.session.id,
        }),
      });

      if (response.ok) {
        toast.success("Review confirmed successfully");
        router.push('/');
      } else {
        const data = await response.json();
        toast.error("Failed to confirm review", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Error confirming review:', error);
      toast.error("Failed to confirm review", {
        description: "Please try again later",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `DKK ${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-6 py-4">
        <h1 className="text-2xl font-bold">Stock Review</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading review data...</div>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="space-y-6 px-6 py-4">
        <h1 className="text-2xl font-bold">Stock Review</h1>
        <div className="text-center py-8 text-muted-foreground">
          No stocktake session available for review.
        </div>
      </div>
    );
  }

  const isCompleted = reviewData.session.status === 'Completed';

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Review</h1>
        <div className="text-sm text-muted-foreground">
          Session: {reviewData.session.name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missing Items</CardDescription>
            <CardTitle className="text-3xl">{reviewData.summary.missingItems}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Value Variance</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(reviewData.summary.totalValueVariance)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Location: {reviewData.session.locationId}</CardDescription>
            <CardTitle className="text-lg">Date: {reviewData.session.date}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discrepancy Results</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewData.checkResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No discrepancies found. All items match expected quantities.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Counted</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewData.checkResults.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.article}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.expectedQty}</TableCell>
                    <TableCell>{item.countedQty}</TableCell>
                    <TableCell className={item.variance < 0 ? "text-red-600" : "text-green-600"}>
                      {item.variance > 0 ? '+' : ''}{item.variance}
                    </TableCell>
                    <TableCell className={item.value < 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(item.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleConfirm}
          disabled={isConfirming || isCompleted}
        >
          {isCompleted
            ? "Completed"
            : isConfirming
              ? "Confirming..."
              : "Confirm"
          }
        </Button>
      </div>
    </div>
  );
}