import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Agent, Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";
import { AgentDialog } from "@/components/agent-dialog";
import { TemplateSelector } from "@/components/template-selector";
import type { AgentTemplate } from "@/lib/agent-templates";
import { EmptyState } from "@/components/empty-state";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Bot, Loader2, CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
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

  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | undefined>();

  const handleTemplateSelect = (template: AgentTemplate) => {
    setTemplateDialogOpen(false);
    setSelectedTemplate(template);
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

  // Calculate stats
  const runningCount = executions.filter(e => e.status === "running").length;
  const completedCount = executions.filter(e => e.status === "completed").length;
  const failedCount = executions.filter(e => e.status === "failed").length;
  const latestExecution = executions[0];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-white-subtle to-white-secondary overflow-hidden antialiased">
      {/* Compact Header */}
      <header className="border-b border-black-10 bg-white/80 backdrop-blur-sm z-50 flex-shrink-0 shadow-sm">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img 
                src="/logo.png" 
                alt="RAJAI Platform Logo" 
                className="h-10 w-10 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl font-bold text-black tracking-tight truncate" data-testid="text-app-title">
                  RAJAI Platform
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
              <Button 
                onClick={() => setTemplateDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-black-20 hover:bg-black-5 text-sm h-9 px-3"
                title="Quick Template"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Quick Template
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-black-10 bg-white-subtle/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-black-10 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-black-5 flex items-center justify-center border border-black-10">
              <Bot className="h-5 w-5 text-black-60" />
            </div>
            <div>
              <div className="text-xs font-medium text-black-60">Agents</div>
              <div className="text-lg font-bold text-black">{agents.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-black-10 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-orange/10 flex items-center justify-center border border-orange/20">
              <Loader2 className="h-5 w-5 text-orange" />
            </div>
            <div>
              <div className="text-xs font-medium text-black-60">Running</div>
              <div className="text-lg font-bold text-orange">{runningCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-black-10 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-black-5 flex items-center justify-center border border-black-20">
              <CheckCircle2 className="h-5 w-5 text-black-60" />
            </div>
            <div>
              <div className="text-xs font-medium text-black-60">Completed</div>
              <div className="text-lg font-bold text-black">{completedCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-black-10 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-orange/10 flex items-center justify-center border border-orange/20">
              <XCircle className="h-5 w-5 text-orange" />
            </div>
            <div>
              <div className="text-xs font-medium text-black-60">Failed</div>
              <div className="text-lg font-bold text-orange">{failedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Screen Grid Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* LEFT PANE - Agents Grid */}
        <div className="flex flex-col overflow-hidden bg-white rounded-lg border border-black-10 shadow-sm">
          <div className="flex-shrink-0 px-4 py-3 border-b border-black-10 bg-white-subtle">
            <h2 className="font-display text-base font-bold text-black">Agents</h2>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            {agentsLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-black-10 overflow-hidden">
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

        {/* RIGHT PANE - Latest Execution */}
        <div className="flex flex-col overflow-hidden bg-white rounded-lg border border-black-10 shadow-sm">
          <div className="flex-shrink-0 px-4 py-3 border-b border-black-10 bg-white-subtle">
            <h2 className="font-display text-base font-bold text-black">Latest Execution</h2>
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
                <h3 className="font-display text-base font-bold text-black mb-2">No Executions</h3>
                <p className="font-sans text-sm text-black-60">Execute an agent to see results</p>
              </div>
            ) : (
              <Card data-testid={`execution-${latestExecution.id}`} className="border border-black-10 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-base font-bold text-black truncate" data-testid={`text-execution-agent-${latestExecution.id}`}>
                          {latestExecution.agentName}
                        </CardTitle>
                        {latestExecution.status === "running" && (
                          <Badge variant="outline" className="gap-1.5 bg-orange/10 border-orange text-orange text-xs py-1 px-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="font-semibold">Running</span>
                          </Badge>
                        )}
                        {latestExecution.status === "completed" && (
                          <Badge variant="outline" className="gap-1.5 bg-black-5 border-black-20 text-black text-xs py-1 px-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="font-semibold">Completed</span>
                          </Badge>
                        )}
                        {latestExecution.status === "failed" && (
                          <Badge variant="outline" className="gap-1.5 bg-black-5 border-orange text-orange text-xs py-1 px-2">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="font-semibold">Failed</span>
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm font-medium text-black-60">
                        {formatDistanceToNow(new Date(latestExecution.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {latestExecution.result && (
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="bg-black-5 rounded-lg p-3 border border-black-10 max-h-[calc(100vh-320px)] overflow-y-auto">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-words text-black-80 leading-relaxed" data-testid={`text-execution-result-${latestExecution.id}`}>
                        {latestExecution.result.length > 800 
                          ? latestExecution.result.substring(0, 800) + '...' 
                          : latestExecution.result}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      <AgentDialog
        key={editingAgent?.id || selectedTemplate?.id || "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAgent(undefined);
            setSelectedTemplate(undefined);
          }
        }}
        agent={editingAgent}
        template={selectedTemplate}
      />
      <TemplateSelector
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}
