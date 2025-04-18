import { Link } from "react-router-dom";
interface LogoProps {
  className?: string;
}
const Logo = ({
  className
}: LogoProps) => {
  return <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className ?? ''}`}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary -mt-1.5">
        <path fill-rule="evenodd" d="M6.3 1.3a1 1 0 0 1 1.33-.08l.08.07L12 5.6l4.3-4.3.07-.07a1 1 0 0 1 1.4 1.41l-.06.08L14.4 6H20a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h5.59l-3.3-3.3-.07-.07A1 1 0 0 1 6.3 1.3Zm13.27 11.34a1.17 1.17 0 0 0-1.8 0 3.17 3.17 0 0 1-4.87 0 1.17 1.17 0 0 0-1.8 0 3.17 3.17 0 0 1-4.87 0 1.17 1.17 0 0 0-1.8 0l-.12.15c-.35.42-.8.75-1.31.96V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5.72a1.3 1.3 0 0 1-.17-.14l-.1-.1-1.16-1.4ZM4 8a1 1 0 0 0-1 1v2.24l.02-.02a3.17 3.17 0 0 1 4.75.14c.47.56 1.33.56 1.8 0a3.17 3.17 0 0 1 4.86 0c.47.56 1.33.56 1.8 0a3.17 3.17 0 0 1 4.77-.12V9a1 1 0 0 0-1-1H4Z" fill="#0765E9"/>
      </svg>
      <h1 className="text-xl font-normal leading-none">Binge<span className="text-muted-foreground font-light">&</span>Tonic</h1>
    </Link>;
};
export default Logo;