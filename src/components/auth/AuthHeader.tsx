
import Logo from "@/components/Logo";

const AuthHeader = () => {
  return (
    <header className="bg-black border-b border-border py-4 px-6">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Logo />
      </div>
    </header>
  );
};

export default AuthHeader;
