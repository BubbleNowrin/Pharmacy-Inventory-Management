'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Package, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'reorder': return <Package className="h-4 w-4" />;
      case 'reduce': return <AlertCircle className="h-4 w-4" />;
      case 'maintain': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'reorder': return 'text-blue-600 bg-blue-50';
      case 'reduce': return 'text-red-600 bg-red-50';
      case 'maintain': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>AI-powered inventory suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>AI-powered inventory suggestions</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshRecommendations}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Good!</h3>
            <p className="text-gray-600">No urgent recommendations at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{rec.medicationName}</h3>
                    <p className="text-sm text-gray-600">{rec.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(rec.recommendation.priority)}>
                      {rec.recommendation.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getActionColor(rec.recommendation.action)}`}>
                    {getActionIcon(rec.recommendation.action)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {rec.recommendation.action}
                      {rec.recommendation.quantity && ` ${rec.recommendation.quantity} units`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current: {rec.currentStock} | Threshold: {rec.lowStockThreshold}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{rec.recommendation.recommendation}</p>
                </div>
              </div>
            ))}

            {recommendations.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All {recommendations.length} Recommendations
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
