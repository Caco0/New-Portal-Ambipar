import { Link } from "react-router-dom";

export default function LogisticaLinks() {
    const logisticalinks = [
        { id: 1, titulo: "Rastreamento de Carros", link: "https://7974-rastersat.rastersatrastreamento.com.br/" },
        { id: 2, titulo: "Rastreamento de Caminhões", link: "https://isat.sagisolutions.com/login" },
        { id: 3, titulo: "Rastreamento de Iscas", link: "https://ap3.stc.srv.br/webcliente/corpvs/" },
        { id: 4, titulo: "Mapeia (Cálculo de Rota)", link: "https://www.mapeia.com.br/" },
        { id: 5, titulo: "GOOGLE MAPS", link: "https://www.google.com.br/maps/@-22.6161952,-47.480832,15z?entry=ttu&g_ep=EgoyMDI1MTExNi4wIKXMDSoASAFQAw%3D%3D" },
    ];

    return (
        <section
        id="tiLinks"
        className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
        <h2 className="text-3xl font-bold text-center mb-10 text-[#B2CC21] dark:text-[#CDFF00]">
            🚚 Links de Logistica
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
            {logisticalinks.map((logisticalink) => (
            <a
                key={logisticalink.id}
                href={logisticalink.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-[#CDFF00]/40 hover:-translate-y-1 transition-all duration-300"
            >
                <h3 className="text-xl font-semibold mb-3 text-[#3a3a3a] dark:text-[#CDFF00]">
                {logisticalink.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {logisticalink.link.length > 30
                        ? logisticalink.link.slice(0, 30) + "..."
                        : logisticalink.link}
                </p>
                <span className="block mt-4 text-[#B2CC21] dark:text-[#CDFF00] font-medium">
                Acessar →
                </span>
            </a>
            ))}
        </div>
        </section>
    );
}
