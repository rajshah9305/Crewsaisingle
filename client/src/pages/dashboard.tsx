import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Agent, Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AgentDialog } from "@/components/agent-dialog";
import {
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
  Zap,
  TrendingUp,
  Activity,
  Play,
  Edit,
  Trash2,
  Search,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  History,
  GripVertical,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow, isToday } from "date-fns";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <Card className="border-orange-100 hover:shadow-lg hover:border-orange-300 transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-extrabold text-foreground">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardAgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onExecute: (agent: Agent) => void;
}

const DashboardAgentCard: React.FC<DashboardAgentCardProps> = ({
  agent,
  onEdit,
  onExecute,
}) => {
  return (
    <Card className="border-orange-100 hover:shadow-xl hover:border-orange-300 transition-all duration-300 group bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="cursor-grab mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-foreground mb-1">
                {agent.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {agent.goal}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onExecute(agent)}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1 shadow-md hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4 mr-1" />
            Execute
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(agent)}
            className="border-orange-300 hover:bg-orange-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 hover:bg-orange-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ExecutionCardProps {
  execution: Execution;
}

const ExecutionCard: React.FC<ExecutionCardProps> = ({ execution }) => {
  const getStatusConfig = (status: Execution["status"]) => {
    switch (status) {
      case "running":
        return {
          icon: <Activity className="w-4 h-4" />,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Running",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          className: "bg-green-50 text-green-700 border-green-200",
          label: "Completed",
        };
      case "failed":
        return {
          icon: <XCircle className="w-4 h-4" />,
          className: "bg-red-50 text-red-700 border-red-200",
          label: "Failed",
        };
      default:
        return {
          icon: <Activity className="w-4 h-4" />,
          className: "bg-gray-50 text-gray-700 border-gray-200",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(execution.status);

  return (
    <Card className="border-orange-100 hover:shadow-lg hover:border-orange-300 transition-all duration-300 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-foreground mb-1">
              {execution.agentName}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-500" />
              {formatDistanceToNow(new Date(execution.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${statusConfig.className} flex items-center gap-1 font-medium`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
        {execution.result && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {execution.result.length > 150
              ? `${execution.result.substring(0, 150)}...`
              : execution.result}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <Card className="border-orange-100 hover:shadow-xl hover:border-orange-300 transition-all duration-300 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base font-bold text-foreground mb-1">
              {template.name}
            </CardTitle>
            <Badge className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              {template.category}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all">
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const {
    data: agentsData,
    isLoading: agentsLoading,
  } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    queryFn: () => apiRequest("GET", "/api/agents"),
    retry: 3,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const agents = Array.isArray(agentsData) ? agentsData : [];

  const {
    data: executionsData,
    isLoading: executionsLoading,
  } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
    queryFn: () => apiRequest("GET", "/api/executions"),
    refetchInterval: (query) => {
      const data = query?.state?.data;
      const hasRunningExecutions =
        Array.isArray(data) &&
        data.some((exec) => exec.status === "running");
      return hasRunningExecutions ? 3000 : false;
    },
    retry: 3,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const executions = Array.isArray(executionsData) ? executionsData : [];

  const executeMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return await apiRequest("POST", `/api/agents/${agentId}/execute`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
      toast({
        title: "Agent executed",
        description:
          "The agent is processing your tasks. Results will appear below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution failed",
        description:
          error?.message ||
          "Failed to execute the agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setDialogOpen(true);
  };

  const handleExecute = (agent: Agent) => {
    executeMutation.mutate(agent.id);
  };

  const handleCreateNew = () => {
    setEditingAgent(undefined);
    setDialogOpen(true);
  };

  const runningCount = executions.filter(
    (e) => e.status === "running",
  ).length;
  const completedCount = executions.filter(
    (e) => e.status === "completed",
  ).length;
  const failedCount = executions.filter(
    (e) => e.status === "failed",
  ).length;
  const completedTodayCount = executions.filter(
    (e) =>
      e.status === "completed" &&
      isToday(new Date(e.createdAt as unknown as string)),
  ).length;
  const successDenominator = completedCount + failedCount;
  const successRate =
    successDenominator > 0
      ? `${Math.round((completedCount / successDenominator) * 100)}%`
      : "—";
  const latestExecution = executions[0];

  const statCards: StatCardProps[] = [
    {
      title: "Total Agents",
      value: agents.length,
      icon: <Users className="w-5 h-5 text-orange-500" />,
      trend: agents.length > 0 ? "Active in workspace" : "No agents yet",
    },
    {
      title: "Active Executions",
      value: runningCount,
      icon: <Activity className="w-5 h-5 text-orange-500" />,
      trend: runningCount > 0 ? "Running now" : "Idle",
    },
    {
      title: "Completed Today",
      value: completedTodayCount,
      icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />,
      trend: "Today’s successful runs",
    },
    {
      title: "Success Rate",
      value: successRate,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      trend: "Completed vs failed",
    },
  ];

  const templates: Template[] = [
    {
      id: "1",
      name: "Data Pipeline",
      description: "Complete data ingestion and processing pipeline",
      category: "Data Processing",
    },
    {
      id: "2",
      name: "Notification System",
      description: "Multi-channel notification orchestration",
      category: "Communication",
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      description: "Real-time analytics and reporting agent",
      category: "Analytics",
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.goal.toLowerCase().includes(q) ||
      agent.backstory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white antialiased">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent tracking-tight">
              RAJ AI
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium tracking-wide">
              multi-agent orchestration platform
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents, executions, templates..."
                className="pl-10 border-orange-200 focus-visible:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreateNew}
              data-testid="button-create-agent"
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </header>

        <Separator className="my-6 bg-orange-100" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-center mb-6">
            <TabsList className="bg-white border border-orange-100 shadow-sm">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
              >
                <Users className="w-4 h-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger
                value="executions"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
              >
                <History className="w-4 h-4" />
                Executions
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
              >
                <FileText className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-orange-100 shadow-md bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          Recent Activity
                        </CardTitle>
                        <CardDescription>
                          Latest executions and agent updates
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-500 text-white flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {executionsLoading && (
                      <p className="text-sm text-muted-foreground">
                        Loading executions...
                      </p>
                    )}
                    {!executionsLoading && executions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No executions yet. Run an agent to see activity here.
                      </p>
                    )}
                    {!executionsLoading &&
                      executions.slice(0, 3).map((execution) => (
                        <ExecutionCard key={execution.id} execution={execution} />
                      ))}
                  </CardContent>
                </Card>

                <Card className="border-orange-100 shadow-md bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Top Performing Agents
                    </CardTitle>
                    <CardDescription>
                      Most recently active agents in your workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agentsLoading && (
                      <p className="text-sm text-muted-foreground">
                        Loading agents...
                      </p>
                    )}
                    {!agentsLoading && agents.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No agents yet. Create your first agent to get started.
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {!agentsLoading &&
                        agents
                          .slice(0, 2)
                          .map((agent) => (
                            <DashboardAgentCard
                              key={agent.id}
                              agent={agent}
                              onEdit={handleEdit}
                              onExecute={handleExecute}
                            />
                          ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-orange-100 shadow-md bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-300"
                      size="sm"
                      onClick={handleCreateNew}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Agent
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-300"
                      size="sm"
                      onClick={() => setActiveTab("templates")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-300"
                      size="sm"
                      onClick={() => setActiveTab("executions")}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      View All Executions
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-md">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      System Status
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      All systems operational
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          API Response
                        </span>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          98ms
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Uptime</span>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          99.9%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Active Agents
                        </span>
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                          {agents.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Agent Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create, configure, and manage your AI agents
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            </div>

            {agentsLoading && (
              <p className="text-sm text-muted-foreground">Loading agents...</p>
            )}
            {!agentsLoading && agents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No agents yet. Click &quot;New Agent&quot; to create your first
                one.
              </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {!agentsLoading &&
                filteredAgents.map((agent) => (
                  <DashboardAgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={handleEdit}
                    onExecute={handleExecute}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Execution History
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monitor and analyze agent execution logs
                </p>
              </div>
            </div>

            {executionsLoading && (
              <p className="text-sm text-muted-foreground">
                Loading executions...
              </p>
            )}
            {!executionsLoading && executions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No executions yet. Execute an agent to see history here.
              </p>
            )}

            <div className="space-y-4">
              {!executionsLoading &&
                executions.map((execution) => (
                  <ExecutionCard key={execution.id} execution={execution} />
                ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Agent Templates
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pre-configured templates to get started quickly
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Platform Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure your RAJ AI workspace
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-orange-100 shadow-md bg-white">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage workspace preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Workspace Name
                    </label>
                    <Input
                      placeholder="RAJ AI Workspace"
                      className="border-orange-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Default Agent Timeout
                    </label>
                    <Input
                      placeholder="300 seconds"
                      className="border-orange-200"
                    />
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-100 shadow-md bg-white">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Email Notifications
                    </span>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Execution Alerts
                    </span>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      System Updates
                    </span>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <Button className="w-full border-orange-300 hover:bg-orange-50" variant="outline">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 RAJ AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-orange-500 transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="hover:text-orange-500 transition-colors"
              >
                Support
              </a>
              <a
                href="#"
                className="hover:text-orange-500 transition-colors"
              >
                API
              </a>
            </div>
          </div>
        </footer>
      </div>

      <AgentDialog
        key={editingAgent?.id || "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAgent(undefined);
          }
        }}
        agent={editingAgent}
      />
    </div>
  );
}
