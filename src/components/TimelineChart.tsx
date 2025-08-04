import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from "lucide-react";

interface DashboardData {
  date: string;
  investment: number;
  revenue: number;
  leads?: number;
  sales?: number;
}

interface TimelineChartProps {
  data: DashboardData[];
  operationalCosts?: { date: string; amount: number }[];
}

const TimelineChart = ({ data, operationalCosts = [] }: TimelineChartProps) => {
  // Process data for chart
  const chartData = data.map(item => {
    const date = item.date;
    const operationalCost = operationalCosts
      .filter(cost => cost.date === date)
      .reduce((sum, cost) => sum + cost.amount, 0);
    
    const totalCosts = item.investment + operationalCost;
    const profit = item.revenue - totalCosts;

    return {
      date: new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      fullDate: date,
      investment: item.investment,
      revenue: item.revenue,
      profit: profit,
      operationalCosts: operationalCost
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-investment">Investimento:</span>
              <span className="font-medium">{formatCurrency(data.investment)}</span>
            </div>
            {data.operationalCosts > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-warning">Custos Op.:</span>
                <span className="font-medium">{formatCurrency(data.operationalCosts)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-revenue">Receita:</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-1">
              <span className={data.profit >= 0 ? "text-success" : "text-error"}>
                Lucro:
              </span>
              <span className="font-medium">{formatCurrency(data.profit)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Evolução Temporal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(0)}k`;
                  }
                  return `R$ ${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="investment" 
                stroke="hsl(var(--investment))" 
                strokeWidth={2}
                name="Investimento"
                dot={{ fill: "hsl(var(--investment))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--investment))" }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--revenue))" 
                strokeWidth={2}
                name="Receita"
                dot={{ fill: "hsl(var(--revenue))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--revenue))" }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Lucro"
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--success))" }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;