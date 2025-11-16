import { Agent, InsertAgent, insertAgentSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, type FieldArrayPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { TemplateSelector } from "@/components/template-selector";
import { useState } from "react";
import type { AgentTemplate } from "@/lib/agent-templates";

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent;
  template?: AgentTemplate;
}

export function AgentDialog({ open, onOpenChange, agent, template }: AgentDialogProps) {
  const { toast } = useToast();
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

  const form = useForm<InsertAgent>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues: agent ? {
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
      tasks: agent.tasks,
    } : template ? {
      name: template.agent.name,
      role: template.agent.role,
      goal: template.agent.goal,
      backstory: template.agent.backstory,
      tasks: template.agent.tasks,
    } : {
      name: "",
      role: "",
      goal: "",
      backstory: "",
      tasks: [""],
    },
  });

  const handleTemplateSelect = (selectedTemplate: AgentTemplate) => {
    form.reset({
      name: selectedTemplate.agent.name,
      role: selectedTemplate.agent.role,
      goal: selectedTemplate.agent.goal,
      backstory: selectedTemplate.agent.backstory,
      tasks: selectedTemplate.agent.tasks,
    });
    toast({
      title: "Template loaded",
      description: `${selectedTemplate.name} template has been loaded. You can customize it before creating.`,
    });
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks" as FieldArrayPath<InsertAgent>,
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertAgent) => {
      if (agent) {
        return await apiRequest("PATCH", `/api/agents/${agent.id}`, data);
      } else {
        return await apiRequest("POST", "/api/agents", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      const agentName = form.getValues("name");
      toast({
        title: agent ? "Agent updated" : "Agent created",
        description: `${agentName} has been ${agent ? "updated" : "created"} successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.message || `Failed to ${agent ? "update" : "create"} agent. Please try again.`;
      const errorDetails = error?.response?.data?.details;
      
      // Format Zod validation errors if present
      let detailsMessage = "";
      if (errorDetails && Array.isArray(errorDetails)) {
        const zodErrors = errorDetails.map((err: any) => 
          `${err.path.join(".")}: ${err.message}`
        ).join(", ");
        detailsMessage = zodErrors ? ` (${zodErrors})` : "";
      } else if (errorDetails) {
        detailsMessage = ` Details: ${JSON.stringify(errorDetails)}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage + detailsMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAgent) => {
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const filteredTasks = tasks.filter(task => typeof task === 'string' && task.trim() !== "");
    if (filteredTasks.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one non-empty task.",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("tasks", filteredTasks as any);
    mutation.mutate({ ...data, tasks: filteredTasks });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-agent">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{agent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
              <DialogDescription>
                {agent 
                  ? "Update the agent's configuration and tasks."
                  : "Configure your AI agent with a role, goal, and specific tasks to execute."}
              </DialogDescription>
            </div>
            {!agent && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTemplateSelectorOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Templates
              </Button>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Content Writer, Research Analyst" 
                      {...field}
                      data-testid="input-agent-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Senior Content Strategist" 
                      {...field}
                      data-testid="input-agent-role"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is this agent trying to achieve?"
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-agent-goal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backstory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backstory</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide context about this agent's expertise and background"
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-agent-backstory"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tasks</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append("")}
                  data-testid="button-add-task"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Task
                </Button>
              </div>
              
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`tasks.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder={`Task ${index + 1}`}
                              {...field}
                              value={typeof field.value === 'string' ? field.value : ''}
                              data-testid={`input-task-${index}`}
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => remove(index)}
                              data-testid={`button-remove-task-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <TemplateSelector
          open={templateSelectorOpen}
          onOpenChange={setTemplateSelectorOpen}
          onSelectTemplate={handleTemplateSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
