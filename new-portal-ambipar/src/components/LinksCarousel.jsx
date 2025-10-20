import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LinksCarousel() {
    const carouselRef = useRef(null);

    // Rolagem automática
    useEffect(() => {
        const interval = setInterval(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
            left: 250,
            behavior: "smooth",
            });
        }
        }, 4000); // tempo entre rolagens
        return () => clearInterval(interval);
    }, []);

    const scroll = (direction) => {
        if (carouselRef.current) {
        carouselRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
        }
    };

    const links = [
        {
        title: "🌐 Sistema Sygecom",
        url: "https://cloud5.sygecom.com.br/sagi_magma.html",
        color: "border-green-500",
        description: "Link do Sygecom."
        },
        {
        title: "🙋‍♀️ Feedz",
        url: "https://app.feedz.com.br",
        color: "border-blue-500",
        description: "Acesse e-mails, Teams e outros apps corporativos."
        },
        {
        title: "🔧 Chamado TI",
        url: "http://10.0.0.251/glpi/front/central.php",
        color: "border-yellow-500",
        description: "Painéis e relatórios interativos."
        },
        {
        title: "🌐 Nosso Site",
        url: "https://fundicaomagma.com.br/",
        color: "border-purple-500",
        description: "Capacitações internas e vídeos educativos."
        },
        {
        title: "🚚 Logistica",
        url: "https://forms.office.com",
        color: "border-pink-500",
        description: "Envie solicitações e formulários de suporte."
        },
    ];

    return (
        <section className="relative max-w-7xl mx-auto px-6 mt-16 mb-16 pt-4 pb-4">
        <h2 className="text-2xl font-semibold mb-6">Links Rápidos</h2>

        {/* Botões laterais */}
        <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
        >
            <ChevronLeft size={24} />
        </button>

        <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
        >
            <ChevronRight size={24} />
        </button>

        {/* Carrossel */}
        <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 scroll-smooth no-scrollbar pb-8"
        >
            {links.map((link, index) => (
            <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`min-w-[250px] bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${link.color} shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 flex-shrink-0`}
            >
                <h3 className="text-lg font-bold mb-2">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                {link.description}
                </p>
            </a>
            ))}
        </div>
        </section>
    );
}
