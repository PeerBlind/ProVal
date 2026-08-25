// src/hooks/useAiAnalysis.ts
import { useState } from 'react';

export interface ValidationPoint {
  id: string;
  layer: number;
  source: 'bpmnlint' | 'ai';
  category: string;
  bpmn_element_id: string;
  message: string;
  details: string;
  recommendation: string;
  status: 'open' | 'resolved';
  ignored: boolean;
  created_at: string;
  // NEW
  element_name?: string;
  domain_expert_feedback?: string;

}

export interface Progression {
  current_layer: number;
  completed_layers: number[];
  overall_score: number;
}

export interface AnalyzeResponse {
  analysis_id: string;
  project_id: string;
  progression: Progression;
  validation_points: ValidationPoint[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const useAiAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (bpmnXml: string, projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bpmn_xml: bpmnXml, project_id: projectId })
      });
      
      const data: AnalyzeResponse = await response.json();
      setAnalysisData(data);
      return data;
    } catch (error) {
      console.error('Analyse error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (pointId: string, status?: 'resolved', ignored?: boolean) => {
    if (!analysisData) return;
    
    try {
      const response = await fetch(`${API_URL}/api/v1/ai/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: analysisData.project_id,
          point_id: pointId,
          status,
          ignored
        })
      });
      
      const data = await response.json();
      
      // backend retourne toute l'analyse mise a jour
      setAnalysisData(data)

    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  return { analysisData, analyze, updateStatus, loading };
};