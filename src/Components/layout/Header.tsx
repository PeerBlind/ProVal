import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";




/**
 * c'est le header de la page avec la navbar 
 * @returns 
 */
function Header() {
  const {logout} = useAuth();
  const navigate = useNavigate;

  const handleLogout = async () => {
    try {
      await logout();
    } catch(error){
       console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <header className="
      navbar
      fixed top-0 left-0 z-50
      w-full
      bg-transparent
      text-black
      backdrop-blur-md
    ">
      <div className="flex-1">
        <a className="text-xl gap-2 text-white" href="../">
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><a href="../">Home</a></li>
          <li><a  onClick={handleLogout}>Logout</a></li>
        </ul>
      </div>
    </header>
  );
}export default Header 