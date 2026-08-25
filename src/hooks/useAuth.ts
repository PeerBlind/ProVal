import { useContext } from "react";
import {AuthContext} from "../contexts/AuthContext"

/**
 * 
 * @returns va chercher les donnees de l'utilisateur dans le 
 * provider et le retourner 
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

