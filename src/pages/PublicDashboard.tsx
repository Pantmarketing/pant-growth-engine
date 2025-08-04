import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PeriodSelector, { DateRange } from "@/components/PeriodSelector";
import MetricCard from "@/components/MetricCard";
import InvestmentSummary from "@/components/InvestmentSummary";
import TimelineChart from "@/components/TimelineChart";
import FunnelChart from "@/components/FunnelChart";
import { 
  Lock, 
  BarChart3,
  Mouse, 
  Target, 
  Users, 
  MessageCircle,
  Eye,
  DollarSign
} from "lucide-react";
import { subDays } from "date-fns";

interface DashboardData {
  id: number;
  name: string;
  business_model: "lead_para_vendedor" | "venda_direta" | "quiz";
  data: {
    date: string;
    investment: number;
    impressions: number;
    clicks: number;
    page_views: number;
    leads: number;
    conversations: number;
    meetings: number;
    negotiations: number;
    sales_page_views: number;
    checkouts: number;
    sales: number;
    revenue: number;
  }[];
}

const PublicDashboard = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem(`public_auth_${id}`);
    if (token) {
      setIsAuthenticated(true);
      loadDashboardData(token);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadDashboardData = async (token: string) => {
    try {
      const startDate = selectedPeriod.from?.toISOString().split('T')[0];
      const endDate = selectedPeriod.to?.toISOString().split('T')[0];
      
      const response = await fetch(`/api/public/dashboard/${id}?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem(`public_auth_${id}`);
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Erro ao carregar dashboard');
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to reload data when period changes
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(`public_auth_${id}`);
      if (token) {
        loadDashboardData(token);
      }
    }
  }, [selectedPeriod, isAuthenticated, id]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/public/auth/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Senha incorreta');
      }

      localStorage.setItem(`public_auth_${id}`, data.token);
      setIsAuthenticated(true);
      toast({
        title: "Acesso autorizado",
        description: "Bem-vindo ao seu dashboard de performance!",
      });
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: "Senha incorreta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Dashboard não encontrado</h1>
          <p className="text-muted-foreground">O dashboard solicitado não existe ou não está disponível.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Performance</h1>
            <p className="text-muted-foreground">{dashboard.name}</p>
          </div>

          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Acesso Restrito</CardTitle>
              <CardDescription className="text-center">
                Digite a senha para visualizar seu dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha de Acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
                >
                  Acessar Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate aggregated metrics for the selected period
  const aggregatedData = dashboard.data.reduce((acc, item) => {
    return {
      investment: acc.investment + item.investment,
      impressions: acc.impressions + item.impressions,
      clicks: acc.clicks + item.clicks,
      page_views: acc.page_views + item.page_views,
      leads: acc.leads + item.leads,
      conversations: acc.conversations + item.conversations,
      meetings: acc.meetings + item.meetings,
      negotiations: acc.negotiations + item.negotiations,
      sales_page_views: acc.sales_page_views + item.sales_page_views,
      checkouts: acc.checkouts + item.checkouts,
      sales: acc.sales + item.sales,
      revenue: acc.revenue + item.revenue
    };
  }, {
    investment: 0,
    impressions: 0,
    clicks: 0,
    page_views: 0,
    leads: 0,
    conversations: 0,
    meetings: 0,
    negotiations: 0,
    sales_page_views: 0,
    checkouts: 0,
    sales: 0,
    revenue: 0
  });

  // Calculate metrics
  const ctr = aggregatedData.impressions > 0 ? (aggregatedData.clicks / aggregatedData.impressions) * 100 : 0;
  const cpm = aggregatedData.impressions > 0 ? (aggregatedData.investment / aggregatedData.impressions) * 1000 : 0;
  const cpc = aggregatedData.clicks > 0 ? aggregatedData.investment / aggregatedData.clicks : 0;
  const cpl = aggregatedData.leads > 0 ? aggregatedData.investment / aggregatedData.leads : 0;
  const cpa = aggregatedData.sales > 0 ? aggregatedData.investment / aggregatedData.sales : 0;
  const connectRate = aggregatedData.leads > 0 ? (aggregatedData.conversations / aggregatedData.leads) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{dashboard.name}</h1>
              <p className="text-sm text-muted-foreground">Dashboard de Performance</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem(`public_auth_${id}`);
              setIsAuthenticated(false);
            }}
            className="space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Sua Performance</h2>
          <PeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        <div className="space-y-6">
          {/* Investment Summary - sem ROI para clientes */}
          <InvestmentSummary 
            investment={aggregatedData.investment}
            revenue={aggregatedData.revenue}
            operationalCosts={0} // Não mostra custos operacionais para clientes
          />

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="CTR"
              value={ctr}
              format="percentage"
              icon={Mouse}
              subtitle="Taxa de cliques"
            />
            <MetricCard
              title="CPM"
              value={cpm}
              format="currency"
              icon={Eye}
              subtitle="Custo por mil impressões"
            />
            <MetricCard
              title="CPC"
              value={cpc}
              format="currency"
              icon={Target}
              subtitle="Custo por clique"
            />
            {dashboard.business_model === "lead_para_vendedor" && (
              <MetricCard
                title="Connect Rate"
                value={connectRate}
                format="percentage"
                icon={MessageCircle}
                subtitle="Taxa de conexão"
              />
            )}
            <MetricCard
              title="CPL"
              value={cpl}
              format="currency"
              icon={Users}
              subtitle="Custo por lead"
            />
            <MetricCard
              title="CPA"
              value={cpa}
              format="currency"
              icon={DollarSign}
              subtitle="Custo por aquisição"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimelineChart 
              data={dashboard.data}
            />
            <FunnelChart 
              data={aggregatedData}
              businessModel={dashboard.business_model}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;