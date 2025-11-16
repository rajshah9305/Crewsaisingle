import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Agent, Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";
import { AgentDialog } from "@/components/agent-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Bot,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Users,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, isToday } from "date-fns";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="border-orange/10 hover:shadow-lg hover:border-orange/40 transition-all duration-300 bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-black-60 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-black">
              {value}
            </p>
            {trend && (
              <p className="text-[11px] text-black-50 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 sm:p-3.5 bg-gradient-to-br from-orange/5 to-orange/10 rounded-xl border border-orange/20 shadow-sm flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
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

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Agent[]) => {
      return await apiRequest("PATCH", "/api/agents/reorder", {
        agents: newOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Reorder failed",
        description:
          error?.message ||
          "Failed to reorder agents. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(agents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reordered = items.map((agent, index) => ({
      ...agent,
      order: index,
    }));

    queryClient.setQueryData(["/api/agents"], reordered);
    reorderMutation.mutate(reordered);
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-white-subtle to-white-secondary overflow-hidden antialiased">
      {/* Header */}
      <header className="border-b border-black-10 bg-white/80 backdrop-blur-sm z-50 flex-shrink-0 shadow-sm">
        <div className="w-full max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src="/logo.png"
                alt="RAJAI Platform Logo"
                className="h-10 w-10 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="min-w-0 flex-1">
                <h1
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight truncate"
                  data-testid="text-app-title"
                >
                  <span className="gradient-text">RAJ&nbsp;AI</span>
                  <span className="ml-2 hidden sm:inline text-black/70 font-semibold text-base sm:text-lg align-middle">
                    multi-agent orchestration
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/agents">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm border-black-20 hover:bg-black-5"
                >
                  Agents
                </Button>
              </Link>
              <Link href="/executions">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm border-black-20 hover:bg-black-5"
                >
                  Executions
                </Button>
              </Link>
              <Button
                onClick={handleCreateNew}
                data-testid="button-create-agent"
                size="sm"
                className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm h-9 px-4 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Agent
              </Button>
              <Link href="/templates">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-black-20 hover:bg-black-5 text-sm h-9 px-3"
                  title="Browse Templates"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="flex-shrink-0 border-b border-black-10 bg-white-subtle/60">
        <div className="w-full max-w-6xl mx-auto px-4 py-3 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Total Agents"
            value={agents.length}
            icon={<Users className="w-5 h-5 text-orange" />}
            trend={agents.length > 0 ? "Active in workspace" : "No agents yet"}
          />
          <StatCard
            title="Active Executions"
            value={runningCount}
            icon={<Activity className="w-5 h-5 text-orange" />}
            trend={runningCount > 0 ? "Running now" : "Idle"}
          />
          <StatCard
            title="Completed Today"
            value={completedTodayCount}
            icon={<CheckCircle2 className="w-5 h-5 text-orange" />}
            trend="Today’s successful runs"
          />
          <StatCard
            title="Success Rate"
            value={successRate}
            icon={<Zap className="w-5 h-5 text-orange" />}
            trend="Completed vs failed"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Agents Pane */}
          <section className="flex flex-col overflow-hidden bg-white rounded-lg border border-black-10 shadow-sm card-hover">
            <div className="flex-shrink-0 px-4 py-3 border-b border-black-10 bg-white-subtle">
              <h2 className="font-display text-base font-bold text-black">
                Agents
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-3">
              {agentsLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-black-10 overflow-hidden"
                    >
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-7 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : agents.length === 0 ? (
                <EmptyState onCreateAgent={handleCreateNew} />
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="agents">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-1 xl:grid-cols-2 gap-2"
                      >
                        {agents.map((agent, index) => (
                          <Draggable
                            key={agent.id}
                            draggableId={agent.id}
                            index={index}
                          >
                            {(provided) => (
                              <AgentCard
                                agent={agent}
                                onEdit={handleEdit}
                                onExecute={handleExecute}
                                provided={provided}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </section>

          {/* Latest Execution Pane */}
          <section className="flex flex-col overflow-hidden bg-white rounded-lg border border-black-10 shadow-sm card-hover">
            <div className="flex-shrink-0 px-4 py-3 border-b border-black-10 bg-white-subtle">
              <h2 className="font-display text-base font-bold text-black">
                Latest Execution
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-3">
              {executionsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-orange" />
                </div>
              ) : !latestExecution ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="h-16 w-16 rounded-xl bg-black-5 flex items-center justify-center border border-black-10 mb-4">
                    <Bot className="h-8 w-8 text-black-40" />
                  </div>
                  <h3 className="font-display text-base font-bold text-black mb-2">
                    No Executions
                  </h3>
                  <p className="font-sans text-sm text-black-60">
                    Execute an agent to see results
                  </p>
                </div>
              ) : (
                <Card
                  data-testid={`execution-${latestExecution.id}`}
                  className="border border-black-10 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle
                            className="text-base font-bold text-black truncate"
                            data-testid={`text-execution-agent-${latestExecution.id}`}
                          >
                            {latestExecution.agentName}
                          </CardTitle>
                          {latestExecution.status === "running" && (
                            <Badge className="gap-1.5 bg-orange/10 border-orange text-orange text-xs py-1 px-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="font-semibold">Running</span>
                            </Badge>
                          )}
                          {latestExecution.status === "completed" && (
                            <Badge className="gap-1.5 bg-black-5 border-black-20 text-black text-xs py-1 px-2">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="font-semibold">Completed</span>
                            </Badge>
                          )}
                          {latestExecution.status === "failed" && (
                            <Badge className="gap-1.5 bg-black-5 border-orange text-orange text-xs py-1 px-2">
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="font-semibold">Failed</span>
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm font-medium text-black-60">
                          {formatDistanceToNow(
                            new Date(latestExecution.createdAt),
                            { addSuffix: true },
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {latestExecution.result && (
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="bg-black-5 rounded-lg p-3 border border-black-10 max-h-[calc(100vh-320px)] overflow-y-auto">
                        <pre
                          className="font-mono text-xs whitespace-pre-wrap break-words text-black-80 leading-relaxed"
                          data-testid={`text-execution-result-${latestExecution.id}`}
                        >
                          {latestExecution.result.length > 800
                            ? `${latestExecution.result.substring(0, 800)}...`
                            : latestExecution.result}
                        </pre>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          </section>
        </div>
      </main>

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


