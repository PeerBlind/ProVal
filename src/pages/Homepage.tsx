import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-blue-100 to-blue-200">
      {/* Hero Section */}
      <section className="text-center px-6 md:px-0 max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">
          Process validation AI Assistant
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          Simplify your business process model validation with artificial intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-500 text-white px-8 py-3 rounded-2xl hover:bg-blue-600 transition"
          >
            Register
          </button>

          <button
            onClick={() => navigate("/login")}
            className="bg-white border border-blue-500 text-blue-500 px-8 py-3 rounded-2xl hover:bg-blue-50 transition"
          >
            Log in
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-2xl p-5 shadow-sm text-left">
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
      </section>
    </div>
  );
}