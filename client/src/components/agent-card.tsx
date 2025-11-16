import { Agent, InsertAgent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Play, Pencil, Trash2, Bot, Copy } from "lucide-react";
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

  const cloneMutation = useMutation({
    mutationFn: async () => {
      const clonedAgent: InsertAgent = {
        name: `${agent.name} (Copy)`,
        role: agent.role,
        goal: agent.goal,
        backstory: agent.backstory,
        tasks: agent.tasks,
      };
      return await apiRequest("POST", "/api/agents", clonedAgent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent cloned",
        description: `${agent.name} has been cloned successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clone the agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClone = () => {
    cloneMutation.mutate();
  };

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className="group relative overflow-hidden border border-black-10 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:border-orange/40 hover:-translate-y-1 touch-manipulation"
      data-testid={`card-agent-${agent.id}`}
    >
      <CardHeader className="space-y-0 pb-4 px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              {...provided?.dragHandleProps}
              className="cursor-grab active:cursor-grabbing mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-black-5 touch-none"
              data-testid={`button-drag-${agent.id}`}
            >
              <GripVertical className="h-4 w-4 text-black-40" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-black mb-1.5 text-black tracking-tight line-clamp-1" data-testid={`text-agent-name-${agent.id}`}>
                {agent.name}
              </CardTitle>
              <CardDescription className="line-clamp-1 text-sm font-semibold text-black-60" data-testid={`text-agent-role-${agent.id}`}>
                {agent.role}
              </CardDescription>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange/15 to-orange/5 flex items-center justify-center flex-shrink-0 border border-orange/30 shadow-sm">
            <Bot className="h-6 w-6 text-orange" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3 px-5">
        <div className="p-3 rounded-lg bg-black-5 border border-black-10">
          <p className="text-sm leading-relaxed line-clamp-2 text-black-80 font-medium" data-testid={`text-agent-goal-${agent.id}`}>{agent.goal}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {agent.tasks.slice(0, 2).map((task, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-semibold px-2.5 py-1 bg-white border border-black-10 text-black-80 hover:bg-black-5 transition-colors">
              {task.length > 25 ? task.substring(0, 25) + "..." : task}
            </Badge>
          ))}
          {agent.tasks.length > 2 && (
            <Badge variant="outline" className="text-xs font-bold px-2.5 py-1 border border-black-20 text-black-60">
              +{agent.tasks.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="gap-2 pt-4 border-t border-black-10 bg-white-subtle px-5 pb-4">
        <Button
          onClick={() => onExecute(agent)}
          size="sm"
          className="flex-1 bg-orange hover:bg-orange-hover text-white font-bold transition-all h-9 text-sm touch-manipulation active:scale-95 shadow-md hover:shadow-lg"
          data-testid={`button-execute-${agent.id}`}
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          Execute
        </Button>
        <Button
          onClick={() => onEdit(agent)}
          variant="outline"
          size="sm"
          className="transition-all border-black-20 hover:border-black hover:bg-black-5 text-black h-9 w-9 p-0 touch-manipulation active:scale-95"
          data-testid={`button-edit-${agent.id}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          onClick={handleClone}
          variant="outline"
          size="sm"
          disabled={cloneMutation.isPending}
          className="transition-all border-black-20 hover:border-black hover:bg-black-5 text-black h-9 w-9 p-0 touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid={`button-clone-${agent.id}`}
          title="Clone"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Clone</span>
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          size="sm"
          disabled={deleteMutation.isPending}
          className="transition-all border-black-20 hover:border-orange hover:bg-orange/10 hover:text-orange disabled:opacity-50 disabled:cursor-not-allowed text-black h-9 w-9 p-0 touch-manipulation active:scale-95"
          data-testid={`button-delete-${agent.id}`}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
