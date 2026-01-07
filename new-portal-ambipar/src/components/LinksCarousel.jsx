import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom"; // <-- IMPORTANTE
import "../index.css";

export default function LinksCarousel() {
    const carouselRef = useRef(null);
    const handleManualScroll = (direction) => {
        if (carouselRef.current) {
        carouselRef.current.style.animationPlayState = "paused";
        carouselRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
        setTimeout(() => {
            carouselRef.current.style.animationPlayState = "running";
        }, 5000);
        }
    };

    const links = [
        { title: "🙋‍♀️ Feedz", url: "https://app.feedz.com.br", color: "border-blue-500", description: "Comunidade Ambipar Limeira e Andradas" },
        { title: "🔧 Chamado TI", url: "http://10.0.0.251/glpi/front/central.php", color: "border-yellow-500", description: "Painel de chamados de TI" },
        { title: "🌐 Nosso Site", url: "https://fundicaomagma.com.br/", color: "border-purple-500", description: "Nossa página Web" },
        { title: "🌐 Sistema Sygecom", url: "https://cloud.sygecom.com.br/sagi_magma.html", color: "border-green-500", description: "Processos sistema Sygecom" },
        { title: "🚚 Logística", url: "/logisticalinks", color: "border-pink-500", description: "Links de reatreamento de Logística." },
        { title: "💰 Financeiro", url: "/financeiroLinks", color: "border-green-500", description: "Links Financeiros." },
        { title: "📊 Dashboard", url: "#", color: "border-red-500", description: "Torre de Dados Ambipar (em construção)" },
        { title: "⏱ Registro de Ponto", url: "https://ezpoint.com.br/", color: "border-black", description: "Registro de ponto" },
        { title: "🔁 Workflow Processos", url: "/workflow", color: "border-purple-500", description: "Capacitações e vídeos internos." },
        { title: "👨‍💻 TI Links", url: "/tiLinks", color: "border-yellow-500", description: "Links de serviços de TI" }, // <-- usa rota interna
    ];

    const infiniteLinks = [...links, ...links];

    return (
        <section id="acessos-rapidos" className="relative max-w-[70%] mx-auto overflow-hidden h-[30vh] bg-transparent py-8">
        <h2 className="text-2xl font-semibold text-center mb-8">Acessos Rápidos 🔗</h2>

        <button onClick={() => handleManualScroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-20">
            <ChevronLeft size={24} />
        </button>

        <button onClick={() => handleManualScroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-20">
            <ChevronRight size={24} />
        </button>

        <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white/90 dark:from-gray-900/100 to-transparent z-10"></div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white/90 dark:from-gray-900/100 to-transparent z-10"></div>

            <div ref={carouselRef} className="flex gap-6 animate-scroll-slow w-max">
            {infiniteLinks.map((link, index) =>
                link.url.startsWith("/") ? (
                // Rota interna -> usa Link
                <Link
                    key={index}
                    to={link.url}
                    className={`min-w-[250px] bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${link.color} shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 flex-shrink-0`}
                >
                    <h3 className="text-lg font-bold mb-2 text-black dark:text-[#CDFF00]">{link.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                </Link>
                ) : (
                // Link externo -> usa <a>
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-w-[250px] bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${link.color} shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 flex-shrink-0`}
                >
                    <h3 className="text-lg font-bold mb-2 text-black dark:text-[#CDFF00]">{link.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                </a>
                )
            )}
            </div>
        </div>
        </section>
    );
}
