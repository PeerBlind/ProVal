import {collection, addDoc, getDocs, doc, deleteDoc, query, where,serverTimestamp, updateDoc } from 'firebase/firestore';
import type { CreateProjectDTO, Project } from '../types/project.types';
import { db } from '../config/firebase';



// Créer un projet
/**fonction async 
 * cette fonction permet a l'utilisateur de créer un projet 
 * @param userId : identifiant de l'utilisateur 
 * @param data : autres données pour la creation 
 * @returns 
 */
export async function createProject(
  userId: string,
  data: CreateProjectDTO
): Promise<string> {
  try {
    //console.log('Creating project for user:', userId);
    
    // Lire le contenu du fichier
    const xmlContent = await data.file.text();
    
    // Créer dans Firestore
    const projectRef = await addDoc(collection(db, 'projects'), {
      userId,
      name: data.name,
      description: data.description || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fileSize: data.file.size,
      bpmnXml: xmlContent,
      status: 'draft',
      tags: []
    });

    //console.log('✅ Project created:', projectRef.id);
    return projectRef.id;
    
  } catch (error) {
    console.error('❌ Error creating project:', error);
    throw new Error('Impossible de créer le projet');
  }
}

// Récupérer les projets de l'utilisateur
/**
 * function async qui permet de questionner la base des donnees pour recuperer 
 * la liste de tout le projet de L'utilisateur
 * @param userId : identifiant de l'utilisateur
 * @returns 
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  //console.log('Fetching projects for user:', userId);
  
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  //console.log('✅ Projects found:', snapshot.size);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Project));
}

// Récupérer le XML BPMN
/**
 * fonction qui recupere le bpmn dans la base de données 
 * @param project 
 * @returns 
 */
export async function getBpmnXml(project: Project): Promise<string> {
  //console.log('📥 getBpmnXml called');
  
  if (!project.bpmnXml) {
    throw new Error('Pas de contenu BPMN disponible');
  }
  
  //console.log('✅ Returning XML, length:', project.bpmnXml.length);
  return project.bpmnXml;
}

// Supprimer un projet
/**
 * fonction qui permet de supprimer un projet a partir de son ID 
 * @param projectId 
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    //console.log('Deleting project:', projectId);
    await deleteDoc(doc(db, 'projects', projectId));
    console.log('✅ Project deleted');
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    throw new Error('Impossible de supprimer le projet');
  }
}

/**
 * fonction qui permet de modifier le le diagramme 
 * @param projectId 
 * @param updates 
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    console.log('Updating project:', projectId);
    
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Project updated');
  } catch (error) {
    console.error('❌ Error updating project:', error);
    throw new Error('Impossible de mettre à jour le projet');
  }
}
