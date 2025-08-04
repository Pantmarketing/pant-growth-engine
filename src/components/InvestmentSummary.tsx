import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentSummaryProps {
  investment: number;
  revenue: number;
  operationalCosts?: number;
  className?: string;
}

const InvestmentSummary = ({ 
  investment, 
  revenue, 
  operationalCosts = 0,
  className 
}: InvestmentSummaryProps) => {
  const totalCosts = investment + operationalCosts;
  const profit = revenue - totalCosts;
  const roas = investment > 0 ? revenue / investment : 0;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className={cn("shadow-lg border-0 bg-gradient-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Resumo Financeiro</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flow */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Investimento em Tráfego</div>
              <div className="text-lg font-bold text-investment">
                {formatCurrency(investment)}
              </div>
            </div>
            
            <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
            
            {operationalCosts > 0 && (
              <>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Custos Operacionais</div>
                  <div className="text-lg font-bold text-warning">
                    {formatCurrency(operationalCosts)}
                  </div>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
              </>
            )}
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Receita</div>
              <div className="text-lg font-bold text-revenue">
                {formatCurrency(revenue)}
              </div>
            </div>
            
            <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Lucro</div>
              <div className={cn(
                "text-lg font-bold",
                profit >= 0 ? "text-success" : "text-error"
              )}>
                {formatCurrency(profit)}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">ROAS</div>
              <div className="text-2xl font-bold text-primary flex items-center justify-center space-x-1">
                <span>{roas.toFixed(2)}x</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs text-muted-foreground">
                Retorno sobre investimento em ads
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">ROI</div>
              <div className={cn(
                "text-2xl font-bold flex items-center justify-center space-x-1",
                roi >= 0 ? "text-success" : "text-error"
              )}>
                <span>{roi.toFixed(1)}%</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs text-muted-foreground">
                Retorno sobre investimento total
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">
              Para cada R$ 1,00 investido em tráfego, você obteve{" "}
              <span className="font-semibold text-primary">
                {formatCurrency(roas)}
              </span>{" "}
              em receita
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummary;