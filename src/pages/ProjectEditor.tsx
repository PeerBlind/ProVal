// src/pages/ProjectEditorPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateProject, getBpmnXml } from '../services/project.service';
import { BpmnEditor } from '../Components/workspace/BpmnEditor';
import type { BpmnEditorHandle } from '../Components/workspace/BpmnEditor'; // Import type-only
import { ToolbarActions } from '../Components/workspace/ToolbarActions';
import { ArrowLeft } from 'lucide-react';
import type { Project } from '../types/project.types';
import toast, { Toaster } from 'react-hot-toast';
import { useAiAnalysis } from '../hooks/useAiAnalysis';
import { LayerPanel } from '../Components/ai/LayerPanel'; 



/**
 * Page qui permet d'afficher le detail(Diagramme BPMN en grand format,
 * Nom du diagramme et description) d'un projet recuperer dans la DB , 
 * avec la possibiliter de l'editer ,integration de la toolbar,
 * sauvegarde auto apres 30 sec et sauvegarde manuelle
 * @returns 
 */
export default function ProjectEditorPage() {
  // Récupération de l'ID du projet depuis l'URL
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
   // États du composant
  const [project, setProject] = useState<Project | null>(null); // Données du projet
  const [bpmnXml, setBpmnXml] = useState<string>(''); // Contenu XML BPMN
  const [loading, setLoading] = useState(true); // Chargement initial
  const [isSaving, setIsSaving] = useState(false); // Sauvegarde en cours
  
  // Référence au BpmnEditor pour accéder à ses méthodes
  const editorRef = useRef<BpmnEditorHandle | null>(null);
  // Hook pour l'analyse IA
  const { analysisData, analyze, updateStatus, loading: analyzing } = useAiAnalysis();
// , error: analyzeError a rajouter dans la const au dessus 

  useEffect(() => {
    loadProject();
    /**
     * Gestionnaire du raccourci clavier Ctrl+S (ou Cmd+S sur Mac)
     * Empêche le comportement par défaut du navigateur (Save Page)
     * et déclenche la sauvegarde manuelle du diagramme.
     */
    
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    // Attacher le listener
    window.addEventListener('keydown', handleKeyboard);
     // Cleanup : retirer le listener au démontage
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [projectId]);

/**
   * Charge le projet depuis Firestore
   * Récupère le document Firestore via projectId
   * Vérifie que le projet existe
   * Extrait le XML BPMN du projet
   * Met à jour les states
   */  
  const loadProject = async () => {
    if (!projectId) return;

    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert('Projet introuvable');
        navigate('/dashboard');
        return;
      }

      const projectData = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      } as Project;

      setProject(projectData);
      const xml = await getBpmnXml(projectData);
      setBpmnXml(xml);
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sauvegarde le diagramme dans Firestore
   * Cette fonction est appelée par :
   * - L'auto-save (toutes les 30s)
   * - La sauvegarde manuelle (bouton ou Ctrl+S)
   * IMPORTANT : Met à jour le state local après la sauvegarde
   */
  const handleSave = async (xml: string) => {
    if (!project) return;

    try {
      await updateProject(project.id, { bpmnXml: xml });
      // Mettre à jour le state local
      setBpmnXml(xml)
      // Mettre à jour le projet aussi
      setProject(prev => prev ? { ...prev, bpmnXml: xml } : null);
      console.log('Saved to Firestore');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error during backup');
      throw error;
    }
  };

  /**
   * Sauvegarde manuelle déclenchée par :
   * - Clic sur le bouton "Sauvegarder"
   * - Raccourci clavier Ctrl+S
   * Différence avec l'auto-save
   */
  const handleManualSave = async () => {
    if (!editorRef.current) {
      console.error('Editor not ready');
      return;
    }

    setIsSaving(true);
    try {
      const { xml } = await editorRef.current.saveXML();
      await handleSave(xml);
      toast.success('Backup successful !', {
      duration: 2000,
      position: 'bottom-right',
    });
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };
  //  Fonction pour analyser le diagramme
  const handleAnalyze = async () => {
    if (!editorRef.current || !projectId) {
      console.error('Editor not ready or no project ID');
      return;
    }

    try {
      const { xml } = await editorRef.current.saveXML();
      await analyze(xml, projectId);
      
      toast.success('Analysis complete !', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Analyze failed:', error);
      toast.error('Error during analysis', {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  //  Handlers pour les validation points
  const handleResolve = (pointId: string) => {
    updateStatus(pointId, 'resolved');
    toast.success('Issue resolved !', {
      duration: 1500,
      position: 'bottom-right',
    });
  };

  const handleIgnore = (pointId: string) => {
    updateStatus(pointId, undefined, true);
    toast.success('Point ignored', {
      duration: 1500,
      position: 'bottom-right',
    });
  };

  const focusElement = (elementId: string) => {
  editorRef.current?.focusElement(elementId);
  };
  const currentLayerPoints =
  analysisData?.validation_points.filter(
    p => p.layer === analysisData.progression.current_layer
  ) || [];



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen mt-30">
      <Toaster/>
      <div className="flex items-center gap-4 p-4 border-b bg-white">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-ghost"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-2xl font-bold">{project?.name}</h1>
        {project?.description && (
          <p className="text-gray-600">- {project.description}</p>
        )}
      </div>

      <ToolbarActions
        editorRef={editorRef}
        onManualSave={handleManualSave}
        onBackToView={() => navigate(`/project/${projectId}`)}
        isSaving={isSaving}
        onAnalyze={handleAnalyze}  // Passer la fonction d'analyse
        isAnalyzing={analyzing}     // État du loading
      />

      {/* Layout flex pour canvas + panneau IA */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas BPMN */}
        <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
          <BpmnEditor
            ref={editorRef}
            xml={bpmnXml}
            onSave={handleSave}
            validationPoints={currentLayerPoints}
            height="calc(100vh - 220px)"
          />
        </div>

        {/*  Panneau IA (seulement si analysisData existe) */}
        {analysisData && (
          <div className="w-[33vw] min-w-[350px] bg-white border-l shadow-lg overflow-y-auto">
            <LayerPanel
              analysisData={analysisData}
              onResolve={handleResolve}
              onIgnore={handleIgnore}
              onFocusElement={focusElement}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * <div className="flex-1 p-4 overflow-hidden bg-gray-50">
        <BpmnEditor
          ref={editorRef}
          xml={bpmnXml}
          onSave={handleSave}
          height="calc(100vh - 220px)"
        />
      </div>
      analysisData?.validation_points
 */
