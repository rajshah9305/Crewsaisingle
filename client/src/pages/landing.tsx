import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Bot, 
  Rocket,
  CheckCircle,
  ArrowRight,
  Github,
  Star
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Bot className="w-6 h-6 text-orange-500" />,
      title: "AI-Powered Agents",
      description: "Create intelligent agents with custom roles, goals, and tasks powered by Google Gemini 2.5 Flash"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      title: "Lightning Fast",
      description: "Asynchronous execution with real-time tracking and instant results"
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-500" />,
      title: "Enterprise Security",
      description: "Built-in rate limiting, CORS protection, and comprehensive input validation"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: "Scalable Architecture",
      description: "Serverless deployment on Vercel with PostgreSQL for reliable data persistence"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Team Collaboration",
      description: "Manage multiple agents, organize workflows, and track execution history"
    },
    {
      icon: <Rocket className="w-6 h-6 text-orange-500" />,
      title: "Production Ready",
      description: "TypeScript, comprehensive error handling, and structured logging out of the box"
    }
  ];

  const useCases = [
    "Content Creation & Marketing",
    "Code Review & Development",
    "Data Analysis & Research",
    "Customer Support Automation",
    "Report Generation",
    "Task Automation"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Google Gemini 2.5 Flash
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              RAJAI Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade AI agent orchestration platform. Create, manage, and execute intelligent agents with defined roles and tasks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <a href="https://github.com/rajshah9305/Crewsaisingle" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-orange-200 hover:border-orange-400">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Production Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build and deploy intelligent AI agents at scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-orange-50 rounded-lg w-fit mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Built for Every Use Case
            </h2>
            <p className="text-lg text-orange-100 text-center mb-8">
              From content creation to code review, RAJAI adapts to your workflow
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {useCases.map((useCase, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Star className="w-5 h-5 text-orange-200" />
                  <span className="font-medium">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-sm text-muted-foreground">TypeScript</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground">Build Errors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Possibilities</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">⚡</div>
            <div className="text-sm text-muted-foreground">Lightning Fast</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 pb-24">
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Deploy your first AI agent in minutes. No credit card required.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-6 text-lg">
                Launch Dashboard
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-orange-100 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 RAJAI Platform. Built with ❤️ using React, TypeScript, and Google Gemini.
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/rajshah9305/Crewsaisingle" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                GitHub
              </a>
              <Link href="/dashboard">
                <a className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                  Dashboard
                </a>
              </Link>
              <Link href="/agents">
                <a className="text-sm text-muted-foreground hover:text-orange-600 transition-colors">
                  Agents
                </a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
