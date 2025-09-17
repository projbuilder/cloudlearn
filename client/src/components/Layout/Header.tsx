import React from 'react';
import { Cloud, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  title: string;
  subtitle: string;
  engagementLevel: string;
  onEngagementChange: (level: string) => void;
  onCloudSync: () => void;
}

export default function Header({
  title,
  subtitle,
  engagementLevel,
  onEngagementChange,
  onCloudSync
}: HeaderProps) {
  const { toast } = useToast();

  const handleCloudSync = async () => {
    toast({
      title: "Syncing to Cloud",
      description: "Uploading your learning data...",
    });

    // Simulate sync process
    setTimeout(() => {
      onCloudSync();
      toast({
        title: "Sync Complete",
        description: "Your data has been synchronized successfully!",
        variant: "default",
      });
    }, 2000);
  };

  const engagementOptions = [
    { value: 'low', label: 'Low', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-green-600' },
  ];

  const currentEngagement = engagementOptions.find(opt => opt.value === engagementLevel);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Engagement Simulation */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Engagement:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span className={currentEngagement?.color}>{currentEngagement?.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {engagementOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onEngagementChange(option.value)}
                    className={option.color}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Cloud Sync Button */}
          <Button 
            onClick={handleCloudSync}
            className="flex items-center space-x-2"
          >
            <Cloud className="w-4 h-4" />
            <span>Sync to Cloud</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
