export default function MeetingScheduler() {
    return (
        <section className="w-[90%] md:w-[70%] mx-auto mt-12 mb-16">
            <h2 className="text-4xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
                🗓️ Agendamento Salas de Reiniões
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-green-500 overflow-hidden transition-all duration-300 hover:shadow-green-400/30">
                <iframe 
                src="https://cal.com/ambiparlimeira/sala-de-reuniao-recepcao"
                width="100%"
                height="750"
                frameborder="0"
                className="w-full rounded-3x1"
                title="Agendamento de sala de Reunião Ambipar"
                ></iframe>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Agende sua reunião de forma pratica e evite conflitos de horários.
                Integrado diretamente com o Outlook da Ambipar Limeira / Andradas
            </p>
        </section>
    );
}