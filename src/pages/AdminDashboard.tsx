import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PeriodSelector, { DateRange } from "@/components/PeriodSelector";
import MetricCard from "@/components/MetricCard";
import InvestmentSummary from "@/components/InvestmentSummary";
import TimelineChart from "@/components/TimelineChart";
import FunnelChart from "@/components/FunnelChart";
import { 
  ArrowLeft, 
  Download, 
  Plus, 
  Eye, 
  Mouse, 
  Target, 
  Users, 
  MessageCircle,
  Calendar,
  Handshake,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Percent,
  BarChart3
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
  operationalCosts: {
    id: number;
    description: string;
    amount: number;
    date_from: string;
    date_to: string;
  }[];
}

const AdminDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCost, setShowAddCost] = useState(false);
  const [newCost, setNewCost] = useState({
    description: "",
    amount: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Simulated data - replace with actual API call
    setTimeout(() => {
      setDashboard({
        id: 1,
        name: "Cliente ABC - Consultoria",
        business_model: "lead_para_vendedor",
        data: [
          {
            date: "2024-01-01",
            investment: 1500,
            impressions: 15000,
            clicks: 450,
            page_views: 420,
            leads: 85,
            conversations: 42,
            meetings: 28,
            negotiations: 15,
            sales_page_views: 0,
            checkouts: 0,
            sales: 8,
            revenue: 12000
          },
          {
            date: "2024-01-02",
            investment: 1800,
            impressions: 18000,
            clicks: 540,
            page_views: 510,
            leads: 102,
            conversations: 51,
            meetings: 34,
            negotiations: 18,
            sales_page_views: 0,
            checkouts: 0,
            sales: 10,
            revenue: 15000
          }
        ],
        operationalCosts: [
          {
            id: 1,
            description: "Equipe de vendas",
            amount: 5000,
            date_from: "2024-01-01",
            date_to: "2024-01-31"
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [id, navigate]);

  const handleImportSheets = async () => {
    toast({
      title: "Importação iniciada",
      description: "Os dados estão sendo importados da planilha...",
    });
    
    // Simulated import
    setTimeout(() => {
      toast({
        title: "Importação concluída",
        description: "Dados atualizados com sucesso!",
      });
    }, 2000);
  };

  const handleAddCost = async () => {
    if (!newCost.description || !newCost.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Custo adicionado",
      description: `Custo "${newCost.description}" foi adicionado com sucesso.`,
    });

    setNewCost({ description: "", amount: "", date_from: "", date_to: "" });
    setShowAddCost(false);
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
          <Button onClick={() => navigate("/dashboards")}>
            Voltar para lista
          </Button>
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

  const totalOperationalCosts = dashboard.operationalCosts.reduce((sum, cost) => sum + cost.amount, 0);

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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboards")}
              className="space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{dashboard.name}</h1>
                <p className="text-sm text-muted-foreground">Dashboard Administrativo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleImportSheets} className="space-x-2">
              <Download className="w-4 h-4" />
              <span>Importar Planilha</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`/public/${dashboard.id}`, '_blank')}
              className="space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Ver como Cliente</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Performance do Dashboard</h2>
          <PeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        <div className="space-y-6">
          {/* Investment Summary */}
          <InvestmentSummary 
            investment={aggregatedData.investment}
            revenue={aggregatedData.revenue}
            operationalCosts={totalOperationalCosts}
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
              operationalCosts={dashboard.operationalCosts.map(cost => ({
                date: cost.date_from,
                amount: cost.amount
              }))}
            />
            <FunnelChart 
              data={aggregatedData}
              businessModel={dashboard.business_model}
            />
          </div>

          {/* Operational Costs */}
          <Card className="shadow-lg border-0 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Custos Operacionais</span>
                </CardTitle>
                <Button 
                  onClick={() => setShowAddCost(!showAddCost)}
                  size="sm"
                  className="space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Custo</span>
                </Button>
              </div>
              <CardDescription>
                Custos adicionais além do investimento em tráfego
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showAddCost && (
                <Card className="mb-4 bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          placeholder="Ex: Equipe de vendas"
                          value={newCost.description}
                          onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Valor</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0,00"
                          value={newCost.amount}
                          onChange={(e) => setNewCost({...newCost, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_from">Data de início</Label>
                        <Input
                          id="date_from"
                          type="date"
                          value={newCost.date_from}
                          onChange={(e) => setNewCost({...newCost, date_from: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_to">Data de fim</Label>
                        <Input
                          id="date_to"
                          type="date"
                          value={newCost.date_to}
                          onChange={(e) => setNewCost({...newCost, date_to: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={handleAddCost}>Adicionar</Button>
                      <Button variant="outline" onClick={() => setShowAddCost(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {dashboard.operationalCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{cost.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(cost.date_from).toLocaleDateString('pt-BR')} - {new Date(cost.date_to).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-warning">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost.amount)}
                    </div>
                  </div>
                ))}
                
                {dashboard.operationalCosts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum custo operacional adicionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;