import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createProject } from '../../services/project.service';



/**
 * fonction qui permet a l'utilisateur d'uploader un diagramme 
 * elle recoit en input l'evenement onSuccess 
 * @param param0 
 * @returns 
 */
export const UploadBpmn = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configuration react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      //type de fichier accepter
      'application/xml': ['.bpmn', '.xml']
    },
    //restriction sur le fichier 
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB max
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        // Auto-remplir le nom si vide
        if (!name) {
          const fileName = acceptedFiles[0].name.replace('.bpmn', '');
          setName(fileName);
        }
      }
    }
  });

  // verification avant de soumettre
  // c'est une fonction async 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError('');

    try {
      await createProject(user.uid, { name, description, file });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4" size={48} />
        {file ? (
          <p>Selected file  : {file.name}</p>
        ) : (
          <p>Drag and drop a .bpmn file or click to select</p>
        )}
      </div>

      {/* Nom du projet */}
      <input
        type="text"
        placeholder="Project name"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Description */}
      <textarea
        placeholder="Description (optional)"
        className="textarea textarea-bordered w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!file || loading}
      >
        {loading ? 'Uploading in progress...' : 'Create the project'}
      </button>
    </form>
  );
};
