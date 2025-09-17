import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NextBestModuleProps {
  module: {
    title: string;
    description: string;
    difficulty: number;
    estimatedTime: number;
    masteryGain: number;
    reason: string;
  };
  onStartModule: () => void;
}

export default function NextBestModule({ module, onStartModule }: NextBestModuleProps) {
  const getDifficultyDots = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < difficulty ? 'bg-yellow-400' : 'bg-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">Next Best Module</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:text-gray-200 hover:bg-white/10">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                This recommendation is based on your current mastery levels, 
                recent performance, and learning velocity using our contextual bandit algorithm.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-lg mb-2">{module.title}</h4>
          <p className="text-sm opacity-90 mb-4">{module.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold mb-1">Difficulty</div>
              <div className="flex items-center justify-center space-x-1">
                {getDifficultyDots(module.difficulty)}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 flex items-center justify-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Est. Time</span>
              </div>
              <div className="text-lg font-bold">{module.estimatedTime} min</div>
            </div>
            <div>
              <div className="font-semibold mb-1 flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Mastery Gain</span>
              </div>
              <div className="text-lg font-bold">+{module.masteryGain}%</div>
            </div>
          </div>
        </div>
        
        <div className="text-xs opacity-75 mb-4 flex items-center space-x-1">
          <BarChart3 className="w-3 h-3" />
          <span>{module.reason}</span>
        </div>
        
        <Button 
          onClick={onStartModule}
          className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
        >
          Start Learning
        </Button>
      </CardContent>
    </Card>
  );
}
