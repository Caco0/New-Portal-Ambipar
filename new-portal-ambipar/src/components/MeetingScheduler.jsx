import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLeafButton from "./AnimatedLeafButton/AnimatedLeafButton";



export default function MeetingScheduler() {
    const [showCal, setShowCal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(0);

    const rooms = [
        {
        name: "Sala de Reunião Recepção",
        url: "https://cal.com/ambiparlimeira/sala-de-reuniao-recepcao",
        image: `${import.meta.env.BASE_URL}reuniao1.webp`,
        },
        {
        name: "Sala de Reunião Produção",
        url: "https://cal.com/ti-magma-owzmwe/15min",
        image: `${import.meta.env.BASE_URL}reuniao2.jpg`,
        },
        {
        name: "Sala de Reunião Andradas",
        url: "https://cal.com/andradasti/sala-de-reuniao-andradas",
        image: `${import.meta.env.BASE_URL}reuniao3.jpg`,
        },
    ];

    const handlePrev = () => {
        setCurrentRoom((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentRoom((prev) => (prev === rooms.length - 1 ? 0 : prev + 1));
    };

    return (
        <section
        id="reunioes"
        className="w-[80%] md:w-[70%] mx-auto mt-16 mb-20 text-center"
        >
        <h2 className="text-4xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            🗓️ Agendamento Salas de Reuniões
        </h2>

        {/* Navegação entre salas */}
        <div className="flex justify-center items-center gap-4 mb-4">
            <button
            onClick={handlePrev}
            className="bg-gray-800 dark:bg-gray-700 text-white m-4 p-4 rounded-full hover:bg-gray-600 transition"
            >
            <ChevronLeft size={22} />
            </button>
            <span className="font-semibold text-lg  text-gray-900 dark:text-gray-100">
            {rooms[currentRoom].name}
            </span>
            <button
            onClick={handleNext}
            className="bg-gray-800 dark:bg-gray-700 text-white m-4 p-4 rounded-full hover:bg-gray-600 transition"
            >
            <ChevronRight size={22} />
            </button>
        </div>

        {/* Conteúdo alternado */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-green-500">
            <AnimatePresence mode="wait">
                {!showCal ? (
                    <motion.div
                    key="image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                    >
                    <img
                        src={rooms[currentRoom].image}
                        alt="Sala de reunião"
                        className="w-full h-[600px] object-cover rounded-3xl"
                    />

                    {/* Botão personalizado animado */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatedLeafButton
                        label="Agendar Reunião"
                        onClick={() => setShowCal(true)}
                        />
                    </div>
                    </motion.div>
                ) : (
                    <motion.div
                    key="cal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    >
                    <iframe
                        key={rooms[currentRoom].url}
                        src={rooms[currentRoom].url}
                        width="100%"
                        height="700"
                        frameBorder="0"
                        className="w-full rounded-3xl shadow-lg"
                        title={`Agendamento - ${rooms[currentRoom].name}`}
                    ></iframe>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
            Agende sua reunião de forma prática e evite conflitos de horários. <br />
            Integrado diretamente com o Outlook da Ambipar Limeira / Andradas.
        </p>
        </section>
    );
}
