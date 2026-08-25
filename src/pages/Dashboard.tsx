
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UploadBpmn } from '../Components/projects/UploadBpmn';
import { ProjectList } from '../Components/projects/ProjectList';


/**
 * page de dashboard qui montre l'ensemble des projet de l'utilisateur
 * (en faisant appel a projectlist) et lui 
 * donne la possibilite d'en creer d'autres(UploadBpmn)
 * @returns ensemble de projet d'un utilisateur 
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    setRefreshKey(prev => prev + 1); // Force refresh de ProjectList
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            My BPMN Projects
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.displayName || user?.email} 👋
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Modal Upload */}
      {showUpload && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Create a new project
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X size={20} />
              </button>
            </div>

            <UploadBpmn onSuccess={handleUploadSuccess} />
          </div>
          <div className="modal-backdrop" onClick={() => setShowUpload(false)} />
        </div>
      )}

      {/* Liste des projets */}
      <ProjectList key={refreshKey} />
    </div>
  );
}