
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BarChart3,
  FileVideo,
  LightbulbIcon as Lightbulb
} from 'lucide-react';
import { getResultById } from '@/lib/deepfakeDetector';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ResultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const result = id ? getResultById(id) : undefined;
  
  if (!result) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Result Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The detection result you're looking for could not be found.
          </p>
          <Button onClick={() => navigate('/results')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
      </Layout>
    );
  }
  
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMMM d, yyyy h:mm a');
  };
  
  const VerdictIcon = () => {
    if (result.verdict === 'real') {
      return <CheckCircle2 className="h-10 w-10 text-green-500" />;
    } else if (result.verdict === 'fake') {
      return <XCircle className="h-10 w-10 text-red-500" />;
    } else {
      return <AlertTriangle className="h-10 w-10 text-yellow-500" />;
    }
  };
  
  const progressColor = 
    result.verdict === 'real' ? 'bg-green-500' : 
    result.verdict === 'fake' ? 'bg-red-500' : 
    'bg-yellow-500';
  
  const getFeatureStatus = (score: number) => {
    if (score < 30) return { status: 'good', text: 'Normal' };
    if (score < 70) return { status: 'warning', text: 'Suspicious' };
    return { status: 'bad', text: 'Anomalous' };
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/results')} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Detection Report</h1>
          <p className="text-muted-foreground">
            Analyzed on {formatDate(result.timestamp)}
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card className={cn(
            "border-t-4",
            result.verdict === 'real' 
              ? "border-t-green-500" 
              : result.verdict === 'fake'
                ? "border-t-red-500"
                : "border-t-yellow-500"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-4">
                  <VerdictIcon />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {result.verdict === 'real' ? 'Authentic Video' : 
                       result.verdict === 'fake' ? 'Manipulated Video' :
                       'Inconclusive Results'}
                    </h2>
                    <p className="text-muted-foreground">
                      {result.confidence.toFixed(1)}% confidence in this assessment
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted px-4 py-2 rounded-md">
                  <p className="text-sm">Detection time</p>
                  <p className="font-medium">{result.detectionTime.toFixed(1)} seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileVideo className="w-5 h-5 mr-2" />
                  Video Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Filename</p>
                    <p className="font-medium truncate">{result.filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Analysis Date</p>
                    <p className="font-medium">{formatDate(result.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Detection ID</p>
                    <p className="font-medium text-sm font-mono">{result.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" /> 
                  Detection Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">Authentic Probability</p>
                      <p className="text-sm font-medium">{(result.realScore * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${result.realScore * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">Manipulation Probability</p>
                      <p className="text-sm font-medium">{(result.fakeScore * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${result.fakeScore * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">Overall Confidence</p>
                      <p className="text-sm font-medium">{result.confidence.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={progressColor + " h-full rounded-full"}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Feature Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {Object.entries(result.features).map(([key, value]) => {
                  const featureName = key.replace(/([A-Z])/g, ' $1').trim();
                  const status = getFeatureStatus(value);
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium capitalize">{featureName}</p>
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full font-medium",
                          status.status === 'good' 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : status.status === 'warning'
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {status.text}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            status.status === 'good' 
                              ? "bg-green-500" 
                              : status.status === 'warning'
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Score: {value.toFixed(1)}/100
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => navigate('/results')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <Link to="/detect">
              <Button>Analyze Another Video</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResultDetail;
