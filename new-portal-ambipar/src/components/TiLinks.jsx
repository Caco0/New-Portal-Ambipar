import { Link } from "react-router-dom";

export default function TiLinks() {
    const tiLinks = [
        { id: 1, titulo: "Chamados Sygecom", link: "https://sygecom.acelerato.com/login/normal" },
        { id: 2, titulo: "Chamados O3", link: "https://portal.o3ti.com.br/v/" },
        { id: 3, titulo: "PABX NAVEX", link: "https://pabx.navex.com.br/" },
        { id: 4, titulo: "Central do Assinante NAVEX", link: "http://limeira.navex.com.br:8000/accounts/central/login" },
        { id: 5, titulo: "GLPI NAVEX", link: "https://chamados.navex.com.br/glpi/" },
        { id: 6, titulo: "TS Plus", link: "https://clientes.tsplusbrasil.com.br/login" },
        { id: 7, titulo: "BIT Defender GravityZone", link: "https://gravityzone.bitdefender.com/n" },
    ];

    return (
        <section
        id="tiLinks"
        className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
        <h2 className="text-3xl font-bold text-center mb-10 text-[#B2CC21] dark:text-[#CDFF00]">
            🖥 Links de TI Limeira / Andradas
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
            {tiLinks.map((tiLink) => (
            <a
                key={tiLink.id}
                href={tiLink.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-[#CDFF00]/40 hover:-translate-y-1 transition-all duration-300"
            >
                <h3 className="text-xl font-semibold mb-3 text-[#3a3a3a] dark:text-[#CDFF00]">
                {tiLink.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {tiLink.link}
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
