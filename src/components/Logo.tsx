import { Link } from "react-router-dom";
interface LogoProps {
  className?: string;
}
const Logo = ({
  className
}: LogoProps) => {
  return <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className ?? ''}`}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary -mt-1.5">
        <path fill-rule="evenodd" d="M6.3 1.3a1 1 0 0 1 1.33-.08l.08.07L12 5.6l4.3-4.3.07-.07a1 1 0 0 1 1.4 1.41l-.06.08L14.4 6H20a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h5.59l-3.3-3.3-.07-.07A1 1 0 0 1 6.3 1.3Zm9.6 11.99c-.78-.6-1.86-.6-2.64 0a4.14 4.14 0 0 1-5.08 0c-.78-.6-1.86-.6-2.64 0l-.05.04c-.5.38-1.06.65-1.66.79l-.26.05-.4.07a1 1 0 0 1-.17 0V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6.73l-.02.02a4.14 4.14 0 0 1-5.08 0ZM4 8a1 1 0 0 0-1 1v3.24l.25-.04.13-.03c.32-.07.62-.21.88-.41l.06-.05.28-.2a4.15 4.15 0 0 1 4.8.2c.78.6 1.86.6 2.64 0l.28-.2a4.14 4.14 0 0 1 4.8.2l.15.1c.76.5 1.76.46 2.48-.1l.77-.6.1-.07c.12-.08.25-.13.38-.18V9a1 1 0 0 0-1-1H4Z" fill="#2563eb"/>
      </svg>
      <h1 className="text-xl font-normal leading-none">Binge<span className="text-muted-foreground font-light">&</span>Tonic</h1>
    </Link>;
};
export default Logo;