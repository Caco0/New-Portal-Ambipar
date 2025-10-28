import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

export default function DetalheGeral() {
    const { categoria, id } = useParams();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCard() {
        try {
            const res = await api.get(`/cards/${id}?populate=deep`);
            setCard(res.data.data);
        } catch (error) {
            console.error("Erro ao buscar card:", error);
        } finally {
            setLoading(false);
        }
        }

        fetchCard();
    }, [id]);

    if (loading) return <p className="text-center mt-10">Carregando detalhes...</p>;
    if (!card) return <p className="text-center mt-10">Detalhe não encontrado.</p>;

    const detalhe = card.attributes.card_detalh?.data?.attributes;

    return (
        <section className="max-w-3xl mx-auto mt-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#B2CC21] dark:text-[#CDFF00]">
            {card.attributes.titulo}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            {detalhe?.descricao_detalhada || card.attributes.description}
        </p>

        {detalhe?.imagem_detalhe?.data && (
            <img
            src={`http://localhost:1337${detalhe.imagem_detalhe.data.attributes.url}`}
            alt={card.attributes.titulo}
            className="w-full rounded-xl shadow-lg mb-6"
            />
        )}

        {detalhe?.arquivo_pdf?.data && (
            <a
            href={`http://localhost:1337${detalhe.arquivo_pdf.data.attributes.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
            >
            📃 Abrir PDF
            </a>
        )}

        <div className="mt-10">
            <Link
            to={`/workflow/${categoria}`}
            className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]"
            >
            ← Voltar
            </Link>
        </div>
        </section>
    );
}
