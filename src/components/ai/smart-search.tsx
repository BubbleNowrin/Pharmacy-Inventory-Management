'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartSearchResult {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: string;
  supplier: string;
  batchNumber: string;
  lowStockThreshold: number;
  isExpiring: boolean;
  isLowStock: boolean;
}

interface SmartSearchProps {
  onResultSelect?: (medication: SmartSearchResult) => void;
}

export default function SmartSearch({ onResultSelect }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SmartSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const exampleQueries = [
    "Find painkillers expiring next month",
    "Show antibiotics with low stock",
    "List expired medications",
    "Find all medicines from MedCo supplier",
    "Show vitamins under 20 units",
    "Find medicines expiring in 7 days",
    "List all tablets below threshold",
    "Show heart medications in stock"
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.data);
        
        // Add to search history (keep last 5)
        setSearchHistory(prev => {
          const newHistory = [query.trim(), ...prev.filter(h => h !== query.trim())];
          return newHistory.slice(0, 5);
        });

        if (result.data.length === 0) {
          toast({
            title: 'No Results',
            description: 'No medications found matching your search criteria.',
          });
        }
      } else {
        toast({
          title: 'Search Error',
          description: result.error || 'Failed to perform search',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while searching',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadges = (medication: SmartSearchResult) => {
    const badges = [];
    
    if (medication.isExpiring) {
      badges.push(
        <Badge key="expiring" variant="destructive" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Expiring Soon
        </Badge>
      );
    }
    
    if (medication.isLowStock) {
      badges.push(
        <Badge key="lowstock" variant="secondary" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low Stock
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Smart Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Ask me anything about your inventory... (e.g., 'Find painkillers expiring next month')"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Searches</h4>
              <div className="flex flex-wrap gap-1">
                {searchHistory.map((historyQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => setQuery(historyQuery)}
                  >
                    {historyQuery}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Example Queries */}
          <div>
            <h4 className="text-sm font-medium mb-2">Try these examples</h4>
            <div className="grid grid-cols-2 gap-1">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-8 text-blue-600 hover:text-blue-800"
                  onClick={() => handleExampleQuery(example)}
                >
                  "{example}"
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({results.length} found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((medication) => (
                <div
                  key={medication._id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onResultSelect?.(medication)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{medication.name}</h4>
                        <div className="flex gap-1">
                          {getStatusBadges(medication)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Category: {medication.category} • Supplier: {medication.supplier}</div>
                        <div>
                          Stock: {medication.quantity} {medication.unit} • 
                          Price: ${medication.price} • 
                          Batch: {medication.batchNumber}
                        </div>
                        <div>
                          Expires: {new Date(medication.expiryDate).toLocaleDateString()} •
                          Threshold: {medication.lowStockThreshold} {medication.unit}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {medication.quantity} {medication.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${medication.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}