import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Plus, 
  Eye, 
  Copy, 
  LogOut,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

interface Dashboard {
  id: number;
  name: string;
  business_model: string;
  created_at: string;
}

const DashboardsList = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    const fetchDashboards = async () => {
      try {
        const response = await fetch('/api/dashboards', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("auth_token");
            navigate("/login");
            return;
          }
          throw new Error('Erro ao carregar dashboards');
        }

        const data = await response.json();
        setDashboards(data);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao carregar dashboards",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, [navigate, toast]);

  const getBusinessModelLabel = (model: string) => {
    const models = {
      "lead_para_vendedor": "Lead para Vendedor",
      "venda_direta": "Venda Direta",
      "quiz": "Quiz"
    };
    return models[model as keyof typeof models] || model;
  };

  const getBusinessModelIcon = (model: string) => {
    const icons = {
      "lead_para_vendedor": <Users className="w-4 h-4" />,
      "venda_direta": <TrendingUp className="w-4 h-4" />,
      "quiz": <Zap className="w-4 h-4" />
    };
    return icons[model as keyof typeof icons] || <BarChart3 className="w-4 h-4" />;
  };

  const getBusinessModelColor = (model: string) => {
    const colors = {
      "lead_para_vendedor": "bg-primary text-primary-foreground",
      "venda_direta": "bg-success text-success-foreground",
      "quiz": "bg-warning text-warning-foreground"
    };
    return colors[model as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const copyPublicLink = async (dashboardId: number, dashboardName: string) => {
    const publicUrl = `${window.location.origin}/public/${dashboardId}`;
    await navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link copiado!",
      description: `Link público do dashboard "${dashboardName}" copiado para a área de transferência.`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pant Marketing</h1>
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Dashboards dos Clientes</h2>
            <p className="text-muted-foreground">Gerencie e monitore todos os dashboards da agência</p>
          </div>
          <Button 
            onClick={() => navigate("/create-dashboard")}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Dashboard</span>
          </Button>
        </div>

        {dashboards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum dashboard encontrado</h3>
              <p className="text-muted-foreground mb-6">Crie seu primeiro dashboard para começar a monitorar a performance dos seus clientes.</p>
              <Button 
                onClick={() => navigate("/create-dashboard")}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      <Badge className={`w-fit space-x-1 ${getBusinessModelColor(dashboard.business_model)}`}>
                        {getBusinessModelIcon(dashboard.business_model)}
                        <span>{getBusinessModelLabel(dashboard.business_model)}</span>
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Criado em {new Date(dashboard.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/admin/dashboard/${dashboard.id}`)}
                      className="flex-1 space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Dashboard</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyPublicLink(dashboard.id, dashboard.name)}
                      className="space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardsList;