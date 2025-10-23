import { useParams, Link } from "react-router-dom";

export default function NoticiaDetalhe() {
    const { id } = useParams();
    const noticias = [
        {
        id: 1,
        titulo: "Ambipar Metal Recycling Participa da feira Eco Expo",
        conteudo: `Ambipar Metal Recycling Participa da feira de negócios, trazendo ao publico mais uma nova forma de reciclar e fazer negócios...`,
        },
        {
        id: 2,
        titulo: "Setembro Amarelo",
        conteudo: `Setembro amarelo traz a concientização para saude mental e social dentro da empresa...`,
        },
        {
        id: 3,
        titulo: "Novo Portal Ambipar Limeira/Andradas",
        conteudo: `Novo Portal Ambipar Limeira/Andradas, trazendo inovação e agilidade para acessos as 
        principais informações acessos a uma gama de ferramentas`,
        },
    ];

    const noticiaIndex = noticias.findIndex((n) => n.id === parseInt(id));
    const noticia = noticias[noticiaIndex];

    const anterior = noticias[noticiaIndex - 1];
    const proxima = noticias[noticiaIndex + 1];

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-[#B2CC21] dark:text-[#CDFF00]">
            {noticia.titulo}
        </h1>
        <p className="leading-relaxed text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {noticia.conteudo}
        </p>

        <div className="flex justify-between mt-12">
            {anterior ? (
            <Link
                to={`/noticias/${anterior.id}`}
                className="text-[#B2CC21] dark:text-[#CDFF00] hover:underline"
            >
                ← {anterior.titulo}
            </Link>
            ) : (
            <span></span>
            )}
            {proxima ? (
            <Link
                to={`/noticias/${proxima.id}`}
                className="text-[#B2CC21] dark:text-[#CDFF00] hover:underline"
            >
                {proxima.titulo} →
            </Link>
            ) : (
            <span></span>
            )}
        </div>

        <div className="mt-10 text-center">
            <Link
            to="/noticias"
            className="inline-block mt-8 text-sm text-gray-600 dark:text-gray-300 underline hover:text-[#B2CC21]"
            >
            ← Voltar para todas as notícias
            </Link>
        </div>
        </section>
    );
}
