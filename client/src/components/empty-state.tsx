import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateAgent: () => void;
}

export function EmptyState({ onCreateAgent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-3 sm:px-4 text-center">
      <div className="relative mb-4 sm:mb-5 md:mb-6">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-black-5 flex items-center justify-center border border-black-10">
          <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-black-40" />
        </div>
      </div>
      
      <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-black tracking-tight">No Agents Yet</h2>
      <p className="font-sans text-xs sm:text-sm text-black-60 max-w-xs sm:max-w-md mb-5 sm:mb-6 leading-relaxed">
        Create your first AI agent to get started. Define its role, goal, and tasks to enable autonomous execution powered by Gemini AI.
      </p>
      
      <Button 
        onClick={onCreateAgent} 
        size="lg" 
        className="bg-orange hover:bg-orange-hover text-white font-semibold transition-all h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm touch-manipulation active:scale-95 w-full sm:w-auto" 
        data-testid="button-create-first-agent"
      >
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
        Create Your First Agent
      </Button>
      
      <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl text-left">
        <div className="space-y-2 sm:space-y-2.5 p-4 sm:p-5 rounded-lg bg-white border border-black-10 hover:border-black-20 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 font-bold text-black text-sm sm:text-base">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-black-5 flex items-center justify-center border border-black-10 flex-shrink-0">
              <span className="text-black font-bold text-sm sm:text-base">1</span>
            </div>
            <span>Define Agent</span>
          </div>
          <p className="text-xs sm:text-sm text-black-60 leading-relaxed">
            Configure the agent's name, role, goal, and backstory
          </p>
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 p-4 sm:p-5 rounded-lg bg-white border border-black-10 hover:border-black-20 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 font-bold text-black text-sm sm:text-base">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-black-5 flex items-center justify-center border border-black-10 flex-shrink-0">
              <span className="text-black font-bold text-sm sm:text-base">2</span>
            </div>
            <span>Add Tasks</span>
          </div>
          <p className="text-xs sm:text-sm text-black-60 leading-relaxed">
            Specify the tasks for your agent to execute autonomously
          </p>
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 p-4 sm:p-5 rounded-lg bg-white border border-black-10 hover:border-black-20 hover:shadow-sm transition-all sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 sm:gap-3 font-bold text-black text-sm sm:text-base">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-black-5 flex items-center justify-center border border-black-10 flex-shrink-0">
              <span className="text-black font-bold text-sm sm:text-base">3</span>
            </div>
            <span>Execute & Monitor</span>
          </div>
          <p className="text-xs sm:text-sm text-black-60 leading-relaxed">
            Run your agent and view real-time results and responses
          </p>
        </div>
      </div>
    </div>
  );
}
