import type z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * c'est une fonctionqui permet a un utilisateur qui ne possede pas encore de s'enregistrer 
 * @returns 
 */
function RegisterForm() {
  const { register: registerUser } = useAuth();

  //test chagpt 
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.displayName);
      console.log("Inscription réussie");
    } catch (error) {
      console.error("Erreur inscription :", error);
    }
  };

  return (
    <div className=" bg-center bg-no-repeat bg-cover items-center justify-center">
      <div className="flex justify-center">
        <div className="w-2/3 flex-col gap-4 my-50 bg-white/30 backdrop-blur-md p-40 rounded-2xl">
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            <input
              {...register("displayName")}
              className="input w-full rounded-2xl"
              placeholder="Name"
            />
            {errors.displayName && <p className="error">{errors.displayName.message}</p>}

            <input
              {...register("email")}
              className="input w-full rounded-2xl"
              placeholder="E-mail"
            />
            {errors.email && <p className="error">{errors.email.message}</p>}

            <input
              type="password"
              {...register("password")}
              className="input w-full rounded-2xl"
              placeholder="Password"
            />
            {errors.password && <p className="error">{errors.password.message}</p>}

            <input
              type="password"
              {...register("confirmPassword")}
              className="input w-full rounded-2xl"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

            <button
              type="submit"
              className="btn btn-sm btn-primary rounded-2xl"
            >
              Register
            </button>

            <p className="text-center">
              Do you already have an account?{" "}
              <Link to="/login" className="text-blue-900 underline">
                Log in
              </Link>
            </p>

          </form>

          {/* Privacy Notice */}
          <div className="mt-6 bg-white/70 backdrop-blur-sm border border-blue-200 rounded-2xl p-5 shadow-sm text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-700">
                Privacy & anonymity notice:
              </span>{" "}
              Users may remain fully anonymous by using a fictitious email
              address (e.g. Tester4525@gmail.com). The email address and password
              provided do not need to be linked to a real account and are used
              solely as session identifiers within the context of this research
              prototype.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RegisterForm;