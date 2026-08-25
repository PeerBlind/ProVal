import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Download, ArrowLeft } from 'lucide-react';
import type { Project } from '../types/project.types';
import { db } from '../config/firebase';
import { getBpmnXml } from '../services/project.service';
import { BpmnViewer } from '../Components/workspace/BpmnViewer';
import { saveAs } from 'file-saver';


/**
 * Page qui permet d'afficher le detail(Diagramme BPMN en grand format,
 * Nom du diagramme et description) d'un projet recuperer dans la DB
 * @returns 
 */
export const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [bpmnXml, setBpmnXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      // Charger les métadonnées
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

      // Charger le XML BPMN
      const xml = await getBpmnXml(projectData);
      setBpmnXml(xml);
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!bpmnXml || !project) return;

    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    saveAs(blob, `${project.name}.bpmn`);
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (!project || !bpmnXml) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-0 mt-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost"
          >
            <ArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="btn btn-primary"
        >
          <Download /> Download
        </button>
      </div>

      {/* Viewer BPMN */}
      <BpmnViewer xml={bpmnXml} height="calc(100vh - 250px)" />
    </div>
  );
};


