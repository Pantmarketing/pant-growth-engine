import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, BarChart3, Users, TrendingUp, Zap } from "lucide-react";

const CreateDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    business_model: "",
    sheets_url: "",
    client_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const businessModels = [
    {
      value: "lead_para_vendedor",
      label: "Lead para Vendedor",
      description: "Funil focado em geração de leads qualificados para o time de vendas",
      icon: <Users className="w-5 h-5" />
    },
    {
      value: "venda_direta",
      label: "Venda Direta",
      description: "E-commerce ou vendas diretas através da página de vendas",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      value: "quiz",
      label: "Quiz",
      description: "Funil com quiz interativo para qualificação de leads",
      icon: <Zap className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate Google Sheets URL
      if (formData.sheets_url && !formData.sheets_url.includes('docs.google.com/spreadsheets')) {
        throw new Error("URL inválida. Use uma URL do Google Sheets válida.");
      }

      // Simulated API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Dashboard criado com sucesso!",
        description: `Dashboard "${formData.name}" foi criado e está pronto para uso.`,
      });
      
      navigate("/dashboards");
    } catch (error) {
      toast({
        title: "Erro ao criar dashboard",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
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
              <h1 className="text-lg font-semibold text-foreground">Criar Novo Dashboard</h1>
              <p className="text-sm text-muted-foreground">Configure um dashboard para seu cliente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Configuração do Dashboard</CardTitle>
              <CardDescription>
                Preencha as informações abaixo para criar um novo dashboard para seu cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Dashboard *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Cliente ABC - Consultoria Empresarial"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Nome identificador do dashboard (visível apenas para você)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_model">Modelo de Negócio *</Label>
                  <Select value={formData.business_model} onValueChange={(value) => handleInputChange("business_model", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex items-center space-x-3">
                            {model.icon}
                            <div>
                              <div className="font-medium">{model.label}</div>
                              <div className="text-sm text-muted-foreground">{model.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheets_url">URL da Planilha do Google Sheets</Label>
                  <Input
                    id="sheets_url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
                    value={formData.sheets_url}
                    onChange={(e) => handleInputChange("sheets_url", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL da planilha que contém os dados de performance. Certifique-se de que a planilha é pública ou compartilhada.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_password">Senha de Acesso do Cliente *</Label>
                  <Input
                    id="client_password"
                    type="password"
                    placeholder="Digite uma senha segura para o cliente"
                    value={formData.client_password}
                    onChange={(e) => handleInputChange("client_password", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Esta senha será usada pelo cliente para acessar o dashboard público
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informações importantes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• O dashboard será acessível via URL pública única</li>
                    <li>• O cliente usará apenas a senha para acessar</li>
                    <li>• Você pode importar dados da planilha a qualquer momento</li>
                    <li>• O modelo de negócio define o funil de conversão exibido</li>
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/dashboards")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 space-x-2"
                    disabled={isLoading || !formData.name || !formData.business_model || !formData.client_password}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? "Criando..." : "Criar Dashboard"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboard;