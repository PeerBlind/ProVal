//chemin proteger , on ne peut y avoir acces que si l'utlisateur est connecter 
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { JSX } from "react";

type Props = { children: JSX.Element };

export const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};
