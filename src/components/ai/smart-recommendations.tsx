'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lightbulb, Package, AlertCircle, CheckCircle, RefreshCw, Sparkles, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  medicationId: string;
  medicationName: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  recommendation: {
    action: 'reorder' | 'reduce' | 'maintain';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    quantity?: number;
  };
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'reorder': return <TrendingUp className="h-4 w-4" />;
    case 'reduce': return <TrendingDown className="h-4 w-4" />;
    case 'maintain': return <CheckCircle className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

const getActionStyles = (action: string) => {
  switch (action) {
    case 'reorder': return {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-100',
      icon: 'text-teal-600'
    };
    case 'reduce': return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      icon: 'text-amber-600'
    };
    case 'maintain': return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-100',
      icon: 'text-green-600'
    };
    default: return {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-100',
      icon: 'text-gray-600'
    };
  }
};

const RecommendationItem = ({ rec }: { rec: Recommendation }) => {
  const styles = getActionStyles(rec.recommendation.action);
  return (
    <div className="p-4 hover:bg-gray-50/50 transition-colors group cursor-pointer border-b border-gray-50 last:border-0">
      <div className="flex gap-3">
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", styles.bg)}>
          <div className={styles.icon}>{getActionIcon(rec.recommendation.action)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {rec.medicationName}
            </h4>
            {rec.recommendation.priority === 'high' && (
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5" title="High Priority" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {rec.recommendation.recommendation}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-normal border-0 bg-opacity-50", styles.bg, styles.text)}>
              {rec.recommendation.action}
            </Badge>
            <span className="text-[10px] text-gray-400">
              Stock: {rec.currentStock}
            </span>
          </div>
        </div>
        <div className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/recommendations');
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="border-none shadow-md bg-white h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Insights
              </CardTitle>
              <CardDescription>Analyzing inventory patterns...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-100 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md bg-white h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Sparkles className="h-5 w-5 text-purple-600 fill-purple-100" />
              AI Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Smart suggestions based on your data
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshRecommendations}
            disabled={refreshing}
            className="h-8 w-8 text-gray-400 hover:text-primary"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Inventory Optimized</h3>
            <p className="text-xs text-gray-500">No actions needed right now.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="divide-y divide-gray-50">
              {recommendations.slice(0, 2).map((rec, index) => (
                <RecommendationItem key={index} rec={rec} />
              ))}
            </div>
            
            {recommendations.length > 2 && (
              <div className="mt-auto p-3 border-t border-gray-50 bg-gray-50/30">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary/80 h-8 font-medium">
                      View All {recommendations.length} Insights
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
                      <DialogTitle className="flex items-center gap-2 text-xl text-purple-700">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        All AI Recommendations
                      </DialogTitle>
                      <DialogDescription>
                        Comprehensive list of inventory optimization suggestions based on your current stock levels and sales history.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                    <div className="border rounded-lg divide-y">
                      {recommendations.map((rec, index) => (
                        <RecommendationItem key={index} rec={rec} />
                      ))}
                    </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


