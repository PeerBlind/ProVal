
export interface Project{
  id: string;                    // ID auto-généré Firestore
  userId: string;                // Propriétaire (pour sécurité)
  name: string;                  // 'Process de facturation'
  description: string;           // Description optionnelle
  createdAt: Date;               // Timestamp création
  updatedAt: Date;               // Timestamp dernière modif

  // Stockage BPMN
  bpmnStoragePath: string;       // 'bpmn/{userId}/{projectId}.bpmn'
  bpmnUrl?: string;              // URL signée Firebase Storage
  // ✅ NOUVEAU : Stocker XML directement
  bpmnXml: string;  // Directement le XML (limite 1MB)

  // Métadonnées
  fileSize: number;              // Taille en bytes
  status: 'draft' | 'validated'; // Statut du projet
  tags: string[];                // ['finance', 'automation']
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  file: File;                    // Fichier .bpmn uploadé



}