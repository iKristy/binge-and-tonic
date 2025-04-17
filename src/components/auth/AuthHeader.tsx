
import { Link } from "react-router-dom";
import { TvIcon } from "lucide-react";

const AuthHeader = () => {
  return (
    <header className="bg-black border-b border-border py-4 px-6">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <TvIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Binge & Tonic</h1>
        </Link>
      </div>
    </header>
  );
};

export default AuthHeader;
