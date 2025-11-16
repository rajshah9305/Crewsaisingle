import { useQuery } from "@tanstack/react-query";
import { Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function ExecutionDetailsPage() {
  const params = useParams();
  const executionId = params.id;

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

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden antialiased">
      {/* Header */}
      <header className="border-b border-black-10 bg-white z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/executions">
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
                Execution Details
              </h1>
              <p className="font-sans text-[10px] sm:text-xs text-black-60 font-medium mt-0.5 sm:mt-1 truncate hidden xs:block">
                  {execution?.agentName || "View execution results"}
                </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-white-secondary">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-red-600 mb-4">
                <p className="font-semibold text-lg">Failed to load execution</p>
                <p className="text-sm text-black-60 mt-2">
                  {error instanceof Error ? error.message : "An unexpected error occurred"}
                </p>
              </div>
              <Link href="/executions">
                <Button variant="outline">Back to Executions</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2 sm:space-y-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange mx-auto" />
                <p className="text-xs sm:text-sm font-medium text-black-60">Loading execution details...</p>
              </div>
            </div>
          ) : !execution ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="font-display text-base sm:text-lg font-bold text-black mb-2">Execution not found</h3>
              <p className="font-sans text-xs sm:text-sm text-black-60 mb-4">
                The execution you're looking for doesn't exist or has been deleted.
              </p>
              <Link href="/executions">
                <Button variant="outline">Back to Executions</Button>
              </Link>
            </div>
          ) : (
            <Card className="border border-black-10 shadow-sm bg-white">
              <CardHeader className="pb-3 px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 md:pt-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-black">
                    {execution.agentName}
                  </CardTitle>
                  <StatusBadge status={execution.status as "running" | "completed" | "failed"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                <div>
                  <h4 className="font-sans text-sm font-semibold text-black mb-2">Created At</h4>
                  <p className="font-sans text-xs sm:text-sm text-black-60">
                    {format(new Date(execution.createdAt), "PPP p")}
                  </p>
                </div>
                {execution.result && (
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-black mb-2">Result</h4>
                    <div className="bg-black-5 rounded-md sm:rounded-lg p-2.5 sm:p-3 md:p-4 border border-black-10">
                      <pre className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-pre-wrap break-words text-black-80 overflow-x-auto leading-relaxed">
                        {execution.result}
                      </pre>
                    </div>
                  </div>
                )}
                {!execution.result && execution.status === "running" && (
                  <div className="flex items-center gap-2 text-black-60">
                    <Loader2 className="h-4 w-4 animate-spin text-orange" />
                    <p className="font-sans text-xs sm:text-sm">Execution in progress...</p>
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
