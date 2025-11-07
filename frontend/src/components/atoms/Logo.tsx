import { Link } from "react-router-dom"
import bankappicon from "/bankapp.ico";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
        <img src={bankappicon} alt="bankapp" />
      </div>
      <span className="text-2xl bg-gradient-to-r from-blue-500 via-white to-blue-500 bg-clip-text text-transparent bg-[size:200%] animate-[gradient-wave_3s_linear_infinite]">BankApp</span>
    </Link>
  )
}
