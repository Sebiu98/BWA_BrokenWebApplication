import AuthForm from "../components/AuthForm";

const RegisterPage = () => {
  //Pagina registrazione.
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <AuthForm mode="register" />
      </div>
    </main>
  );
};

export default RegisterPage;
