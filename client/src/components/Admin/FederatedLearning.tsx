import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Shield, Zap, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FLRound {
  id: string;
  roundNum: number;
  clientCount: number;
  participatingClients: number;
  dpEpsilon: number;
  status: string;
  globalMetrics?: any;
  startedAt: string;
  completedAt?: string;
}

interface FLClient {
  id: string;
  nodeId: string;
  region: string;
  status: string;
  lastSeen: string;
  totalRounds: number;
  avgLatency?: number;
}

export default function FederatedLearning() {
  const [clientCount, setClientCount] = React.useState(8);
  const [dpEpsilon, setDpEpsilon] = React.useState([3.0]);
  const [participationRate, setParticipationRate] = React.useState([0.8]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['/api/fl/rounds'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/fl/clients'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const startRoundMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/fl/rounds', params);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "FL Training Round Started",
        description: `Round #${data.roundNum} initiated with ${data.clientCount} clients`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fl/rounds'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start FL training round",
        variant: "destructive",
      });
    }
  });

  const handleStartRound = () => {
    startRoundMutation.mutate({
      clientCount,
      dpEpsilon: dpEpsilon[0],
      participationRate: participationRate[0]
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'slow':
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'dropout':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'slow':
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      case 'dropout':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentRound = rounds?.[0];
  const activeClients = clients?.filter((c: FLClient) => c.status === 'active').length || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Round</p>
                <p className="text-2xl font-bold">#{currentRound?.roundNum || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Privacy Budget</p>
                <p className="text-2xl font-bold">
                  {currentRound?.globalMetrics?.privacyBudgetUsed 
                    ? `${Math.round(currentRound.globalMetrics.privacyBudgetUsed * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Model Accuracy</p>
                <p className="text-2xl font-bold">
                  {currentRound?.globalMetrics?.accuracy 
                    ? `${Math.round(currentRound.globalMetrics.accuracy * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FL Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Clients
              </label>
              <Select value={clientCount.toString()} onValueChange={(value) => setClientCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 clients</SelectItem>
                  <SelectItem value="8">8 clients</SelectItem>
                  <SelectItem value="16">16 clients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Differential Privacy (ε)
              </label>
              <div className="space-y-2">
                <Slider
                  value={dpEpsilon}
                  onValueChange={setDpEpsilon}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>High Privacy</span>
                  <span className="font-medium">ε = {dpEpsilon[0].toFixed(1)}</span>
                  <span>High Utility</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Participation Rate
              </label>
              <div className="space-y-2">
                <Slider
                  value={participationRate}
                  onValueChange={setParticipationRate}
                  min={0.5}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>50%</span>
                  <span className="font-medium">{Math.round(participationRate[0] * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartRound}
              disabled={startRoundMutation.isPending}
              className="w-full"
            >
              {startRoundMutation.isPending ? 'Starting Round...' : 'Start FL Training Round'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRound ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Round Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(currentRound.status)}
                    <Badge className={getStatusColor(currentRound.status)}>
                      {currentRound.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Participating Clients</span>
                  <span className="font-medium">
                    {currentRound.participatingClients || 0}/{currentRound.clientCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Privacy Epsilon</span>
                  <span className="font-medium">ε = {currentRound.dpEpsilon?.toFixed(1) || 'N/A'}</span>
                </div>

                {currentRound.globalMetrics && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Convergence</span>
                      <span className="font-medium">
                        {currentRound.globalMetrics.convergence ? 'Detected' : 'In Progress'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Latency</span>
                      <span className="font-medium">
                        {Math.round(currentRound.globalMetrics.avgLatency || 0)}ms
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Started: {new Date(currentRound.startedAt).toLocaleString()}
                  </p>
                  {currentRound.completedAt && (
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(currentRound.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No active training round</p>
                <p className="text-sm text-gray-400 mt-1">Start a new round to see status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FL Nodes Network */}
      <Card>
        <CardHeader>
          <CardTitle>Federated Learning Network</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {clients?.map((client: FLClient) => (
                <div
                  key={client.id}
                  className={`fl-node p-4 bg-white border-2 rounded-lg text-center ${
                    client.status === 'active' ? 'border-green-200' :
                    client.status === 'slow' ? 'border-yellow-200' :
                    client.status === 'dropout' ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    client.status === 'active' ? 'bg-green-500' :
                    client.status === 'slow' ? 'bg-yellow-500' :
                    client.status === 'dropout' ? 'bg-red-500' : 'bg-gray-500'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {client.nodeId.split('-')[1]?.toUpperCase() || 'N'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{client.nodeId}</p>
                  <p className="text-xs text-gray-500">{client.region}</p>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {getStatusIcon(client.status)}
                    <span className={`text-xs capitalize ${
                      client.status === 'active' ? 'text-green-600' :
                      client.status === 'slow' ? 'text-yellow-600' :
                      client.status === 'dropout' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  {client.avgLatency && (
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(client.avgLatency)}ms
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Rounds History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Training Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          {roundsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {rounds?.slice(0, 10).map((round: FLRound) => (
                <div key={round.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">#{round.roundNum}</span>
                    </div>
                    <div>
                      <p className="font-medium">Round {round.roundNum}</p>
                      <p className="text-sm text-gray-600">
                        {round.participatingClients || round.clientCount} clients • ε = {round.dpEpsilon?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(round.status)}
                      <Badge className={getStatusColor(round.status)}>
                        {round.status}
                      </Badge>
                    </div>
                    {round.globalMetrics?.accuracy && (
                      <p className="text-sm text-gray-600">
                        Accuracy: {Math.round(round.globalMetrics.accuracy * 100)}%
                      </p>
                    )}
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
