// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import data from "../../data/workflowData.json"; // ✅ Import local JSON

// export default function DetalheGeral() {
//     const { categoria, id } = useParams();
//     const [card, setCard] = useState(null);

//     useEffect(() => {
//         const workflow = data.workflow.find((w) => w.slug === categoria);
//         if (workflow) {
//         const foundCard = workflow.cards.find((c) => c.id === Number(id));
//         setCard(foundCard || null);
//         } else {
//         setCard(null);
//         }
//     }, [categoria, id]);

//     if (!card) {
//         return <p className="text-center mt-10">Detalhe não encontrado.</p>;
//     }

//     const detalhe = card.detalhe || {};

//     return (
//         <section className="max-w-3xl mx-auto mt-24 px-6 text-center">
//         <h2 className="text-3xl font-bold mb-4 text-[#B2CC21] dark:text-[#CDFF00]">
//             {card.titulo}
//         </h2>
//         <p className="text-gray-600 dark:text-gray-300 mb-6">
//             {detalhe.descricao_detalhada || card.description}
//         </p>

//         {detalhe.imagem_detalhe && (
//             <img
//             src={detalhe.imagem_detalhe}
//             alt={card.titulo}
//             className="w-full rounded-xl shadow-lg mb-6"
//             />
//         )}

//         {detalhe.arquivo_pdf && (
//             <a
//             href={detalhe.arquivo_pdf}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
//             >
//             📃 Abrir PDF
//             </a>
//         )}

//         <div className="mt-10">
//             <Link
//             to={`/workflow/${categoria}`}
//             className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]"
//             >
//             ← Voltar
//             </Link>
//         </div>
//         </section>
//     );
// }


import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { rtToText } from "../../utils/strapi";


export default function DetalheGeral() {
    const { categoria, id } = useParams();
    const [detalhes, setDetalhes] = useState([]);

    useEffect(() => {
        async function fetchData() {
        try {
            const res = await api.get(`/card-detalhes?filters[card_list][id][$eq]=${id}&populate=*`);
            setDetalhes(res.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar detalhes:", error);
        }
        }
        fetchData();
    }, [id]);

    if (!detalhes.length) return <p className="text-center mt-10">Nenhum detalhe encontrado.</p>;

    return (
        <section className="max-w-3xl mx-auto mt-24 px-6">
        {detalhes.map((det) => (
            <div key={det.id} className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#B2CC21] dark:text-[#CDFF00]">
                {det.title}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
                {rtToText(det.descricao_detalhada)}
            </p>

            {det.imagem_detalhe?.url && (
                <img src={`http://localhost:1337${det.imagem_detalhe.url}`} className="w-full rounded-xl shadow-lg mb-6" />
            )}

            {det.arquivo_pdf?.map((file) => (
                <a
                key={file.id}
                href={`http://localhost:1337${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold block w-fit mx-auto hover:scale-105 transition mb-4"
                >
                📄 Abrir PDF
                </a>
            ))}
            </div>
        ))}

        <div className="text-center">
            <Link to={`/workflow/${categoria}`} className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]">
            ← Voltar
            </Link>
        </div>
        </section>
    );
}



