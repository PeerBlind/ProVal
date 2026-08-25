import type z from "zod";
import { loginSchema } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";



// types generes automatiquement depuis zod 
type LoginForData = z.infer<typeof loginSchema>;

/**
 * formulaire de login  avec l'integration de zod pour la verifcation 
 * @returns 
 */
    
function LoginForm(){
  /**
   * const login qui va contacter le provider en passant par le context 
   * pour recuperer le login 
   */
  const {login} = useAuth();

  const [error, setError] = useState<string | null>(null);

  /**
   * initialisation du formulaire avec react hook form et zod 
   * handlesubmit : valide les donnes avec zod 
   * formState: { errors } : contient les erreurs generer par zod 
   * useForm<LoginForData> → typage TypeScript du formulaire
   * resolver: zodResolver(loginSchema) → connecte Zod à React Hook Form
   */
  const {register,handleSubmit,formState: { errors },} = useForm<LoginForData>
  ({resolver: zodResolver(loginSchema),});


  /**
   * fonction appelee uniquement si la validation zod est ok 
   * await : appelle la fonction login defini dans AuthContext
   * @param data 
   */
  const onSubmit = async (data: LoginForData) => {
    try {
      await login(data.email, data.password);
      console.log("connexion reussie")
    } catch (error : any) {
    if (error.code === "auth/wrong-password") {
      setError("Wrong password");
    }
    else {
      setError("Wrong password");
    }
      console.error("Erreur login :", error);
      console.log("Echec de connexion")
    }
  };


  //test chagpt 
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
    navigate("/dashboard");
  }
}, [user]);

//

  
  return(
    <div className=" bg-center bg-no-repeat bg-cover items-center justify-center">
      <div className="flex justify-center" >
        <div className="w-2/3 flex-col gap-4 my-50 bg-white/30 backdrop-blur-md p-40 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)}
           className="flex flex-col gap-6 justify-center">

            <input type="email" {...register("email")}
                className="input w-full rounded-2xl"
                placeholder="E-mail"
            />
            {errors.email && <p className="error">{errors.email.message}</p>}

            <input type="password" {...register("password")}
                className="input w-full rounded-2xl"
                placeholder="Password"
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
            {error && <p className="error">{error}</p>}

            <button type="submit"
            className="btn btn-sm btn-primary rounded-2xl"
            > 
              Log in
            </button>
            <p className="text-center ">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-blue-900 underline">
                Register
              </Link>
            </p>
           
          </form>
        </div>
      </div>
    </div>

  )
}
export default LoginForm

  
