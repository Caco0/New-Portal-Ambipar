import { Link } from "react-router-dom";

export default function () {
    const noticias = [
        {
            id: 1,
            titulo: "Ambipar Metal Recycling Participa da feira ...",
            resumo: 
            "Ambipar Metal Recycling Participa da feira de negócios, trazendo ao publico mais uma nova forma de reciclar e fazer negócios...",
        },
        {
            id: 2,
            titulo: "Setembro Amarelo",
            resumo: "Setembro amarelo traz a concientização para saude mental e social dentro da empresa...",
        },
        {
            id: 3,
            titulo: "Novo Portal Ambipar Limeira/Andradas",
            resumo: "Novo Portal Ambipar Limeira/Andradas, trazendo inovação e agilidade para acessos as principais informações acessos a uma gama de ferramentas"
        }
    ];

    return (
        <section 
        id="noticias"
        className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-3xl font-bold text-center mb-10 text-[#B2CC21] dark:text-[#CDFF00]">
                📰 Notícias Ambipar Limeira / Andradas
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
                {noticias.map((noticias) => (
                    <Link 
                    key={noticias.id}
                    to={`/noticias/${noticias.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-[#CDFF00]/40 hover:-translate-y-1 transition-all duration-300">
                        <h3 className="text-xl font-semibold mb-3 text-[#3a3a3a] dark:text-[#CDFF00]">
                            {noticias.titulo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {noticias.resumo}
                        </p>
                        <span className="block mt-4 text-[#B2CC21] dark:text-[#CDFF00] font-medium">
                            Leia mais →
                        </span>
                    </Link>
                ))}
            </div>

        </section>
    )
}