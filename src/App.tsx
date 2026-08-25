import Header from "./Components/layout/Header";
import Footer from "./Components/layout/Footer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Homepage";
import Register from "./pages/Register";
import { ProjectDetail } from "./pages/Projectdetail";
import { ProtectedRoute } from "./Components/auth/ProtectedRoute";
import ProjectEditorPage from "./pages/ProjectEditor";



function App() {
const {user , loading} = useAuth();

if (loading){
  return <p> Chargement....</p>
}

return (
  <Router>
    <Header />
      <main>
        <Routes>
           {/* Page d'accueil publique */}
          <Route path="/" element={<HomePage />} />

          {/* Page login : redirection automatique si déjà connecté */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />

          {/* Page register : redirection apres l'enregistrement du compte */}
          <Route path="/register" element = {<Register />}/>

          {/* Dashboard : page protégée */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          {/**Page historique de projet */}
          <Route
              path="/project/:projectId"
              element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>}
          />

          {/* NOUVELLE ROUTE : Éditeur */}
        <Route path="editor/:projectId" element={<ProjectEditorPage />} />
            
        </Routes>
      </main>
    <Footer />
  </Router>
  
  
  )
}
export default App

