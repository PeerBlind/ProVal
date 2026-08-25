import { createContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import type { User, AuthContextType } from '../types/user.types';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import type { ReactNode } from "react";

/**
 * createContext est une fonction React qui crée un contexte.
Un contexte sert à partager un état ou une fonction à tous les composants de ton 
app sans passer par les props.
| null : le context peut etre null avant le provider 
(null) : valeur par defaut 
 */
export const AuthContext = createContext<AuthContextType | null>(null);


/**
 * c'est le provider , il entre avec firebase et transmet les informations au context 
 * @param param0 
 * @returns 
 */
export const AuthProvider =  ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          createdAT: new Date(firebaseUser.metadata.creationTime ?? ""),
          lastLogin: new Date(firebaseUser.metadata.lastSignInTime ?? "")
        });
      } 
      else {
      setUser(null);
      }

    setLoading(false);
  });

  return unsubscribe;
}, []);

  /**
   * c'est une fonction async qui fait appel a firebase pour se connecter 
   * await : attend le retour de firebase
   * @param email mail de l'utilisateur 
   * @param password mot de passe l'utilisateur 
   */
  const login = async (email: string , password: string) : Promise<void> =>{
    await signInWithEmailAndPassword(auth,email ,password)
  }

  /**
   * c'est une fnction async 
   * cette fonction permet de creer un nouvel utilisateur et le connecte directement 
   * await : attend le retour de firebase
   * @param email mail de l'utilisateur 
   * @param password mot de passe l'utilisateur
   * @param name nom de l'utlisateur 
   */
  const register = async (
    email : string ,
    password : string ,
    name : string ,
  ) : Promise<void> => {
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    // Mettre à jour le displayName dans Firebase ,conseil chagpt a verifier !!!!
    await updateProfile(cred.user, {
      displayName: name,
    });
    
 
  }


  /**
   * fonction async qui permet de deconnecter l'utilisateur 
   */
  const logout = async () : Promise<void> => {
    await signOut(auth)
  }

  /**
   * Il contient toutes les données et fonctions liées à l'authentification
   * qui seront accessibles dans toute l'application via le hook 
   */
  const value: AuthContextType = {
  user,
  loading,
  login ,
  register,
  logout,
  };

  /**
   * AuthContext.Provider rend disponible l'objet `value`
   * à tous les composants enfants de l'application.
   * 
   * Grâce à cela, n'importe quel composant peut utiliser :
   * const { user, login, logout } = useAuth();
   */

  // Fonctions login, register, logout...
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
