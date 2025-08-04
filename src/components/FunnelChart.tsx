import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Users, ShoppingCart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelData {
  clicks: number;
  page_views: number;
  leads: number;
  conversations: number;
  meetings: number;
  negotiations: number;
  sales_page_views: number;
  checkouts: number;
  sales: number;
}

interface FunnelChartProps {
  data: FunnelData;
  businessModel: "lead_para_vendedor" | "venda_direta" | "quiz";
}

const FunnelChart = ({ data, businessModel }: FunnelChartProps) => {
  const calculateConversionRate = (from: number, to: number) => {
    if (from === 0) return 0;
    return (to / from) * 100;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getBusinessModelConfig = () => {
    switch (businessModel) {
      case "lead_para_vendedor":
        return {
          title: "Funil: Lead para Vendedor",
          icon: <Users className="w-5 h-5" />,
          steps: [
            { label: "Cliques", value: data.clicks, color: "bg-primary" },
            { label: "Leads", value: data.leads, color: "bg-primary/80" },
            { label: "Conversas", value: data.conversations, color: "bg-primary/60" },
            { label: "Reuniões", value: data.meetings, color: "bg-primary/40" },
            { label: "Negociações", value: data.negotiations, color: "bg-primary/30" },
            { label: "Vendas", value: data.sales, color: "bg-success" }
          ],
          overallConversion: {
            from: data.clicks,
            to: data.sales,
            label: "Conversão Geral (Cliques → Vendas)"
          }
        };
      
      case "venda_direta":
        return {
          title: "Funil: Venda Direta",
          icon: <ShoppingCart className="w-5 h-5" />,
          steps: [
            { label: "Cliques", value: data.clicks, color: "bg-primary" },
            { label: "Visualizações", value: data.page_views, color: "bg-primary/80" },
            { label: "Checkouts", value: data.checkouts, color: "bg-primary/60" },
            { label: "Vendas", value: data.sales, color: "bg-success" }
          ],
          overallConversion: {
            from: data.clicks,
            to: data.sales,
            label: "Conversão Geral (Cliques → Vendas)"
          }
        };
      
      case "quiz":
        return {
          title: "Funil: Quiz",
          icon: <Zap className="w-5 h-5" />,
          steps: [
            { label: "Cliques", value: data.clicks, color: "bg-primary" },
            { label: "Visualizações da Página", value: data.page_views, color: "bg-primary/80" },
            { label: "Visualizações de Vendas", value: data.sales_page_views, color: "bg-primary/60" },
            { label: "Checkouts", value: data.checkouts, color: "bg-primary/40" },
            { label: "Vendas", value: data.sales, color: "bg-success" }
          ],
          overallConversion: {
            from: data.clicks,
            to: data.sales,
            label: "Conversão Geral (Cliques → Vendas)"
          }
        };
    }
  };

  const config = getBusinessModelConfig();
  const overallRate = calculateConversionRate(config.overallConversion.from, config.overallConversion.to);

  return (
    <Card className="shadow-lg border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          {config.icon}
          <span>{config.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Conversion */}
          <div className="bg-gradient-primary p-4 rounded-lg text-center">
            <div className="text-primary-foreground/80 text-sm font-medium mb-1">
              {config.overallConversion.label}
            </div>
            <div className="text-2xl font-bold text-primary-foreground">
              {overallRate.toFixed(2)}%
            </div>
            <div className="text-primary-foreground/70 text-xs">
              {formatNumber(config.overallConversion.to)} de {formatNumber(config.overallConversion.from)} cliques
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-3">
            {config.steps.map((step, index) => {
              const nextStep = config.steps[index + 1];
              const conversionRate = nextStep 
                ? calculateConversionRate(step.value, nextStep.value) 
                : null;
              
              const stepWidth = step.value > 0 
                ? Math.max(20, (step.value / config.steps[0].value) * 100) 
                : 20;

              return (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={cn(
                          "h-8 rounded-r-full flex items-center px-3 text-sm font-medium text-white transition-all",
                          step.color
                        )}
                        style={{ width: `${stepWidth}%`, minWidth: '120px' }}
                      >
                        {step.label}
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatNumber(step.value)}
                      </div>
                    </div>
                  </div>
                  
                  {conversionRate !== null && (
                    <div className="flex items-center space-x-2 ml-4">
                      <TrendingDown className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">
                          {conversionRate.toFixed(2)}%
                        </span>
                        {" "}converteram para {nextStep?.label.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Metrics */}
          {businessModel === "lead_para_vendedor" && data.leads > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 mt-4">
              <div className="text-sm font-medium mb-2">Métricas do Funil de Leads:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Connect Rate:</span>
                  <span className="font-medium ml-1">
                    {calculateConversionRate(data.leads, data.conversations).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Close Rate:</span>
                  <span className="font-medium ml-1">
                    {calculateConversionRate(data.negotiations, data.sales).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChart;