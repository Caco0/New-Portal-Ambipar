import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MeetingScheduler() {
    const rooms = [
        {
        name: "Sala de Reunião Recepção",
        url: "https://cal.com/ambiparlimeira/sala-de-reuniao-recepcao",
        },
        {
        name: "Sala de Reunião Produção",
        url: "https://cal.com/ti-magma-owzmwe/15min",
        },
        {
        name: "Sala de Reunião Andradas",
        url: "https://cal.com/andradasti/sala-de-reuniao-andradas",
        },
    ];
    
    const [currentRoom, setCurrentRoom] = useState(0);

    const handlePrev = () =>{
        setCurrentRoom((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
    }

    const handleNext = () => {
        setCurrentRoom((prev) => (prev === rooms.length - 1 ? 0 : prev + 1));
    }


    return (
        <section id="reunioes" className="w-[50%] md:w-[70%] mx-auto mt-12 mb-16" tabIndex={-1}>
            <h2 className="text-4xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
                🗓️ Agendamento Salas de Reuniões
            </h2>
            <div className="flex justify-center items-center gap-4 mb-4">
                <button
                onClick={handlePrev}
                className="bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition"
                >
                <ChevronLeft size={22} />
                </button>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {rooms[currentRoom].name}
                </span>
                <button
                    onClick={handleNext}
                    className="bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition"
                    >
                    <ChevronRight size={22} />
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-green-500 overflow-hidden transition-all duration-300 hover:shadow-green-400/30">
                <iframe 
                    key={rooms[currentRoom].url}
                    src={rooms[currentRoom].url}
                    width="100%"
                    height="700"
                    frameBorder="0"
                    className="w-full rounded-3xl"
                    tabIndex={-1}
                    title={`Agendamento - ${rooms[currentRoom].name}`}
                ></iframe>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                Agende sua reunião de forma pratica e evite conflitos de horários.
                Integrado diretamente com o Outlook da Ambipar Limeira / Andradas
            </p>
        </section>
    );
}