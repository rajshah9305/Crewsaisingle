import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { agentTemplates, templateCategories, type AgentTemplate } from "@/lib/agent-templates";
import { Search, Sparkles } from "lucide-react";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: AgentTemplate) => void;
}

export function TemplateSelector({ open, onOpenChange, onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = agentTemplates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange" />
            Agent Templates Library
          </DialogTitle>
          <DialogDescription>
            Choose from pre-built agent templates to get started quickly
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-black-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-40" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templateCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-orange hover:bg-orange-hover text-white" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-black-60">No templates found matching your search.</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border border-black-10 hover:border-orange/30"
                  onClick={() => {
                    onSelectTemplate(template);
                    onOpenChange(false);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-bold text-black line-clamp-1">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-black-60 line-clamp-2 mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-black-20 text-black-60 flex-shrink-0">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-black-80">
                      <div className="font-semibold mb-1">Tasks:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {template.agent.tasks.slice(0, 3).map((task, idx) => (
                          <li key={idx} className="line-clamp-1">{task}</li>
                        ))}
                        {template.agent.tasks.length > 3 && (
                          <li className="text-black-60">+{template.agent.tasks.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

