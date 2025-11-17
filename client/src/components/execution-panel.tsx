import { Execution } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExecutionPanelProps {
  executions: Execution[];
  isLoading?: boolean;
}

export function ExecutionPanel({ executions, isLoading }: ExecutionPanelProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Execution Results
          </CardTitle>
          <CardDescription className="text-sm font-medium">Loading execution history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (executions.length === 0) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-2xl font-bold tracking-tight">Execution Results</CardTitle>
          <CardDescription className="text-sm font-medium">Real-time agent execution and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-lg">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">No executions yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Execute an agent to see its results and performance here. Click the "Execute" button on any agent card to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/50 sticky top-24">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-2xl font-bold tracking-tight">Execution Results</CardTitle>
        <CardDescription className="text-sm font-medium">
          {executions.length} execution{executions.length !== 1 ? "s" : ""} recorded
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="p-4 space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id} data-testid={`execution-${execution.id}`} className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-bold" data-testid={`text-execution-agent-${execution.id}`}>
                          {execution.agentName}
                        </CardTitle>
                        {execution.status === "running" && (
                          <Badge variant="outline" className="gap-1.5 border-primary/50 text-primary shadow-sm">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running
                          </Badge>
                        )}
                        {execution.status === "completed" && (
                          <Badge variant="default" className="gap-1.5 bg-secondary hover:bg-secondary shadow-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {execution.status === "failed" && (
                          <Badge variant="destructive" className="gap-1.5 shadow-sm">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs font-medium">
                        {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {execution.result && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                      <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/90" data-testid={`text-execution-result-${execution.id}`}>
                        {execution.result}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
