
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { clearResultsForUser, getResultsFromDatabase, getResultStatsFromDatabase } from '@/lib/databaseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, FileVideo, Trash2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const Results = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    realDetected: 0,
    fakeDetected: 0,
    uncertainDetected: 0,
    averageConfidence: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const resultsData = await getResultsFromDatabase(user?.id || null);
        setResults(resultsData);
        
        const statsData = await getResultStatsFromDatabase(user?.id || null);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load detection results');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleClearResults = async () => {
    try {
      if (user?.id) {
        await clearResultsForUser(user.id);
        setResults([]);
        setStats({
          totalAnalyzed: 0,
          realDetected: 0,
          fakeDetected: 0,
          uncertainDetected: 0,
          averageConfidence: 0
        });
        toast.success('All results have been cleared');
      }
    } catch (error) {
      console.error('Error clearing results:', error);
      toast.error('Failed to clear results');
    } finally {
      setIsDialogOpen(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detection Results</h1>
            <p className="text-muted-foreground">
              {results.length > 0 
                ? `${results.length} video${results.length !== 1 ? 's' : ''} analyzed` 
                : 'No videos analyzed yet'}
            </p>
          </div>
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Results
            </Button>
          )}
        </div>
        
        {stats.totalAnalyzed > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="glass-card">
              <CardContent className="py-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FileVideo className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Total Videos</p>
                </div>
                <p className="text-3xl font-bold">{stats.totalAnalyzed}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="py-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium">Authentic</p>
                </div>
                <p className="text-3xl font-bold">{stats.realDetected}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="py-6">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium">Manipulated</p>
                </div>
                <p className="text-3xl font-bold">{stats.fakeDetected}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="py-6">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Avg. Confidence</p>
                </div>
                <p className="text-3xl font-bold">{Math.round(stats.averageConfidence)}%</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((result) => (
              <Link to={`/results/${result.id}`} key={result.id}>
                <Card className={cn(
                  "hover:shadow-soft transition-shadow border-l-4",
                  result.verdict === 'real' 
                    ? "border-l-green-500" 
                    : result.verdict === 'fake'
                      ? "border-l-red-500"
                      : "border-l-yellow-500"
                )}>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        {result.verdict === 'real' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : result.verdict === 'fake' ? (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        )}
                        <p className="font-medium truncate">{result.filename}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Analyzed: {formatDate(result.timestamp)}
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-2 sm:mt-0">
                      <div className="mr-4">
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="font-medium">{Math.round(result.confidence)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verdict</p>
                        <p className={cn(
                          "font-medium capitalize",
                          result.verdict === 'real' 
                            ? "text-green-600 dark:text-green-400" 
                            : result.verdict === 'fake'
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {result.verdict}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No results yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Upload and analyze videos to see the detection results here.
              </p>
              <Link to="/detect">
                <Button>Analyze a Video</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear all results?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All detection results will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearResults}>
                Clear all results
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Results;
