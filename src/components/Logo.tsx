import { Link } from "react-router-dom";
interface LogoProps {
  className?: string;
}
const Logo = ({
  className
}: LogoProps) => {
  return <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className ?? ''}`}>
      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary -mt-1.5">
        <path d="M21 9a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9Zm2 11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v11Z" fill="#0765E9" />
        <path d="M16.37 1.22a1 1 0 0 1 1.4 1.41l-.06.08-5 5a1 1 0 0 1-1.42 0l-5-5-.07-.08a1 1 0 0 1 1.41-1.4l.08.06L12 5.6l4.3-4.3.07-.07ZM18.6 11.82a2.75 2.75 0 0 1 3.92 0l.1.12.07.08a1 1 0 0 1-1.5 1.3l-.07-.06-.06-.06a.75.75 0 0 0-1 0l-.06.06a2.75 2.75 0 0 1-4.03.1l-.1-.1a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.02.1l-.1-.1a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.03.1l-.1-.1a.75.75 0 0 0-1.07-.06l-.06.06-.09.1c-.34.39-.78.68-1.27.84l-.21.06-.26.06a1 1 0 0 1-.47-1.95l.26-.06.13-.04a.87.87 0 0 0 .32-.23l.09-.1.1-.12a2.75 2.75 0 0 1 4.03.12l.06.06c.3.28.79.26 1.06-.06l.11-.12a2.75 2.75 0 0 1 4.03.12l.05.06c.3.28.8.26 1.07-.06l.1-.12a2.75 2.75 0 0 1 4.03.12l.06.06c.3.28.79.26 1.07-.06l.1-.12Z" fill="#0765E9" />
      </svg>
      <h1 className="text-xl font-normal leading-none">Binge<span className="text-muted-foreground">&</span>Tonic</h1>
    </Link>;
};
export default Logo;