import { useQuery, useMutation } from "@tanstack/react-query";
import { Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExecutionDetailsPage() {
  const params = useParams();
  const executionId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: execution, isLoading, error } = useQuery<Execution>({
    queryKey: [`/api/executions/${executionId}`],
    queryFn: () => apiRequest("GET", `/api/executions/${executionId}`),
    enabled: !!executionId,
    refetchInterval: (query) => {
      // Poll if execution is still running
      const data = query?.state?.data;
      return data?.status === "running" ? 3000 : false;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!execution?.agentId) {
        throw new Error("Agent ID not found");
      }
      const newExecution = await apiRequest("POST", `/api/agents/${execution.agentId}/execute`);
      return newExecution as Execution;
    },
    onSuccess: (newExecution) => {
      queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
      toast({
        title: "Execution retried",
        description: "A new execution has been started.",
      });
      // Navigate to the new execution
      setLocation(`/executions/${newExecution.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to retry",
        description: error?.response?.data?.error || error?.message || "Could not retry execution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRetry = () => {
    if (execution?.status === "running") {
      toast({
        title: "Cannot retry",
        description: "This execution is still running. Please wait for it to complete.",
        variant: "destructive",
      });
      return;
    }
    retryMutation.mutate();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-white-subtle to-white-secondary overflow-hidden antialiased">
      {/* Header */}
      <header className="border-b border-black-10 bg-white/80 backdrop-blur-sm z-50 flex-shrink-0 shadow-sm">
        <div className="w-full px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/executions">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-black-5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <img 
              src="/logo.png" 
              alt="RAJAI Platform Logo" 
              className="h-10 w-10 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-bold text-black tracking-tight truncate">
                Execution Details
              </h1>
              <p className="font-sans text-xs text-black-60 font-medium mt-0.5 truncate hidden xs:block">
                  {execution?.agentName || "View execution results"}
                </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4">
                <p className="font-display font-semibold text-lg text-black mb-2">Failed to load execution</p>
                <p className="font-sans text-sm text-black-60">
                  {error instanceof Error ? error.message : "An unexpected error occurred"}
                </p>
              </div>
              <Link href="/executions">
                <Button variant="outline" className="border-black-20 hover:bg-black-5">Back to Executions</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange mx-auto" />
                <p className="text-sm font-medium text-black-60">Loading execution details...</p>
              </div>
            </div>
          ) : !execution ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="font-display text-base font-bold text-black mb-2">Execution not found</h3>
              <p className="font-sans text-sm text-black-60 mb-4">
                The execution you're looking for doesn't exist or has been deleted.
              </p>
              <Link href="/executions">
                <Button variant="outline" className="border-black-20 hover:bg-black-5">Back to Executions</Button>
              </Link>
            </div>
          ) : (
            <Card className="border border-black-10 shadow-sm bg-white">
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-bold text-black">
                      {execution.agentName}
                    </CardTitle>
                    <StatusBadge status={execution.status as "running" | "completed" | "failed"} />
                  </div>
                  {execution.status !== "running" && (
                    <Button
                      onClick={handleRetry}
                      disabled={retryMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-black-20 hover:bg-black-5"
                    >
                      <RotateCcw className={`h-4 w-4 ${retryMutation.isPending ? "animate-spin" : ""}`} />
                      {retryMutation.isPending ? "Retrying..." : "Retry"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <div>
                  <h4 className="font-sans text-sm font-semibold text-black mb-2">Created At</h4>
                  <p className="font-sans text-sm text-black-60">
                    {format(new Date(execution.createdAt), "PPP p")}
                  </p>
                </div>
                {execution.result && (
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-black mb-2">Result</h4>
                    <div className="bg-black-5 rounded-lg p-3 border border-black-10">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-words text-black-80 overflow-x-auto leading-relaxed">
                        {execution.result}
                      </pre>
                    </div>
                  </div>
                )}
                {!execution.result && execution.status === "running" && (
                  <div className="flex items-center gap-2 text-black-60">
                    <Loader2 className="h-4 w-4 animate-spin text-orange" />
                    <p className="font-sans text-sm">Execution in progress...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
