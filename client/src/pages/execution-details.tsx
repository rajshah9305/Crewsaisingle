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
  });

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden antialiased">
      <header className="border-b border-gray-200 bg-white z-50 flex-shrink-0">
        <div className="w-full px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/executions">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-black">
              Execution Details
            </h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold">Failed to load execution</p>
            <p className="text-sm text-gray-600 mt-2">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : !execution ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold">Execution not found</h3>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{execution.agentName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <StatusBadge status={execution.status as "running" | "completed" | "failed"} />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Created At</h4>
                <p className="text-sm">{format(new Date(execution.createdAt), "PPP p")}</p>
              </div>
              {execution.result && (
                <div>
                  <h4 className="font-semibold mb-2">Result</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                      {execution.result}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
