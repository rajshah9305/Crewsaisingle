import { useQuery } from "@tanstack/react-query";
import { Execution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams } from "wouter";

export default function ExecutionDetailsPage() {
  const params = useParams();
  const executionId = params.id;

  const { data: execution, isLoading, error } = useQuery<Execution>({
    queryKey: [`/api/executions/${executionId}`],
    enabled: !!executionId,
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/executions/${executionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden antialiased">
      {/* Header */}
      <header className="border-b border-black-10 bg-white z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href="/executions">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black tracking-tight truncate">
                  Execution Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-red-600 mb-4">
                <p className="font-semibold text-lg">Failed to load execution</p>
                <p className="text-sm text-black-60 mt-2">
                  {error instanceof Error ? error.message : "An unexpected error occurred"}
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center space-y-2 sm:space-y-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange mx-auto" />
                <p className="text-xs sm:text-sm font-medium text-black-60">Loading execution details...</p>
              </div>
            </div>
          ) : !execution ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-3 sm:px-4">
              <h3 className="font-display text-base sm:text-lg font-bold text-black mb-1.5 sm:mb-2">
                Execution not found
              </h3>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{execution.agentName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <StatusBadge status={execution.status as "running" | "completed" | "failed"} />
                </div>
                <div>
                  <h4 className="font-semibold">Created At</h4>
                  <p>{format(new Date(execution.createdAt), "PPP p")}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Result</h4>
                  <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                    {execution.result}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
