import { useEffect, useState } from "react";

export default function ThemeToggle() {
    // Verifica o tema inicial (salvo ou padrão do sistema)
    const getInitialTheme = () => {
        if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
        }
        return "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // Atualiza o tema no documento e salva
    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        } else {
        root.classList.remove("dark");
        root.classList.add("light");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        title="Alternar tema"
        >
        {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}
