import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
  format?: 'currency' | 'percentage' | 'number';
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className,
  valueClassName,
  format = 'number'
}: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    if (isNaN(numValue)) return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue);
      case 'percentage':
        return `${numValue.toFixed(2)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(numValue);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md border-0 shadow-sm bg-gradient-card",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold text-foreground",
            valueClassName
          )}>
            {formatValue(value)}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 text-xs",
              trend.isPositive ? "text-success" : "text-error"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value).toFixed(1)}% vs período anterior</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;