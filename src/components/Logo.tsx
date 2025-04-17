
import { TvIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className ?? ''}`}
    >
      <TvIcon className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold">Binge & Tonic</h1>
    </Link>
  );
};

export default Logo;
