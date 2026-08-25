// src/Components/ai/LayerPanel.tsx
import { AlertCircle, CheckCircle, XCircle, Brain, ChartColumn, FileDown } from 'lucide-react';
import type { AnalyzeResponse } from '../../hooks/useAiAnalysis';
import { useState } from 'react';



interface LayerPanelProps {
  analysisData: AnalyzeResponse;
  onResolve: (pointId: string) => void;
  onIgnore: (pointId: string) => void;
  onFocusElement: (elementId: string) => void;
}

// const pour env prod 
const API_URL = "";

export const LayerPanel = ({ analysisData, onResolve, onIgnore ,onFocusElement }: LayerPanelProps) => {
   //historique
  const [showHistory, setShowHistory] = useState(false);

  const { progression, validation_points } = analysisData;

  //anlyse 
  const analysisCompleted = progression.completed_layers.length === 6;
  // telecharger le pdf 
  const handleDownloadPDF = async () => {
  try {
    const svg = await exportDiagramSVG();

    const res = await fetch("/api/v1/ai/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        analysisData,
        svg
      })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bpmn-report.pdf";
    a.click();

  } catch (error) {
    console.error("PDF download error:", error);
  }
};

// import svg 
  const exportDiagramSVG = async () => {
  try {
    const modeler = (window as any).bpmnModeler;
    if (!modeler) return null;

    const { svg } = await modeler.saveSVG();
    return svg;

  } catch (err) {
    console.error("SVG export error:", err);
    return null;
  }
};
 
  
  // PROTECTION : Vérifier que validation_points existe
  if (!validation_points) {
    return (
      <div className="flex flex-col h-full p-4 ">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Validation points identified</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-2 text-yellow-500" />
          <p className="font-semibold">Error during analysis</p>
          <p className="text-sm">No validation points received</p>
        </div>
      </div>
    );
  }
  
  // Filtrer SEULEMENT les points du current_layer
  const currentLayerPoints = validation_points.filter(
    p => p.layer === progression.current_layer && p.status === "open" &&
    !p.ignored
  );



  // Nom des layers
  const layerNames: Record<number, string> = {
    1: 'Syntax',
    2: 'Soundness',
    3: 'Understandability',
    4: 'Collaboration',
    5: 'Semantic (Model)',
    6: 'Semantic (Process)'
  };

  return (
    <div className="flex flex-col h-full p-4  bg-slate-950  text-white">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Validation points identified</h2>
        </div>
        <p className="text-sm text-slate-400">
          {layerNames[progression.current_layer]} 
          {' '}(Layer {progression.current_layer}/6)
        </p>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-semibold">Progression</span>
          <span className="text-blue-400 font-bold">
            {progression.overall_score}%
          </span>
        </div>
        
        {/* Barre globale */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progression.overall_score}%` }}
          />
        </div>

        {/* Mini barres par layer */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map(layer => (
            <div 
              key={layer}
              className={`flex-1 h-2 rounded transition-all ${
                progression.completed_layers.includes(layer) 
                  ? 'bg-green-400' 
                  : layer === progression.current_layer
                    ? 'bg-blue-500'
                    : 'bg-slate-600'
              }`}
              title={layerNames[layer]}
            />
          ))}
        </div>
      </div>

      {/* Points de validation */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span>Points to resolve</span>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{currentLayerPoints.length}</span>
        </h3>

        {currentLayerPoints.length === 0 ? (
          progression.current_layer < 6 ?(
           <div className="text-center py-8 text-gray-500">
           <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
           <p className="font-semibold">Layer completed ✅</p>
           <p className="text-sm">
              Moving to next validation layer...
           </p>
          </div> 
          ):
          <div className="text-center py-8 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold">No problems detected ✅</p>
            <p className="text-sm">This layer is perfect !</p>
            {analysisCompleted && (
                <div className="mt-6 flex flex-col gap-3 items-center">

                  <button
                     onClick={() => setShowHistory(!showHistory)}
                     className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
                  >
                         <ChartColumn /> View analysis history
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm"
                  >
                        <FileDown /> Download PDF report
                  </button>

                </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentLayerPoints.map(point => (
              <div 
                key={point.id}
                className={`rounded-lg p-4 transition-all bg-slate-800 border border-slate-700 ${
                  point.status === 'resolved' 
                    ? 'bg-green-900/30 border-green-500' 
                    : point.ignored 
                      ? 'bg-slate-800 border-slate-600 opacity-60' 
                      : 'bg-red-900/20 border-red-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  {point.status === 'resolved' ? (
                    <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  ) : point.ignored ? (
                    <XCircle size={20} className="text-gray-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{point.message}</h4>
                      <button
                        onClick={() => onFocusElement(point.bpmn_element_id)}
                        className="text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
                      >
                            🔍
                      </button>
                      {/*<p className="text-xs text-slate-400 mb-1">
                        Element: {point.element_name || point.bpmn_element_id}
                      </p> */}
                    </div>
                    
                    <p className="text-xs text-slate-400  mb-2">
                      {point.details}
                    </p>
                    
                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-2 mb-2">
                      <p className="text-xs text-blue-200">
                        <span className="font-semibold">❓ Question :</span>{' '}
                        {point.recommendation}
                      </p>
                      <textarea
                        placeholder="Explain this step in business terms..."
                        className="w-full mt-2 p-2 rounded bg-slate-700 text-white text-xs"

                        defaultValue={point.domain_expert_feedback || ""}

                        onBlur={async (e) => {
                          try {
                            await fetch("/api/v1/ai/update-feedback", {
                            method: "POST",
                            headers: {
                            "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                            project_id: analysisData.project_id,
                            point_id: point.id,
                            feedback: e.target.value
                            })
                          });

                        console.log("✅ feedback saved");
                        } catch (err) {
                        console.error("❌ feedback error", err);
                        }
                        }}
                      />
                    </div>

                    {point.status === 'open' && !point.ignored && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => onResolve(point.id)}
                          className="text-xs px-3 py-1 bg-green-500 hover:bg-green-400 rounded text-white"
                        >
                          ✓ Solve
                        </button>
                        <button 
                          onClick={() => onIgnore(point.id)}
                          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
                        >
                          ⊗ Ignore
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 🔹 HISTORY SECTION */}
      {showHistory && (
        <div className="mt-4 border-t border-slate-700 pt-4 overflow-y-auto max-h-64">
          <h3 className="font-bold mb-3 text-white">
            Analysis History
          </h3>

          {validation_points
            .sort((a, b) => a.layer - b.layer)
            .map(point => (
              <div
                key={point.id}
                className="mb-2 p-2 rounded bg-slate-800 border border-slate-700"
              >
                <div className="text-xs text-slate-400">
                  Layer {point.layer}
                </div>

                <div className="text-sm font-semibold">
                  {point.message}
                </div>

                <div className="text-xs text-slate-400">
                  Element: {point.bpmn_element_id}
                </div>

                <div className="text-xs mt-1">
                  Status: {point.status}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};