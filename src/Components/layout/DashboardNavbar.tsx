import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * function qui contient la navbar de la page dashboard avec quelques boutton
 * @returns 
 */
export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNewProject = () => {
    window.location.reload(); // temporaire
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 border-b px-6 pt-25">

      <div className="flex-1">
        <h1 className="text-xl font-bold">
          BPMN AI Assistant
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handleNewProject}
          className="btn btn-primary btn-sm"
        >
          New Project
        </button>

        <button
        className="btn btn-primary btn-sm"
        >
          Analyze
        </button>

        <span className="text-sm">
          {user?.displayName}
        </span>

        <button
          className="btn btn-outline btn-sm"
        >
          Your Projects
        </button>
      </div>
    </div>
  );
}

