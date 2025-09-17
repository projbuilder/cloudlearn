import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Server, 
  Activity, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudRegion {
  id: string;
  name: string;
  displayName: string;
  status: string;
  latency: number;
  load: number;
  activeUsers: number;
  workerNodes: number;
  updatedAt: string;
}

interface ServerlessJob {
  id: string;
  functionName: string;
  description: string;
  schedule?: string;
  lastInvocation?: string;
  status: string;
  concurrency: number;
  coldStart: boolean;
  avgDuration?: number;
}

export default function CloudOperations() {
  const [simulatedLoad, setSimulatedLoad] = React.useState([30]);
  const [workerCount, setWorkerCount] = React.useState([5]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/cloud/regions'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/cloud/jobs'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const updateRegionMutation = useMutation({
    mutationFn: async ({ regionId, updates }: { regionId: string; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/cloud/regions/${regionId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cloud/regions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update region status",
        variant: "destructive",
      });
    }
  });

  const invokeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest('POST', `/api/cloud/jobs/${jobId}/invoke`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Function Invoked",
        description: `${data.functionName} is now running`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cloud/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to invoke serverless function",
        variant: "destructive",
      });
    }
  });

  const handleFailoverSimulation = () => {
    toast({
      title: "Simulating Failover",
      description: "Initiating US-East-1 failure scenario...",
      variant: "destructive",
    });
    
    // Simulate region failure
    const usEastRegion = regions?.find((r: CloudRegion) => r.name === 'us-east-1');
    if (usEastRegion) {
      updateRegionMutation.mutate({
        regionId: usEastRegion.id,
        updates: { status: 'down', load: 0, activeUsers: 0 }
      });
    }

    setTimeout(() => {
      toast({
        title: "Failover Complete",
        description: "Traffic redirected to healthy regions",
      });
    }, 3000);
  };

  const handleLatencyInjection = () => {
    toast({
      title: "Injecting Network Latency",
      description: "Adding 200ms latency to EU-West-1...",
      variant: "destructive",
    });

    const euWestRegion = regions?.find((r: CloudRegion) => r.name === 'eu-west-1');
    if (euWestRegion) {
      updateRegionMutation.mutate({
        regionId: euWestRegion.id,
        updates: { latency: 350, status: 'degraded' }
      });
    }
  };

  const handleRestoreRegions = () => {
    toast({
      title: "Restoring All Regions",
      description: "Returning all regions to healthy state...",
    });

    regions?.forEach((region: CloudRegion) => {
      updateRegionMutation.mutate({
        regionId: region.id,
        updates: { 
          status: 'healthy', 
          latency: Math.floor(Math.random() * 50) + 20,
          load: Math.floor(Math.random() * 40) + 30,
          activeUsers: Math.floor(Math.random() * 1000) + 500
        }
      });
    });
  };

  const handleLoadChange = (value: number[]) => {
    setSimulatedLoad(value);
    toast({
      title: "Load Simulation Updated",
      description: `Simulated load set to ${value[0]}%`,
    });
  };

  const handleWorkerScaling = (value: number[]) => {
    setWorkerCount(value);
    toast({
      title: "Worker Scaling",
      description: `Scaling to ${value[0]} worker nodes`,
    });
  };

  const getRegionStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRegionStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Multi-Region Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {regionsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          regions?.map((region: CloudRegion) => (
            <Card key={region.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{region.displayName}</h3>
                  <div className="flex items-center space-x-2">
                    {getRegionStatusIcon(region.status)}
                    <Badge className={getRegionStatusColor(region.status)}>
                      {region.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Latency</span>
                    <span className={`font-medium ${
                      region.latency > 200 ? 'text-red-600' : 
                      region.latency > 100 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {region.latency}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Load</span>
                    <span className="font-medium">{region.load}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium">{region.activeUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Worker Nodes</span>
                    <span className="font-medium">{region.workerNodes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cloud Operations Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Operations Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Failover Controls */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Cloud className="w-4 h-4" />
                <span>Failover Simulation</span>
              </h4>
              <div className="space-y-4">
                <Button
                  onClick={handleFailoverSimulation}
                  variant="destructive"
                  className="w-full"
                  disabled={updateRegionMutation.isPending}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simulate US-East-1 Failure
                </Button>
                <Button
                  onClick={handleLatencyInjection}
                  variant="outline"
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  disabled={updateRegionMutation.isPending}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Inject Network Latency
                </Button>
                <Button
                  onClick={handleRestoreRegions}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  disabled={updateRegionMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Restore All Regions
                </Button>
              </div>
            </div>

            {/* Autoscaling Controls */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Autoscaling Simulation</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simulated Load
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={simulatedLoad}
                      onValueChange={handleLoadChange}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span className="font-medium">{simulatedLoad[0]}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Worker Instances
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={workerCount}
                      onValueChange={handleWorkerScaling}
                      min={1}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 node</span>
                      <span className="font-medium">{workerCount[0]} nodes</span>
                      <span>20 nodes</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Scaling Events (Last 5min)</p>
                  <div className="space-y-1 text-xs">
                    <div className="text-green-600 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Scaled up: +2 instances (load {'>'} 70%)</span>
                    </div>
                    <div className="text-gray-600 flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Health check passed for all nodes</span>
                    </div>
                    <div className="text-yellow-600 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Cold start detected: 2.3s delay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serverless Functions Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Serverless Functions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs?.map((job: ServerlessJob) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      job.functionName.includes('retrain') ? 'bg-blue-500' :
                      job.functionName.includes('risk') ? 'bg-orange-500' :
                      job.functionName.includes('ingest') ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {job.functionName.includes('retrain') ? (
                        <Zap className="w-5 h-5 text-white" />
                      ) : job.functionName.includes('risk') ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : job.functionName.includes('ingest') ? (
                        <Server className="w-5 h-5 text-white" />
                      ) : (
                        <Settings className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{job.functionName}</h4>
                      <p className="text-sm text-gray-600">{job.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Concurrency: {job.concurrency}
                        </span>
                        {job.avgDuration && (
                          <span className="text-xs text-gray-500">
                            Avg: {job.avgDuration.toFixed(1)}s
                          </span>
                        )}
                        {job.schedule && (
                          <span className="text-xs text-gray-500">
                            Schedule: {job.schedule}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getJobStatusIcon(job.status)}
                      <span className={`text-sm font-medium ${
                        job.status === 'running' ? 'text-blue-600' :
                        job.status === 'completed' ? 'text-green-600' :
                        job.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <Button
                      onClick={() => invokeJobMutation.mutate(job.id)}
                      disabled={job.status === 'running' || invokeJobMutation.isPending}
                      size="sm"
                    >
                      {job.status === 'running' ? 'Running...' : 'Invoke Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
