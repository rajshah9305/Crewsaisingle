import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AgentDialog } from "@/components/agent-dialog";
import { agentTemplates, templateCategories, type AgentTemplate } from "@/lib/agent-templates";
import { Search, Sparkles, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | undefined>();
  const { toast } = useToast();

  const filteredTemplates = agentTemplates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleCreateFromScratch = () => {
    setSelectedTemplate(undefined);
    setDialogOpen(true);
  };

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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange/15 to-orange/5 flex items-center justify-center border border-orange/30 flex-shrink-0 shadow-sm">
                <Sparkles className="h-6 w-6 text-orange" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-black text-black tracking-tight leading-none mb-1">
                  Agent Templates
                </h1>
                <p className="font-sans text-sm text-black-60 font-semibold tracking-wide">
                  Choose from pre-built templates or create your own
                </p>
              </div>
            </div>
            <Button 
              onClick={handleCreateFromScratch}
              size="sm"
              className="bg-orange hover:bg-orange-hover text-white font-bold text-sm h-10 px-5 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-black-10 bg-white-subtle">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black-40" />
            <Input
              placeholder="Search templates by name, description, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 text-sm font-medium border-black-20 focus:border-orange"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templateCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-orange hover:bg-orange-hover text-white border-orange font-bold shadow-md"
                    : "border-black-20 hover:bg-black-5 hover:border-black-40 text-sm h-10 px-4 font-semibold transition-all"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center border border-black-10 shadow-sm mb-4">
                <Search className="h-8 w-8 text-black-40" />
              </div>
              <h3 className="font-display text-base font-bold text-black mb-2">
                No Templates Found
              </h3>
              <p className="font-sans text-sm text-black-60 max-w-md leading-relaxed mb-4">
                Try adjusting your search or filter criteria to find templates.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                variant="outline"
                className="border-black-20 hover:bg-black-5"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-sans text-sm text-black-60">
                  {filteredTemplates.length} {filteredTemplates.length === 1 ? "template" : "templates"} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="border border-black-10 shadow-md hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group hover:border-orange/40 hover:-translate-y-1"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-4 px-5 pt-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-3xl flex-shrink-0">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-black text-black line-clamp-1 group-hover:text-orange transition-colors">
                              {template.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-black-60 line-clamp-2 mt-1.5 font-medium">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-black-20 text-black-60 flex-shrink-0 font-semibold">
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-5 pb-5 space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-black text-black-60 uppercase tracking-wider">
                          Role
                        </div>
                        <p className="text-sm text-black-80 font-semibold">
                          {template.agent.role}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black text-black-60 uppercase tracking-wider">
                          Tasks ({template.agent.tasks.length})
                        </div>
                        <ul className="list-disc list-inside space-y-1.5">
                          {template.agent.tasks.slice(0, 3).map((task, idx) => (
                            <li key={idx} className="text-sm text-black-60 line-clamp-1 font-medium">
                              {task}
                            </li>
                          ))}
                          {template.agent.tasks.length > 3 && (
                            <li className="text-sm text-black-40 font-semibold">
                              +{template.agent.tasks.length - 3} more tasks
                            </li>
                          )}
                        </ul>
                      </div>
                      <Button
                        className="w-full bg-orange hover:bg-orange-hover text-white font-bold text-sm h-10 shadow-md hover:shadow-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AgentDialog
        key={selectedTemplate?.id || "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedTemplate(undefined);
          }
        }}
        template={selectedTemplate}
      />
    </div>
  );
}

