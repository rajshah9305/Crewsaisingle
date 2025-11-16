import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Agent, Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";
import { AgentDialog } from "@/components/agent-dialog";
import { EmptyState } from "@/components/empty-state";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Bot, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
  const { toast } = useToast();

  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    queryFn: () => apiRequest("GET", "/api/agents"),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Ensure agents is always an array
  const agents = Array.isArray(agentsData) ? agentsData : [];

  const { data: executionsData, isLoading: executionsLoading, error: executionsError } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
    queryFn: () => apiRequest("GET", "/api/executions"),
    refetchInterval: (query) => {
      // Stop polling if there are no running executions
      const data = query?.state?.data;
      const hasRunningExecutions = Array.isArray(data) && data.some(exec => exec.status === "running");
      return hasRunningExecutions ? 3000 : false;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Ensure executions is always an array
  const executions = Array.isArray(executionsData) ? executionsData : [];

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Agent[]) => {
      return await apiRequest("PATCH", "/api/agents/reorder", { agents: newOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Reorder failed",
        description: error.message || "Failed to reorder agents. Please try again.",
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
        description: "The agent is processing your tasks. Results will appear below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution failed",
        description: error.message || "Failed to execute the agent. Please try again.",
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

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden antialiased">
      {/* Header - Fully Responsive */}
      <header className="border-b border-black-10 bg-white z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                src="/logo.png" 
                alt="RAJAI Platform Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain flex-shrink-0"
                onError={(e) => {
                  // Fallback if logo not found
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black tracking-tight truncate" data-testid="text-app-title">
                  RAJAI Platform
                </h1>
                <p className="font-sans text-[10px] sm:text-xs text-black-60 font-medium mt-0.5 sm:mt-1 truncate hidden xs:block">Multi-Agent Orchestration System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/agents">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm border-black-20 hover:bg-black-5"
                >
                  <span className="hidden sm:inline">View All Agents</span>
                  <span className="sm:hidden">Agents</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
                </Button>
              </Link>
              <Link href="/executions">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm border-black-20 hover:bg-black-5"
                >
                  <span className="hidden sm:inline">View All Executions</span>
                  <span className="sm:hidden">Executions</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Two-Pane Layout - Equal Split */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* LEFT PANE - Agent Management (50%) - Fully Responsive */}
        <div className="flex-1 lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-black-10 bg-white overflow-hidden min-h-0">
          {/* Left Pane Header - Mobile Optimized */}
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-black-10 bg-white-subtle">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-black truncate">
                  Agent Management
                </h2>
                {agents.length > 0 && (
                  <div className="flex items-center justify-center min-w-[22px] h-5 sm:h-6 px-1.5 sm:px-2 rounded-full bg-black-5 border border-black-10 flex-shrink-0">
                    <span className="font-sans text-[10px] sm:text-xs font-bold text-black">
                      {agents.length}
                    </span>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleCreateNew} 
                data-testid="button-create-agent"
                size="sm"
                className="bg-orange hover:bg-orange-hover text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 shadow-sm hover:shadow-md transition-all w-full xs:w-auto touch-manipulation"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="whitespace-nowrap">Create Agent</span>
              </Button>
            </div>
          </div>

          {/* Left Pane Content - Scrollable & Responsive */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-white-secondary">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-3 sm:space-y-4">

                  {agentsLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-black-10 overflow-hidden shadow-lg">
                          <div className="p-5 sm:p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                              <div className="flex-1 space-y-2 min-w-0">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            </div>
                            <Skeleton className="h-16 w-full" />
                            <div className="flex gap-2 flex-wrap">
                              <Skeleton className="h-6 w-24" />
                              <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Skeleton className="h-9 flex-1" />
                              <Skeleton className="h-9 w-9 flex-shrink-0" />
                              <Skeleton className="h-9 w-9 flex-shrink-0" />
                            </div>
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
                          className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4"
                        >
                      {agents.map((agent, index) => (
                        <Draggable key={agent.id} draggableId={agent.id} index={index}>
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
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE - Execution Results (50%) - Fully Responsive */}
        <div className="flex-1 lg:w-1/2 flex flex-col bg-white overflow-hidden min-h-0">
          {/* Right Pane Header - Mobile Optimized */}
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-black-10 bg-white-subtle">
            <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-black truncate">
              Execution Results
            </h2>
          </div>

          {/* Right Pane Content - Scrollable & Responsive */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-white-secondary">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
              {executionsLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange mx-auto" />
                    <p className="text-xs sm:text-sm font-medium text-black-60">Loading executions...</p>
                  </div>
                </div>
              ) : executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-3 sm:px-4">
                  <div className="relative mb-3 sm:mb-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-black-5 flex items-center justify-center border border-black-10">
                      <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-black-40" />
                    </div>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-black mb-1.5 sm:mb-2">
                    No Executions Yet
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-black-60 max-w-sm sm:max-w-md leading-relaxed">
                    Execute an agent from the {window.innerWidth < 1024 ? 'top' : 'left'} panel to see real-time results and outputs here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {executions.map((execution) => (
                    <Card key={execution.id} data-testid={`execution-${execution.id}`} className="border border-black-10 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                      <CardHeader className="pb-2.5 sm:pb-3 px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 md:pt-5">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                              <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-black truncate" data-testid={`text-execution-agent-${execution.id}`}>
                                {execution.agentName}
                              </CardTitle>
                              {execution.status === "running" && (
                                <Badge variant="outline" className="gap-1 sm:gap-1.5 bg-orange/10 border-orange text-orange flex-shrink-0 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                                  <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                                  <span className="font-semibold">Running</span>
                                </Badge>
                              )}
                              {execution.status === "completed" && (
                                <Badge variant="outline" className="gap-1 sm:gap-1.5 bg-black-5 border-black-20 text-black flex-shrink-0 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="font-semibold">Completed</span>
                                </Badge>
                              )}
                              {execution.status === "failed" && (
                                <Badge variant="outline" className="gap-1 sm:gap-1.5 bg-black-5 border-orange text-orange flex-shrink-0 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
                                  <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="font-semibold">Failed</span>
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-xs sm:text-sm font-medium text-black-60 truncate">
                              {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {execution.result && (
                        <CardContent className="pt-0 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                          <div className="bg-black-5 rounded-md sm:rounded-lg p-2.5 sm:p-3 md:p-4 border border-black-10">
                            <pre className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-pre-wrap break-words text-black-80 overflow-x-auto leading-relaxed" data-testid={`text-execution-result-${execution.id}`}>
                              {execution.result}
                            </pre>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AgentDialog
        key={editingAgent?.id || "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAgent(undefined);
        }}
        agent={editingAgent}
      />
    </div>
  );
}
