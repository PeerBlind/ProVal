
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ useNavigate, pas Navigate
import { Trash2, Eye, Download, Edit } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Project } from '../../types/project.types';
import { deleteProject, getUserProjects } from '../../services/project.service';

/**
 * fonction qui liste tout le projet de l'utilisateur en le mettant sous forme de card 
 * @returns 
 */
export const ProjectList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  // ✅ Appeler le hook
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await getUserProjects(user!.uid);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Supprimer "${project.name}" ?`)) return;

    try {
      await deleteProject(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No projects at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div key={project.id} className="card bg-base-200 rounded-md shadow-lg">
          <div className="card-body">
            <h3 className="card-title">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-gray-600">{project.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Created on {project.createdAt.toLocaleDateString('fr-FR')}
            </p>

            <div className="card-actions justify-end mt-4">
              {/* CORRECTION : navigate (fonction) pas Navigate (composant) */}
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => {
                  console.log('Navigating to project:', project.id);
                  navigate(`/project/${project.id}`);  //  Minuscule = fonction
                }}
              >
                <Eye size={16} />
                See
              </button>
              {/* NOUVEAU : Bouton Éditer */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                  <Edit size={16} /> Edit
              </button>

              
              <button className="btn btn-sm btn-ghost">
                <Download size={16} />
              </button>
              
              <button
                className="btn btn-sm btn-error"
                onClick={() => handleDelete(project)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};