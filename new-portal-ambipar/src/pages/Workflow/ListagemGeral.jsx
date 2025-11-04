import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import data from "../../data/workflowData.json"; // ✅ Import local JSON

export default function ListagemGeral() {
    const { categoria } = useParams();
    const [workflow, setWorkflow] = useState(null);

    useEffect(() => {
        const foundWorkflow = data.workflow.find((w) => w.slug === categoria);
        setWorkflow(foundWorkflow || null);
    }, [categoria]);

    if (!workflow) {
        return <p className="text-center mt-10">Nenhum workflow encontrado.</p>;
    }

    const cards = workflow.cards || [];

    return (
        <section className="max-w-6xl mx-auto mt-24 px-6">
        <h2 className="text-3xl font-bold mb-8 text-center capitalize text-[#B2CC21] dark:text-[#CDFF00]">
            {workflow.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card) => (
            <Link
                key={card.id}
                to={`/workflow/${categoria}/${card.id}`}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition-all"
            >
                <h3 className="text-xl text-[#B2CC21] dark:text-[#CDFF00] font-semibold">{card.titulo}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{card.description}</p>
            </Link>
            ))}
        </div>
        </section>
    );
}


// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import api from "../../services/api";

// export default function ListagemGeral() {
//     const { categoria } = useParams();
//     const [workflow, setWorkflow] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         async function fetchCards() {
//         try {
//             const res = await api.get(`/workflows?filters[slug][$eq]=${categoria}&populate=deep`);
//             setWorkflow(res.data.data[0] || null);
//         } catch (error) {
//             console.error("Erro ao buscar cards:", error);
//         } finally {
//             setLoading(false);
//         }
//         }

//         fetchCards();
//     }, [categoria]);

//     if (loading) return <p className="text-center mt-10">Carregando cards...</p>;
//     if (!workflow) return <p className="text-center mt-10">Nenhum workflow encontrado.</p>;

//     const cards = workflow.attributes.cards?.data || [];

//     return (
//         <section className="max-w-6xl mx-auto mt-24 px-6">
//         <h2 className="text-3xl font-bold mb-8 text-center capitalize text-[#B2CC21] dark:text-[#CDFF00]">
//             {workflow.attributes.title}
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {cards.map((card) => (
//             <Link
//                 key={card.id}
//                 to={`/workflow/${categoria}/${card.id}`}
//                 className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition-all"
//             >
//                 <h3 className="text-xl font-semibold">{card.attributes.titulo}</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
//                 {card.attributes.description}
//                 </p>
//             </Link>
//             ))}
//         </div>
//         </section>
//     );
// }
