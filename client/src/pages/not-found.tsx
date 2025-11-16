import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-white-subtle to-white-secondary p-4">
      <Card className="w-full max-w-md border border-black-10 shadow-sm bg-white">
        <CardContent className="pt-6 pb-6 px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center border border-black-10 shadow-sm">
              <AlertCircle className="h-8 w-8 text-orange" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-black mb-2">404</h1>
          <h2 className="font-display text-xl font-semibold text-black mb-4">Page Not Found</h2>
          <p className="font-sans text-sm text-black-60 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button className="bg-orange hover:bg-orange-hover text-white shadow-sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
