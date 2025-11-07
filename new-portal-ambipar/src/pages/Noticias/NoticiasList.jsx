import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { rtToText } from "../../utils/strapi";

export default function NoticiasList() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNoticias() {
        try {
            const res = await api.get("/noticias?populate=imagem_capa&sort=publishedAt:desc");
            console.log("🔥 RESPOSTA DO STRAPI:", res.data.data);
            setNoticias(res.data.data || []);
        } catch (error) {
            console.error("❌ Erro ao buscar notícias:", error);
        } finally {
            setLoading(false);
        }
        }
        fetchNoticias();
    }, []);

    if (loading) return <p className="text-center mt-20">Carregando notícias...</p>;
    if (noticias.length === 0) return <p className="text-center mt-20">Nenhuma notícia encontrada.</p>;

    const destaque = noticias[0];
    const demais = noticias.slice(1);

    return (
        <section className="max-w-7xl mx-auto px-6 mt-24 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Coluna da notícia principal (ocupa 2 colunas no desktop) */}
            <Link
            to={`/noticias/${destaque.slug}`}
            className="lg:col-span-2 block"
            >
            <div className="rounded-2xl overflow-hidden shadow-xl hover:shadow-green-400/40 transition-all duration-300">
                {destaque.imagem_capa?.url && (
                <img
                    src={`http://localhost:1337${destaque.imagem_capa.formats?.large?.url || destaque.imagem_capa.url}`}
                    className="w-full max-h-[450px] object-cover"
                    alt={destaque.titulo}
                />
                )}
            </div>

            <h1 className="text-4xl font-bold mt-6 text-[#B2CC21] dark:text-[#CDFF00] leading-tight">
                {destaque.titulo}
            </h1>

            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
                {destaque.descricao_curta
                    ? destaque.descricao_curta
                    : rtToText(destaque.conteudo_completo).slice(0, 200)}
            </p>
            </Link>

            {/* Coluna lateral (notícias menores) */}
            <div className="space-y-6">
            {demais.map((noticia) => (
                <Link
                key={noticia.id}
                to={`/noticias/${noticia.slug}`}
                className="flex gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-300/40 transition-all duration-300"
                >
                {noticia.imagem_capa?.url && (
                    <img
                    src={`http://localhost:1337${noticia.imagem_capa.formats?.small?.url || noticia.imagem_capa.url}`}
                    className="w-28 h-28 object-cover flex-shrink-0"
                    alt={noticia.titulo}
                    />
                )}

                <div className="p-3 flex flex-col justify-center">
                    <h2 className="text-base font-bold text-[#B2CC21] dark:text-[#CDFF00] leading-tight">
                    {noticia.titulo}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {noticia.descricao_curta
                        ? noticia.descricao_curta
                        : rtToText(noticia.conteudo_completo).slice(0, 80)}
                    </p>
                </div>
                </Link>
            ))}
            </div>

        </section>
        );

}
