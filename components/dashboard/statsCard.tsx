import { memo } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard = memo(({ title, value, subtitle }: StatsCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-3xl">
        {value} {subtitle && <span className="text-base">{subtitle}</span>}
      </CardTitle>
    </CardHeader>
  </Card>
));

StatsCard.displayName = 'StatsCard';

export default StatsCard;