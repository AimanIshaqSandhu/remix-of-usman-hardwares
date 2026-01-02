import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Brain, Clock, TrendingUp, Target, Activity } from "lucide-react";

const TrainingDashboard = () => {
  // Simulated training data
  const trainingData = Array.from({ length: 50 }, (_, i) => ({
    epoch: i + 1,
    trainLoss: 0.8 - (i * 0.015) + Math.random() * 0.05,
    valLoss: 0.85 - (i * 0.013) + Math.random() * 0.06,
    trainAcc: 0.6 + (i * 0.007) + Math.random() * 0.02,
    valAcc: 0.58 + (i * 0.006) + Math.random() * 0.025,
  }));

  const currentEpoch = 50;
  const totalEpochs = 100;
  const progress = (currentEpoch / totalEpochs) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor real-time training metrics and performance
          </p>
        </div>
        <Badge className="bg-success text-success-foreground">
          <Activity className="w-3 h-3 mr-1" />
          Training Active
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Epoch</CardDescription>
            <CardTitle className="text-3xl">{currentEpoch}/{totalEpochs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Training Accuracy</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              86.4%
              <TrendingUp className="w-5 h-5 ml-2 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+2.3% from last epoch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Validation Loss</CardDescription>
            <CardTitle className="text-3xl">0.234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Decreasing steadily</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. Time Remaining</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              24m
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">~29 sec per epoch</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loss Over Time</CardTitle>
            <CardDescription>Training and validation loss per epoch</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="epoch" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="trainLoss" 
                  stroke="hsl(var(--primary))" 
                  name="Training Loss"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="valLoss" 
                  stroke="hsl(var(--accent))" 
                  name="Validation Loss"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy Over Time</CardTitle>
            <CardDescription>Training and validation accuracy per epoch</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="epoch" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
                  domain={[0.5, 1]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="trainAcc" 
                  stroke="hsl(var(--success))" 
                  name="Training Accuracy"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="valAcc" 
                  stroke="hsl(var(--warning))" 
                  name="Validation Accuracy"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Model Configuration</CardTitle>
          </div>
          <CardDescription>Current training setup and parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Architecture</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Model Type</dt>
                  <dd className="font-medium">CNN</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Task</dt>
                  <dd className="font-medium">Cancer Stage</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Data Type</dt>
                  <dd className="font-medium">Images</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Hyperparameters</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Learning Rate</dt>
                  <dd className="font-medium">0.001</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Batch Size</dt>
                  <dd className="font-medium">32</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Optimizer</dt>
                  <dd className="font-medium">Adam</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Dataset</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Training Set</dt>
                  <dd className="font-medium">120 images</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Validation Set</dt>
                  <dd className="font-medium">30 images</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Test Set</dt>
                  <dd className="font-medium">22 images</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingDashboard;
