import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { rtToText } from "../../utils/strapi";

export default function NoticiaDetalhe() {
    const { slug } = useParams();
    const [noticia, setNoticia] = useState(null);
    const [relacionadas, setRelacionadas] = useState([]);

    useEffect(() => {
        async function fetchNoticia() {
        try {
            const res = await api.get(
            `/noticias?filters[slug][$eq]=${slug}&populate=imagem_capa`
            );
            setNoticia(res.data.data[0]);
        } catch (error) {
            console.error("Erro ao buscar notícia:", error);
        }
        }

        async function fetchRelacionadas() {
        try {
            // Busca 3 notícias diferentes da atual
            const res = await api.get(
            `/noticias?filters[slug][$ne]=${slug}&populate=imagem_capa&sort=publishedAt:desc&pagination[limit]=3`
            );
            setRelacionadas(res.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar relacionadas:", error);
        }
        }

        fetchNoticia();
        fetchRelacionadas();
    }, [slug]);

    if (!noticia) return <p className="text-center mt-20">Carregando notícia...</p>;

    const info = noticia;

    return (
        <section className="max-w-4xl mx-auto px-6 py-16">
        {info.imagem_capa?.url && (
            <img
            src={`http://localhost:1337${info.imagem_capa.formats?.large?.url || info.imagem_capa.url}`}
            className="w-full rounded-xl shadow-lg mb-6"
            alt={info.titulo}
            />
        )}

        <h1 className="text-4xl font-bold mb-6 text-[#B2CC21] dark:text-[#CDFF00]">
            {info.titulo}
        </h1>

        <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-line">
            {rtToText(info.conteudo_completo)}
        </p>

        {/* Seção Veja também */}
        {relacionadas.length > 0 && (
            <div className="mt-16">
            <h2 className="text-2xl font-semibold text-[#B2CC21] dark:text-[#CDFF00] mb-6">Veja também:</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relacionadas.map((item) => (
                <Link
                    key={item.id}
                    to={`/noticias/${item.slug}`}
                    className="flex gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-300/40 transition-all duration-300"
                >
                    {item.imagem_capa?.url && (
                    <img
                        src={`http://localhost:1337${item.imagem_capa.formats?.small?.url || item.imagem_capa.url}`}
                        className="w-28 h-28 object-cover flex-shrink-0"
                        alt={item.titulo}
                    />
                    )}

                    <div className="p-3 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                        {item.titulo}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {item.descricao_curta
                        ? item.descricao_curta
                        : rtToText(item.conteudo_completo).slice(0, 80)}
                        ...
                    </p>
                    </div>
                </Link>
                ))}
            </div>
            </div>
        )}

        <div className="text-center mt-12">
            <Link to="/noticias" className="underline text-[#B2CC21] dark:text-[#CDFF00]">
            ← Voltar para notícias
            </Link>
        </div>
        </section>
    );
}
