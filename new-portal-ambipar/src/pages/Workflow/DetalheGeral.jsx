import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { STRAPI_URL } from "../../services/api";
import { rtToText } from "../../utils/strapi";

export default function DetalheGeral() {
    const { categoria, id } = useParams();
    const [detalhes, setDetalhes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        async function fetchDetalhes() {
            try {
                const res = await api.get(
                    `/card-detalhes?filters[card_list][id][$eq]=${id}&populate=*`
                );
                setDetalhes(res.data.data || []);
            } catch (error) {
                console.error("Erro ao buscar detalhes:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDetalhes();
    }, [id]);

    if (loading) return <p className="text-center mt-10">Carregando detalhes...</p>;
    if (!detalhes.length) return <p className="text-center mt-10">Nenhum detalhe encontrado.</p>;

    const getImgUrl = (url) => `${STRAPI_URL}${url}`;

    return (
        <section className="max-w-7xl mx-auto mt-24 px-6">

            <h2 className="text-3xl font-bold mb-8 text-center text-[#B2CC21] dark:text-[#CDFF00]">
                {detalhes[0].card_list?.titulo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {detalhes.map((det) => {
                    const img = det.imagem_detalhe?.url;

                    return (
                        <div
                            key={det.id}
                            onClick={() => setModalData(det)}
                            className="cursor-pointer p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition"
                        >
                            {img && (
                                <img
                                    src={getImgUrl(img)}
                                    className="w-full h-48 object-cover rounded-md mb-4"
                                    alt={det.title}
                                />
                            )}

                            <h3 className="text-lg font-bold text-[#B2CC21] dark:text-[#CDFF00] text-center">
                                {det.title}
                            </h3>
                        </div>
                    );
                })}
            </div>

            {/* MODAL */}
            {modalData && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-6 z-50">
                    <div className="bg-white dark:bg-gray-900 w-[80%] max-h-[90vh] overflow-y-auto rounded-xl p-8 relative shadow-xl">

                        <button
                            onClick={() => setModalData(null)}
                            className="absolute top-4 right-4 text-xl font-bold text-red-500 hover:text-red-700"
                        >
                            ✖
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-[#B2CC21] dark:text-[#CDFF00] text-center">
                            {modalData.title}
                        </h2>

                        {modalData.imagem_detalhe?.url && (
                            <img
                                src={getImgUrl(modalData.imagem_detalhe.url)}
                                className="w-full rounded-lg shadow mb-6"
                            />
                        )}

                        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                            {rtToText(modalData.descricao_detalhada)}
                        </p>

                        {modalData.arquivo_pdf?.map((file) => (
                            <a
                                key={file.id}
                                href={getImgUrl(file.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold block w-fit mx-auto hover:scale-105 transition mb-4"
                            >
                                📄 {file.name}
                            </a>
                        ))}

                    </div>
                </div>
            )}

            <div className="text-center mt-10">
                <Link to={`/workflow/${categoria}`} className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]">
                    ← Voltar
                </Link>
            </div>
        </section>
    );
}
