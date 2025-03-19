import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FileVideo, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { getResultStats } from "@/lib/deepfakeDetector";

const Index = () => {
      const stats = getResultStats();

      return (
            <Layout>
                  <section className="py-16 sm:py-24 px-4">
                        <div className="max-w-4xl mx-auto text-center">
                              <div className="inline-flex items-center justify-center mb-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                          <Shield className="h-8 w-8 text-primary" />
                                    </div>
                              </div>

                              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 animate-slide-down">
                                    Deep fake Detection
                              </h1>

                              <p
                                    className="text-xl leading-7 text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-down"
                                    style={{ animationDelay: "100ms" }}
                              >
                                    Advanced deepfake detection system with
                                    precise analysis tools to verify the
                                    authenticity of your videos.
                              </p>

                              <div
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
                                    style={{ animationDelay: "200ms" }}
                              >
                                    <Link to="/detect">
                                          <Button
                                                size="lg"
                                                className="w-full sm:w-auto"
                                          >
                                                Analyze Video
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                          </Button>
                                    </Link>
                                    <Link to="/results">
                                          <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full sm:w-auto"
                                          >
                                                View Results
                                          </Button>
                                    </Link>
                              </div>
                        </div>
                  </section>

                  <section className="py-16 px-4 bg-secondary/50">
                        <div className="max-w-7xl mx-auto">
                              <h2 className="text-3xl font-bold text-center mb-12">
                                    How It Works
                              </h2>

                              <div className="grid md:grid-cols-3 gap-8">
                                    <FeatureCard
                                          icon={
                                                <FileVideo className="h-10 w-10 text-primary" />
                                          }
                                          title="Upload Video"
                                          description="Upload any video file for analysis. Our system works with most standard formats."
                                    />
                                    <FeatureCard
                                          icon={
                                                <Shield className="h-10 w-10 text-primary" />
                                          }
                                          title="Advanced Analysis"
                                          description="Our AI models detect facial inconsistencies, unnatural movements, and audio-visual mismatches."
                                    />
                                    <FeatureCard
                                          icon={
                                                <BarChart3 className="h-10 w-10 text-primary" />
                                          }
                                          title="Detailed Results"
                                          description="Get comprehensive reports with confidence scores and specific detection metrics."
                                    />
                              </div>
                        </div>
                  </section>

                  {stats.totalAnalyzed > 0 && (
                        <section className="py-16 px-4">
                              <div className="max-w-7xl mx-auto">
                                    <h2 className="text-3xl font-bold text-center mb-12">
                                          Detection Activity
                                    </h2>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                          <StatCard
                                                label="Videos Analyzed"
                                                value={stats.totalAnalyzed.toString()}
                                          />
                                          <StatCard
                                                label="Real Videos"
                                                value={stats.realDetected.toString()}
                                          />
                                          <StatCard
                                                label="Fake Videos"
                                                value={stats.fakeDetected.toString()}
                                          />
                                          <StatCard
                                                label="Avg. Confidence"
                                                value={`${Math.round(
                                                      stats.averageConfidence
                                                )}%`}
                                          />
                                    </div>

                                    <div className="text-center mt-10">
                                          <Link to="/results">
                                                <Button variant="outline">
                                                      View Detailed Results
                                                      <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                          </Link>
                                    </div>
                              </div>
                        </section>
                  )}
            </Layout>
      );
};

const FeatureCard = ({
      icon,
      title,
      description,
}: {
      icon: React.ReactNode;
      title: string;
      description: string;
}) => (
      <Card className="glass-card animate-scale-in">
            <CardContent className="pt-6">
                  <div className="mb-4">{icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
            </CardContent>
      </Card>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
      <Card className="glass-card">
            <CardContent className="py-6">
                  <p className="text-sm text-muted-foreground mb-1">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
            </CardContent>
      </Card>
);

export default Index;
