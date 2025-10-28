import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function WorkflowList() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkflows() {
        try {
            const res = await api.get("/workflows?populate=deep");
            setWorkflows(res.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar workflows:", error);
        } finally {
            setLoading(false);
        }
        }

        fetchWorkflows();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500 mt-10">Carregando workflows...</p>;
    }

    return (
        <section id="workflow" className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Workflow Processos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {workflows.map((wf) => (
            <Link
                key={wf.id}
                to={`/workflow/${wf.attributes.slug}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition block"
            >
                <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00] text-lg">
                {wf.attributes.icon || "📁"} {wf.attributes.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {wf.attributes.description}
                </p>
            </Link>
            ))}
        </div>
        </section>
    );
}

