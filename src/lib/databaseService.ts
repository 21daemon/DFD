
import { supabase } from './supabase';
import { DetectionResult } from './deepfakeDetector';

// Define the database table types
export type DbDetectionResult = {
  id: string;
  user_id: string | null;
  filename: string;
  verdict: 'real' | 'fake' | 'uncertain';
  confidence: number;
  detection_time: number;
  features: Record<string, number>;
  timestamp: number;
  metadata: Record<string, any>;
};

export async function saveResultToDatabase(result: DetectionResult, userId: string | null = null): Promise<string> {
  // Create a metadata object if it doesn't exist in the result
  const metadata = result.metadata || {};
  
  const { data, error } = await supabase
    .from('detection_results')
    .insert({
      id: result.id,
      user_id: userId,
      filename: result.filename,
      verdict: result.verdict,
      confidence: result.confidence,
      detection_time: result.detectionTime,
      features: result.features,
      timestamp: result.timestamp,
      metadata: metadata
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving result to database:', error);
    throw error;
  }

  return data.id;
}

export async function getResultsFromDatabase(userId: string | null = null) {
  let query = supabase
    .from('detection_results')
    .select('*');
  
  // If userId is provided, filter by user_id
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) {
    console.error('Error getting results from database:', error);
    throw error;
  }

  return data as DbDetectionResult[];
}

export async function getResultById(id: string) {
  const { data, error } = await supabase
    .from('detection_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting result from database:', error);
    throw error;
  }

  return data as DbDetectionResult;
}

export async function clearResultsForUser(userId: string) {
  const { error } = await supabase
    .from('detection_results')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing results for user:', error);
    throw error;
  }

  return true;
}

export async function getResultStatsFromDatabase(userId: string | null = null) {
  const results = await getResultsFromDatabase(userId);
  
  const stats = {
    totalAnalyzed: results.length,
    realDetected: results.filter(r => r.verdict === 'real').length,
    fakeDetected: results.filter(r => r.verdict === 'fake').length,
    uncertainDetected: results.filter(r => r.verdict === 'uncertain').length,
    averageConfidence: results.length > 0 
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
      : 0
  };
  
  return stats;
}
