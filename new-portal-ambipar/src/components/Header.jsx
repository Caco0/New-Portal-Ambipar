import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow z-50 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
            <img
                src="/ambipar-logo-light.png"
                alt="Ambipar Logo"
                className="w-20 h-20 object-contain transition-all dark:hidden"
            />
            <img
                src="/ambipar-logo-dark.png"
                alt="Ambipar Logo Dark"
                className="w-20 h-20 object-contain transition-all hidden dark:block"
            />
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex space-x-6 text-[#B2CC21] dark:text-[#CDFF00]">
            <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white transition-colors"
            >
                Home
            </Link>

            <Link
                to="/#workflow"
                className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white transition-colors"
            >
                Workflow Processos
            </Link>

            <Link
                to="/#acessos-rapidos"
                className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white transition-colors"
            >
                Acessos Rápidos
            </Link>

            <Link
                to="/#reunioes"
                className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white transition-colors"
            >
                Sala de Reuniões
            </Link>

            <Link
                to="/noticias"
                className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white transition-colors"
            >
                Notícias
            </Link>
            </nav>

            {/* Alternador de tema */}
            <ThemeToggle />
        </div>
        </header>
    );
}
