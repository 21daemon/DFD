import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import VideoUploader from "@/components/VideoUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { analyzeVideo, DetectionResult } from "@/lib/deepfakeDetector";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { saveResultToDatabase } from "@/lib/databaseService";

const Detect = () => {
      const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [progress, setProgress] = useState(0);
      const [result, setResult] = useState<DetectionResult | null>(null);
      const navigate = useNavigate();
      const { user } = useAuth();

      const handleVideoSelect = (file: File) => {
            setSelectedVideo(file);
            setResult(null);
      };

      const handleAnalyze = async () => {
            if (!selectedVideo) {
                  toast.error("Please select a video to analyze");
                  return;
            }

            setIsAnalyzing(true);
            setProgress(0);

            try {
                  toast.info("Starting analysis of video file...");

                  const detectionResult = await analyzeVideo(
                        selectedVideo,
                        (progress) => {
                              setProgress(progress);
                        }
                  );

                  console.log("Analysis complete, result:", detectionResult);

                  try {
                        // Save result to database if user is logged in
                        if (user) {
                              await saveResultToDatabase(
                                    detectionResult,
                                    user.id || null
                              );
                              console.log("Result saved to database");
                        } else {
                              console.log(
                                    "User not logged in, result not saved to database"
                              );
                        }
                  } catch (dbError) {
                        console.error(
                              "Failed to save result to database:",
                              dbError
                        );
                        toast.error(
                              "Analysis complete but failed to save result to database"
                        );
                  }

                  setResult(detectionResult);

                  if (detectionResult.verdict === "real") {
                        toast.success(
                              `AI analysis: Video likely authentic (${detectionResult.confidence.toFixed(
                                    1
                              )}% confidence)`
                        );
                  } else if (detectionResult.verdict === "fake") {
                        toast.error(
                              `AI analysis: Video likely manipulated (${detectionResult.confidence.toFixed(
                                    1
                              )}% confidence)`
                        );
                  } else {
                        toast.info(
                              `AI analysis: Results inconclusive (${detectionResult.confidence.toFixed(
                                    1
                              )}% confidence)`
                        );
                  }
            } catch (error) {
                  console.error("Analysis failed:", error);
                  toast.error(
                        "Analysis failed. Please try again with a different video file."
                  );
            } finally {
                  setIsAnalyzing(false);
            }
      };

      const handleViewDetails = () => {
            if (result) {
                  navigate(`/results/${result.id}`);
            }
      };

      const handleReset = () => {
            setSelectedVideo(null);
            setResult(null);
            setProgress(0);
      };

      const renderVerdictText = (verdict: "real" | "fake" | "uncertain") => {
            switch (verdict) {
                  case "real":
                        return "Likely Authentic (Real Video)";
                  case "fake":
                        return "Likely Manipulated (Deepfake)";
                  case "uncertain":
                        return "Uncertain Results";
                  default:
                        return "Unknown";
            }
      };

      return (
            <Layout>
                  <div className="max-w-5xl mx-auto px-4 py-12">
                        <div className="text-center mb-10">
                              <h1 className="text-3xl font-bold mb-4">
                                    AI-Powered Deepfake Detection
                              </h1>
                              <p className="text-muted-foreground max-w-2xl mx-auto">
                                    Upload a video file to analyze with our AI
                                    model. Our system uses computer vision
                                    technology to identify potentially
                                    manipulated videos.
                              </p>
                        </div>

                        <VideoUploader onVideoSelect={handleVideoSelect} />

                        {selectedVideo && !result && (
                              <div className="mt-8 flex justify-center">
                                    <Button
                                          onClick={handleAnalyze}
                                          disabled={isAnalyzing}
                                          size="lg"
                                          className="w-full max-w-xs"
                                    >
                                          {isAnalyzing
                                                ? "Analyzing..."
                                                : "Run AI Analysis"}
                                    </Button>
                              </div>
                        )}

                        {isAnalyzing && (
                              <Card className="mt-8 animate-fade-in">
                                    <CardContent className="pt-6">
                                          <div className="flex items-center justify-between mb-4">
                                                <div>
                                                      <h3 className="font-medium">
                                                            AI model processing
                                                      </h3>
                                                      <p className="text-sm text-muted-foreground">
                                                            Please wait while
                                                            our AI model
                                                            analyzes your
                                                            video...
                                                      </p>
                                                </div>
                                                <Shield className="h-8 w-8 text-primary animate-pulse-slow" />
                                          </div>

                                          <Progress
                                                value={progress}
                                                className="h-2"
                                          />

                                          <div className="mt-4 text-sm text-muted-foreground">
                                                <p>
                                                      {progress < 30 &&
                                                            "Loading AI model and preparing video frames..."}
                                                      {progress >= 30 &&
                                                            progress < 60 &&
                                                            "Running AI analysis on video frames..."}
                                                      {progress >= 60 &&
                                                            progress < 80 &&
                                                            "Processing predictions..."}
                                                      {progress >= 80 &&
                                                            progress < 95 &&
                                                            "Calculating authenticity metrics..."}
                                                      {progress >= 95 &&
                                                            "Finalizing verdict and generating report..."}
                                                </p>
                                          </div>
                                    </CardContent>
                              </Card>
                        )}

                        {result && (
                              <Card
                                    className={cn(
                                          "mt-8 overflow-hidden animate-scale-in border-2",
                                          result.verdict === "real"
                                                ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10"
                                                : result.verdict === "fake"
                                                ? "border-red-500/30 bg-red-50/30 dark:bg-red-950/10"
                                                : "border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-950/10"
                                    )}
                              >
                                    <CardContent className="pt-6">
                                          <div className="flex items-center justify-between mb-6">
                                                <div>
                                                      <h3 className="text-xl font-semibold">
                                                            Detection Results
                                                      </h3>
                                                      <p className="text-sm text-muted-foreground">
                                                            Analysis completed
                                                            in{" "}
                                                            {result.detectionTime.toFixed(
                                                                  1
                                                            )}{" "}
                                                            seconds
                                                      </p>
                                                </div>
                                                {result.verdict === "real" ? (
                                                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                                                ) : result.verdict ===
                                                  "fake" ? (
                                                      <XCircle className="h-10 w-10 text-red-500" />
                                                ) : (
                                                      <AlertTriangle className="h-10 w-10 text-yellow-500" />
                                                )}
                                          </div>

                                          <div className="mb-6">
                                                <h4 className="font-medium mb-2">
                                                      Verdict
                                                </h4>
                                                <div
                                                      className={cn(
                                                            "text-lg font-semibold py-2 px-4 rounded-md inline-block",
                                                            result.verdict ===
                                                                  "real"
                                                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                                  : result.verdict ===
                                                                    "fake"
                                                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                      )}
                                                >
                                                      {renderVerdictText(
                                                            result.verdict
                                                      )}
                                                </div>
                                          </div>

                                          <div className="mb-6">
                                                <h4 className="font-medium mb-2">
                                                      Confidence Score
                                                </h4>
                                                <div className="w-full bg-muted rounded-full h-4 mb-2">
                                                      <div
                                                            className={cn(
                                                                  "h-full rounded-full",
                                                                  result.verdict ===
                                                                        "real"
                                                                        ? "bg-green-500"
                                                                        : result.verdict ===
                                                                          "fake"
                                                                        ? "bg-red-500"
                                                                        : "bg-yellow-500"
                                                            )}
                                                            style={{
                                                                  width: `${result.confidence}%`,
                                                            }}
                                                      />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                      {result.confidence.toFixed(
                                                            1
                                                      )}
                                                      % confidence in this
                                                      assessment
                                                </p>
                                          </div>

                                          <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                                <Button
                                                      onClick={
                                                            handleViewDetails
                                                      }
                                                      className="flex-1"
                                                >
                                                      View Detailed Report
                                                </Button>
                                                <Button
                                                      onClick={handleReset}
                                                      variant="outline"
                                                      className="flex-1"
                                                >
                                                      Analyze Another Video
                                                </Button>
                                          </div>
                                    </CardContent>
                              </Card>
                        )}
                  </div>
            </Layout>
      );
};

export default Detect;
