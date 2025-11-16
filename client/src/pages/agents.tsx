import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Agent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";
import { AgentDialog } from "@/components/agent-dialog";
import { EmptyState } from "@/components/empty-state";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function AgentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
  const { toast } = useToast();

  const {
    data: agents = [],
    isLoading: agentsLoading,
    error,
  } = useQuery<Agent[], Error>({
    queryKey: ["/api/agents"],
    queryFn: () => apiRequest("GET", "/api/agents"),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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
        description: "The agent is processing your tasks. Check executions page for results.",
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
      {/* Header */}
      <header className="border-b border-black-10 bg-white z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <img 
                src="/logo.png" 
                alt="RAJAI Platform Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black tracking-tight truncate">
                  Agent Management
                </h1>
                <p className="font-sans text-[10px] sm:text-xs text-black-60 font-medium mt-0.5 sm:mt-1 truncate hidden xs:block">
                  Create, configure, and manage AI agents
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-white-secondary">
        <div className="h-full flex flex-col">
          {/* Action Bar */}
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-black-10 bg-white-subtle">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-black truncate">
                  All Agents
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
              {error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-orange mb-4">
                    <p className="font-semibold text-lg">Failed to load agents</p>
                    <p className="text-sm text-black-60 mt-2">
                      {error instanceof Error ? error.message : "An unexpected error occurred"}
                    </p>
                  </div>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/agents"] })} className="bg-orange hover:bg-orange-hover text-white">
                    Retry
                  </Button>
                </div>
              ) : agentsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
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
