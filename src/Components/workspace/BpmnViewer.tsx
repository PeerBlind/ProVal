import { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Viewer';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface BpmnViewerProps {
  xml: string;
  height?: string;
}

export const BpmnViewer = ({ xml, height = '600px' }: BpmnViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<BpmnJS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  if (!xml || !containerRef.current) return;

  // Empêche double initialisation
  if (viewerRef.current) {
    viewerRef.current.destroy();
    viewerRef.current = null;
  }

  setIsReady(false);
  setError(null);

  const viewer = new BpmnJS({
    container: containerRef.current
  });

  viewerRef.current = viewer;

  viewer.importXML(xml)
    .then(() => {
      const canvas = viewer.get('canvas') as any;
      canvas.zoom('fit-viewport');
      setIsReady(true);
    })
    .catch((err: unknown) => {
      console.error('Import error:', err);
      setError('Diagramme invalide');
    });

  return () => {
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }
  };
}, [xml]);

  return (
    <div
      className="w-full mt-10 mb-10 bg-white rounded-xl shadow-lg border border-gray-200 relative"
      style={{ height }}
    >
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="alert alert-error max-w-md">
            <span>{error}</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
};
