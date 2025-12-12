import { Link } from "react-router-dom"
import bankappicon from "/bankapp.ico";

interface LogoProps {
  showText?: boolean;
}

export default function Logo({ showText = true }: LogoProps) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <img src={bankappicon} alt="bankapp" />
      </div>
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-white to-blue-500 bg-clip-text text-transparent bg-[size:200%] animate-[gradient-wave_3s_linear_infinite] whitespace-nowrap">
          BankApp
        </span>
      )}
    </Link>
  )
}
