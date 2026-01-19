import { Suspense } from "react";
import AuthForm from "../components/AuthForm";

const RegisterPage = () => {
  //Pagina registrazione.
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-6 py-16">
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-5xl justify-center text-sm text-slate-600">
            Loading form...
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-5xl justify-center">
          <AuthForm mode="register" />
        </div>
      </Suspense>
    </main>
  );
};

export default RegisterPage;
