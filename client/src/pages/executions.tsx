import { useQuery } from "@tanstack/react-query";
import { Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loader2, Bot, ArrowLeft, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function ExecutionsPage() {
  const { data: executionsData, isLoading, error } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
    queryFn: () => apiRequest("GET", "/api/executions"),
    refetchInterval: (query) => {
      const data = query?.state?.data;
      const hasRunningExecutions = Array.isArray(data) && data.some(exec => exec.status === "running");
      return hasRunningExecutions ? 3000 : false;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Ensure executions is always an array
  const executions = Array.isArray(executionsData) ? executionsData : [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
  };

  const runningCount = executions.filter(e => e.status === "running").length;
  const completedCount = executions.filter(e => e.status === "completed").length;
  const failedCount = executions.filter(e => e.status === "failed").length;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-white-subtle to-white-secondary overflow-hidden antialiased">
      {/* Header */}
      <header className="border-b border-black-10 bg-white/95 backdrop-blur-md z-50 flex-shrink-0 shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-black-5 rounded-lg">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <img 
                src="/logo.png" 
                alt="RAJAI Platform Logo" 
                className="h-12 w-12 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-black text-black tracking-tight leading-none mb-1">
                  Execution History
                </h1>
                <p className="font-sans text-sm text-black-60 font-semibold tracking-wide">
                  Monitor and review agent execution results
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Stats Bar */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-black-10 bg-white-subtle">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-lg font-black text-black">
                  All Executions
                </h2>
                {executions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black-10 shadow-sm">
                      <span className="text-xs font-bold text-black-60 uppercase tracking-wider">Total:</span>
                      <span className="text-sm font-black text-black">{executions.length}</span>
                    </div>
                    {runningCount > 0 && (
                      <StatusBadge status="running" />
                    )}
                    {completedCount > 0 && (
                      <StatusBadge status="completed" />
                    )}
                    {failedCount > 0 && (
                      <StatusBadge status="failed" />
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="h-10 px-4 text-sm font-semibold border-black-20 hover:bg-black-5 hover:border-black-40 transition-all"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-[1200px] mx-auto px-6 py-6">
              {error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4">
                    <p className="font-display font-semibold text-lg text-black mb-2">Failed to load executions</p>
                    <p className="font-sans text-sm text-black-60">
                      {error instanceof Error ? error.message : "An unexpected error occurred"}
                    </p>
                  </div>
                  <Button onClick={handleRefresh} className="bg-orange hover:bg-orange-hover text-white shadow-sm">
                    Retry
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-orange mx-auto" />
                    <p className="text-sm font-medium text-black-60">Loading executions...</p>
                  </div>
                </div>
              ) : executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center border border-black-10 shadow-sm mb-4">
                    <Bot className="h-8 w-8 text-black-40" />
                  </div>
                  <h3 className="font-display text-base font-bold text-black mb-2">
                    No Executions Yet
                  </h3>
                  <p className="font-sans text-sm text-black-60 max-w-md leading-relaxed mb-4">
                    Execute an agent to see real-time results and outputs here.
                  </p>
                  <Link href="/agents">
                    <Button className="bg-orange hover:bg-orange-hover text-white shadow-sm">
                      Go to Agents
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <Link key={execution.id} href={`/executions/${execution.id}`}>
                      <Card 
                        data-testid={`execution-${execution.id}`} 
                        className="border border-black-10 shadow-md hover:shadow-lg transition-all duration-300 bg-white cursor-pointer hover:border-orange/30 hover:-translate-y-0.5"
                      >
                        <CardHeader className="pb-4 px-5 pt-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <CardTitle 
                                  className="text-lg font-black text-black truncate" 
                                  data-testid={`text-execution-agent-${execution.id}`}
                                >
                                  {execution.agentName}
                                </CardTitle>
                                <StatusBadge status={execution.status as "running" | "completed" | "failed"} />
                              </div>
                              <CardDescription className="text-sm font-semibold text-black-60 truncate">
                                {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        {execution.result && (
                          <CardContent className="pt-0 px-5 pb-5">
                            <div className="bg-black-5 rounded-xl p-4 border border-black-10">
                              <pre 
                                className="font-mono text-sm whitespace-pre-wrap break-words text-black-80 overflow-x-auto leading-relaxed" 
                                data-testid={`text-execution-result-${execution.id}`}
                              >
                                {execution.result}
                              </pre>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
