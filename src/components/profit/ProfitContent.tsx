import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { profitApi } from "@/services/profitApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Star,
  Clock,
  RefreshCw
} from "lucide-react";
import ProfitMainChart from "@/components/profit/ProfitMainChart";
import { PeriodComparisonChart } from "@/components/profit/PeriodComparisonChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('PKR', 'Rs ');
};

// Overview Cards Component
const OverviewCards = () => {
  const { data: periodComparison, isLoading: periodLoading } = useQuery({
    queryKey: ['profit-period-comparison'],
    queryFn: profitApi.getPeriodComparison,
  });

  const { data: ytdSummary, isLoading: ytdLoading } = useQuery({
    queryKey: ['profit-ytd-summary'],
    queryFn: profitApi.getYTDSummary,
  });

  const isLoading = periodLoading || ytdLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const todayData = periodComparison?.find(p => p.period === 'today');
  const lastWeekData = periodComparison?.find(p => p.period === 'last_week');
  const last30DaysData = periodComparison?.find(p => p.period === 'last_30_days');
  
  const todayProfit = parseFloat(todayData?.profit || '0');
  const lastWeekProfit = parseFloat(lastWeekData?.profit || '0');
  const lastMonthProfit = parseFloat(last30DaysData?.profit || '0');
  const ytdProfit = parseFloat(ytdSummary?.ytd_profit || '0');
  
  const todayRevenue = parseFloat(todayData?.revenue || '0');
  const lastWeekRevenue = parseFloat(lastWeekData?.revenue || '0');
  const lastMonthRevenue = parseFloat(last30DaysData?.revenue || '0');
  const ytdRevenue = parseFloat(ytdSummary?.ytd_revenue || '0');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Today's Profit</CardTitle>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(todayProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3 w-3 inline mr-1" />
              Live tracking
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
              Rev: {formatCurrency(todayRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Last Week Profit</CardTitle>
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {formatCurrency(lastWeekProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Previous week
            </p>
            <p className="text-xs text-amber-500 dark:text-amber-400 font-medium">
              Rev: {formatCurrency(lastWeekRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Last Month Profit</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(lastMonthProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Last 30 days
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
              Rev: {formatCurrency(lastMonthRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">YTD Profit</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
            <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(ytdProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Year to date
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">
              Rev: {formatCurrency(ytdRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = () => {
  const { data: dailyPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['profit-daily-performance'],
    queryFn: profitApi.getDailyPerformance,
  });

  const { data: weekComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['profit-week-comparison'],
    queryFn: profitApi.getWeekComparison,
  });

  const { data: targetAchievement, isLoading: targetLoading } = useQuery({
    queryKey: ['profit-target-achievement'],
    queryFn: profitApi.getTargetAchievement,
  });

  if (performanceLoading || comparisonLoading || targetLoading) {
    return <div className="space-y-3">Loading performance data...</div>;
  }

  const actualProfit = parseFloat(dailyPerformance?.actual_profit || '0');
  const targetProfit = parseFloat(dailyPerformance?.target_profit || '0');
  const achievementPercent = targetProfit > 0 ? (actualProfit / targetProfit) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-950 dark:via-blue-950 dark:to-purple-950 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Target className="h-6 w-6 text-emerald-600" />
              Today's Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" className="opacity-20" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#targetGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(achievementPercent * 3.14, 314)} 314`} className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {achievementPercent.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">Achievement</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Actual</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(actualProfit)}</p>
                </div>
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Target</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(targetProfit)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Week Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekComparison && weekComparison.length >= 2 && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    formatter={(value) => [formatCurrency(value as number), 'Profit']} 
                  />
                  <Bar dataKey="profit" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-slate-600 to-zinc-600 bg-clip-text text-transparent">
            Target Achievement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {targetAchievement?.map((target, index) => {
              const actual = parseFloat(target.actual_profit);
              const targetValue = parseFloat(target.target_profit);
              const percent = targetValue > 0 ? (actual / targetValue) * 100 : 0;
              
              const bgColors = [
                'from-emerald-50 to-cyan-50 dark:from-emerald-950 dark:to-cyan-950',
                'from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950',
                'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'
              ];

              return (
                <div key={index} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgColors[index]} border border-white/20 shadow-lg p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="capitalize">{target.period}</Badge>
                    <span className="text-lg font-bold">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actual</span>
                      <span className="font-medium">{formatCurrency(actual)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">{formatCurrency(targetValue)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function ProfitContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: periodComparison, isLoading: periodLoading } = useQuery({
    queryKey: ['profit-period-comparison'],
    queryFn: profitApi.getPeriodComparison,
  });

  const handleBackfill = async () => {
    setIsSyncing(true);
    try {
      await profitApi.backfillProfitData();
      toast({
        title: "Data Synced",
        description: "Profit data has been recalculated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['profit-period-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['profit-key-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['profit-ytd-summary'] });
      queryClient.invalidateQueries({ queryKey: ['profit-daily-performance'] });
      queryClient.invalidateQueries({ queryKey: ['profit-week-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['profit-target-achievement'] });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync profit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Profit Analytics
          </h2>
        </div>
        <Button 
          onClick={handleBackfill} 
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      <OverviewCards />
      <PeriodComparisonChart data={periodComparison || []} isLoading={periodLoading} />
      <ProfitMainChart />
      <PerformanceTab />
    </div>
  );
}
