import { Save, Download, Undo, Redo, Eye, FileText, File, Bot } from 'lucide-react';
import { saveAs } from 'file-saver';
import type { BpmnEditorHandle } from './BpmnEditor'; // Import type-only

/**
 * Props du composant ToolbarActions
 */
interface ToolbarActionsProps {
  editorRef: React.RefObject<BpmnEditorHandle | null>; // Nullable
  onManualSave: () => Promise<void>;
  onBackToView: () => void;
  isSaving?: boolean;
  onAnalyze?: () => void;      //  Nouvelle prop
  isAnalyzing?: boolean;        //  Nouvelle prop
}

/**
 * Composant ToolbarActions
 * 
 * Barre d'outils complète pour l'édition BPMN.
 * Toutes les actions interagissent avec le BpmnEditor via editorRef.
 */
export const ToolbarActions = ({
  editorRef,
  onManualSave,
  onBackToView,
  isSaving,
  onAnalyze,           // new 
  isAnalyzing = false  // new
}: ToolbarActionsProps) => {
  // Annule la derniere action (undo)
  const handleUndo = () => {
    try {
      const modeler = editorRef.current?.getModeler();
      if (!modeler) return;
      
      const commandStack = modeler.get('commandStack');
      if (commandStack?.canUndo()) {
        commandStack.undo();
        console.log('Undo');
      }
    } catch (error) {
      console.error('Undo error:', error);
    }
  };
  // Refait la derniere action annulee (redo)
  const handleRedo = () => {
    try {
      const modeler = editorRef.current?.getModeler();
      if (!modeler) return;
      
      const commandStack = modeler.get('commandStack');
      if (commandStack?.canRedo()) {
        commandStack.redo();
        console.log('Redo');
      }
    } catch (error) {
      console.error('Redo error:', error);
    }
  };

  //exporter le diagramme au format BPMN(XML)
  const handleExportBpmn = async () => {
    if (!editorRef.current) {
      alert('Editor not ready');
      return;
    }

    try {
      const { xml } = await editorRef.current.saveXML();
      const blob = new Blob([xml], { type: 'application/xml' });
      saveAs(blob, `diagram-${Date.now()}.bpmn`);
      console.log('Export BPMN successful');
    } catch (error) {
      console.error('Export BPMN failed:', error);
      alert('Error during BPMN export');
    }
  };
/**
 * Exporter le diagramme au format PDF 
 * on genere d'abord le svg du diagramme puis je le convertis en PDF
 * @returns 
 */
  const handleExportPDF = async () => {
    try {
      const modeler = editorRef.current?.getModeler();
      if (!modeler) {
        alert('Editor not ready');
        return;
      }

      console.log(' Generating PDF...');

      const { svg } = await modeler.saveSVG();
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        try {
          // Import dynamique de jsPDF
          const jsPDF = (await import('jspdf')).jsPDF;
          
          const imgData = canvas.toDataURL('image/png');
          
          const pdfWidth = 297;
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          let finalWidth = pdfWidth;
          let finalHeight = pdfHeight;
          
          if (pdfHeight > pageHeight) {
            finalHeight = pageHeight;
            finalWidth = (canvas.width * pageHeight) / canvas.height;
          }

          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
          pdf.save(`diagram-${Date.now()}.pdf`);
          
          console.log('Export PDF successful');
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
        }

        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        console.error('Failed to load SVG image');
        alert('Error during SVG conversion');
        URL.revokeObjectURL(url);
      };

      img.src = url;

    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Error during PDF export');
    }
  };

  return (
    <div className="flex items-center gap-2 p-4  bg-white border-b shadow-sm">
      <button 
        onClick={onBackToView} 
        className="btn btn-ghost btn-sm"
      >
        <Eye size={16} /> Reading mode
      </button>

      <div className="divider divider-horizontal mx-1" />

      <button
        onClick={onManualSave}
        className="btn btn-primary btn-sm"
        disabled={isSaving}
      >
        <Save size={16} />
        {isSaving ? 'Sauvegarde...' : 'Save'}
      </button>

      <div className="divider divider-horizontal mx-1" />

      <button 
        onClick={handleUndo} 
        className="btn btn-ghost btn-sm" 
        title="Annuler (Ctrl+Z)"
      >
        <Undo size={16} />
      </button>

      <button 
        onClick={handleRedo} 
        className="btn btn-ghost btn-sm" 
        title="Refaire (Ctrl+Y)"
      >
        <Redo size={16} />
      </button>

      <button 
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="btn btn-primary btn-sm"
        title="Analyze with AI"
      >
        {isAnalyzing ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Analyse...
            </>
          ) : (
            <>
              Analyze
            </>
          )}
        <Bot size={16} />
      </button>



      <div className="divider divider-horizontal mx-1" />

      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-ghost btn-sm">
          <Download size={16} /> Export
        </button>
        <ul 
          tabIndex={0} 
          className="dropdown-content menu shadow bg-base-100 rounded-box w-52 mt-2 z-50"
        >
          <li>
            <a onClick={handleExportBpmn}>
              <File size={14} />
              BPMN file (.bpmn)
            </a>
          </li>
          <li>
            <a onClick={handleExportPDF}>
              <FileText size={14} />
              PDF document (.pdf)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};