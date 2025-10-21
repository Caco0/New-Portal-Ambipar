import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../index.css"; // vamos usar uma animação customizada definida lá

export default function LinksCarousel() {
    const carouselRef = useRef(null);

    const handleManualScroll = (direction) => {
        if (carouselRef.current) {
            // pausa a animação CSS
            carouselRef.current.style.animationPlayState = "paused";

            // faz o scroll manual
            carouselRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
            });

            // retoma a animação após 5 segundos
            setTimeout(() => {
            carouselRef.current.style.animationPlayState = "running";
            }, 5000);
        }
};

    const links = [
        {
        title: "🌐 Sistema Sygecom",
        url: "https://cloud5.sygecom.com.br/sagi_magma.html",
        color: "border-green-500",
        description: "Processos sistema Sygecom"
        },
        {
        title: "🙋‍♀️ Feedz",
        url: "https://app.feedz.com.br",
        color: "border-blue-500",
        description: "Acesse nossa Comunidade Ambipar Limeira e Andradas"
        },
        {
        title: "🔧 Chamado TI",
        url: "http://10.0.0.251/glpi/front/central.php",
        color: "border-yellow-500",
        description: "Painel de chamados de TI"
        },
        {
        title: "🌐 Nosso Site",
        url: "https://fundicaomagma.com.br/",
        color: "border-purple-500",
        description: "Nossa página Web"
        },
        {
        title: "🚚 Logistica",
        url: "https://forms.office.com",
        color: "border-pink-500",
        description: "Envie solicitações e formulários de suporte."
        },
        {
        title: "💰 Financeiro",
        url: "https://forms.office.com",
        color: "border-green-500",
        description: "Pagina com todos os links Finaceiros."
        },
        {
        title: "💰 Dashbord",
        url: "http://10.0.0.251/#",
        color: "border-red-500",
        description: "Dashbord Power BI"
        },
        {
        title: "📊 Registro de Ponto",
        url: "https://ezpoint.com.br/",
        color: "border-black",
        description: "Registro de ponto"
        },
        {
        title: "🔁 Workflow Processos",
        url: "workflow",
        color: "border-purple-500",
        description: "Processos capacitações internas e vídeos educativos."
        },
        {
        title: "👨‍💻 TI Links",
        url: "#",
        color: "border-yellow-500",
        description: "Links de serviços de TI"
        },
    ];

    // Duplicamos os links para criar o efeito "infinito"
    const infiniteLinks = [...links, ...links];

    return (
        <section className="relative max-w-[70%] mx-auto overflow-hidden bg-transparent py-8">
        <h2 className="text-2xl font-semibold text-center mb-8">Acessos Rápidos 🔗</h2>

        {/* Botões laterais */}
        <button
            onClick={() => handleManualScroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
            <ChevronLeft size={24} />
            </button>

            <button
            onClick={() => handleManualScroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
            <ChevronRight size={24} />
        </button>
        {/* Carrossel infinito */}
        <div
            ref={carouselRef}
            className="flex gap-6 animate-scroll-slow w-max"
        >
            {infiniteLinks.map((link, index) => (
            <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`min-w-[250px] bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${link.color} shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 flex-shrink-0`}
            >
                <h3 className="text-lg font-bold mb-2 text-black dark:text-[#CDFF00]">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                {link.description}
                </p>
            </a>
            ))}
        </div>
        </section>
    );
}