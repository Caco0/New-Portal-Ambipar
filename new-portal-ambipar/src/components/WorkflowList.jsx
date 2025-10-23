import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function WorkflowList() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategorias() {
        try {
            const res = await fetch("http://localhost:1337/api/workflow-categorias?populate=*");
            const data = await res.json();
            setCategorias(data.data || []);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        } finally {
            setLoading(false);
        }
        }

        fetchCategorias();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500 mt-10">Carregando categorias...</p>;
    }

    return (
        <section id="workflow" className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Workflow Processos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categorias.map((cat) => (
            <Link
                key={cat.id}
                to={`/workflow/${cat.attributes.slug}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition block"
            >
                <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00] text-lg">
                {cat.attributes.emoji || "📁"} {cat.attributes.titulo}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {cat.attributes.descricao}
                </p>
            </Link>
            ))}
        </div>
        </section>
    );
}
