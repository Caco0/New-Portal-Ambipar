import { Link } from "react-router-dom";

export default function VeiculosPortal() {
    return (
        <section
        className="
            min-h-[calc(100vh-80px)]
            bg-white text-gray-900
            dark:bg-[#0b1220] dark:text-gray-100
        "
        >
        {/* TOP 50vh */}
        <div className="h-[50vh] w-full">
            <div className="mx-auto flex h-full max-w-6xl items-center px-6">
            <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2">
                {/* LEFT: CTA */}
                <div className="space-y-5">
                <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                    Agendamento de Veículos
                </h1>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Unidade Limeira e Andradas
                </p>

                <div className="flex flex-col gap-2">
                    <Link
                    to="/veiculos/login"
                    className="
                        inline-flex w-fit items-center justify-center
                        rounded-2xl px-6 py-3 font-bold
                        bg-[#B2CC21] text-black
                        hover:brightness-110 transition
                        dark:bg-[#CDFF00]
                        shadow-lg shadow-green-300/30 mb-2
                    "
                    >
                    Login
                    </Link>

                    <span className="text-xs text-gray-600 dark:text-gray-400">
                    Acesse para agendar, iniciar e concluir reservas.
                    </span>
                </div>
                </div>

                {/* RIGHT: Image */}
                <div className="flex justify-center md:justify-end">
                <div
                    className="
                    w-full max-w-md"   >
                    {/* Troque o src para o seu asset real */}
                    <img
                    src={`${import.meta.env.BASE_URL}carro-ambipar.jpg`} 
                    alt="Veículo"
                    className="h-56 w-full object-contain md:h-64 rounded-3xl"
                    />
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* BOTTOM 50vh */}
        <div className="h-[50vh] w-full">
            <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-6">
            {/* Troque o src para o seu logo real */}
            <img
                src={`${import.meta.env.BASE_URL}ambipar-logo-dark.png`}
                alt="Ambipar"
                className="h-[80%] w-auto object-contain opacity-95"
            />
            </div>
        </div>
        </section>
    );
}
