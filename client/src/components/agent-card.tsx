import { Agent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Play, Pencil, Trash2, Bot } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DraggableProvided } from "@hello-pangea/dnd";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onExecute: (agent: Agent) => void;
  provided?: DraggableProvided;
}

export function AgentCard({ agent, onEdit, onExecute, provided }: AgentCardProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      deleteMutation.mutate(agent.id);
    }
  };

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className="group relative overflow-hidden border border-black-10 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:border-black-20 touch-manipulation"
      data-testid={`card-agent-${agent.id}`}
    >
      
      <CardHeader className="space-y-0 pb-3 sm:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              {...provided?.dragHandleProps}
              className="cursor-grab active:cursor-grabbing mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 sm:p-1.5 rounded hover:bg-black-5 touch-none hidden sm:block"
              data-testid={`button-drag-${agent.id}`}
            >
              <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black-40" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-1.5 text-black tracking-tight line-clamp-2 sm:line-clamp-1" data-testid={`text-agent-name-${agent.id}`}>
                {agent.name}
              </CardTitle>
              <CardDescription className="line-clamp-1 text-xs sm:text-sm font-medium text-black-60" data-testid={`text-agent-role-${agent.id}`}>
                {agent.role}
              </CardDescription>
            </div>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-black-5 flex items-center justify-center flex-shrink-0 border border-black-10">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-black-40" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 sm:pb-4 space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6">
        <div className="p-2.5 sm:p-3 rounded-md sm:rounded-lg bg-white-subtle border border-black-10">
          <h4 className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide mb-1.5 sm:mb-2">
            Goal
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-2 text-black-80" data-testid={`text-agent-goal-${agent.id}`}>{agent.goal}</p>
        </div>
        
        <div>
          <h4 className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide mb-2 sm:mb-2.5">
            Tasks
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {agent.tasks.slice(0, 3).map((task, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black-5 border border-black-10 text-black hover:bg-black-10 transition-colors">
                {task.length > (window.innerWidth < 640 ? 20 : 28) ? task.substring(0, window.innerWidth < 640 ? 20 : 28) + "..." : task}
              </Badge>
            ))}
            {agent.tasks.length > 3 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 border border-black-20 text-black-60 hover:bg-black-5 transition-colors">
                +{agent.tasks.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-black-10 bg-white px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <Button
          onClick={() => onExecute(agent)}
          size="sm"
          className="flex-1 bg-orange hover:bg-orange-hover text-white font-semibold transition-all h-8 sm:h-9 text-xs sm:text-sm touch-manipulation active:scale-95"
          data-testid={`button-execute-${agent.id}`}
        >
          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 fill-current" />
          <span className="hidden xs:inline">Execute</span>
          <span className="inline xs:hidden">Run</span>
        </Button>
        <Button
          onClick={() => onEdit(agent)}
          variant="outline"
          size="sm"
          className="transition-all border-black-20 hover:border-black hover:bg-black-5 text-black h-8 sm:h-9 w-8 sm:w-9 p-0 touch-manipulation active:scale-95"
          data-testid={`button-edit-${agent.id}`}
        >
          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          size="sm"
          disabled={deleteMutation.isPending}
          className="transition-all border-black-20 hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-black h-8 sm:h-9 w-8 sm:w-9 p-0 touch-manipulation active:scale-95"
          data-testid={`button-delete-${agent.id}`}
        >
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
