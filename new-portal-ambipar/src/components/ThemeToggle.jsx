import { useEffect, useState } from "react";

export default function ThemeToggle({ onThemeChange, currentTheme }) {
    const [theme, setTheme] = useState(currentTheme || "light");

    useEffect(() => {
        setTheme(currentTheme);
    }, [currentTheme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        onThemeChange(newTheme);
    };

    return (
        <button
        onClick={toggleTheme}
        className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        title="Alternar tema"
        >
        {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}

