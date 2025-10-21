import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light";
        setTheme(storedTheme);

        if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.remove("dark");
        }
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.remove("dark");
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md fixed w-full top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-1 flex justify-between items-center">
            {/* Logo + Nome */}
            <div className="flex items-center space-x-1">
            <h1 className="text-2xl font-bold text-gray-800 mr-2 dark:text-gray-100">
                Portal
            </h1>
            <img
                src={theme === "dark" ? "/ambipar-logo-dark.png" : "/ambipar-logo-light.png"}
                alt="Ambipar Logo"
                className="ml-8 mt-2 w-20 h-20 object-contain transition-all" 
            />
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex space-x-6 text-[#B2CC21] dark:text-[#CDFF00]">
            <a href="#" className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white">Home</a>
            <a href="workflow-processos" className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white">Workflow Processos</a>
            <a href="#" className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white">Acessos Rápidos</a>
            <a href="#" className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white">Sala de Reuniões</a>
            <a href="#" className="text-black dark:text-[#CDFF00] hover:text-[#B2CC21] dark:hover:text-white">Ferramentas</a>
            </nav>

            {/* Botões */}
            <div className="flex items-center space-x-4">
            <ThemeToggle onThemeChange={handleThemeChange} currentTheme={theme} />
            <button
                className="md:hidden text-2xl"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>
            </div>
        </div>

        {/* Menu Mobile */}
        {open && (
            <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700">
            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Home</a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Workflow Processos</a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Links</a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Agenda</a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Ferramentas</a>
            </nav>
        )}
        </header>
    );
}

