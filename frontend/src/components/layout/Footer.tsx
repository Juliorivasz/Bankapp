import Logo from "../atoms/Logo";


export function Footer() {
  return (
    <footer className="border-t border-white/20 py-6 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-muted-foreground">&copy; 2025 BankApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
