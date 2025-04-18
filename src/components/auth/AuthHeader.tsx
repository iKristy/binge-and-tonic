import Logo from "@/components/Logo";

const AuthHeader = () => {
  return (
    <header className="bg-black border-b border-border py-4 px-6">
      <div className="mx-auto max-w-md flex items-center justify-center">
        <Logo />
      </div>
    </header>
  );
};

export default AuthHeader;
