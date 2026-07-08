export default function Chamados() {
    return (
        <section id="chamados" className="min-h-[calc(100vh-80px)] bg-gray-700 text-gray-900 dark:br-[#0b1220] dark:text-gray-100 p-6">
            <div className="max-w-8xl mx-auto">
                <h1 className="text-3xl font-bold mb-4"> Dashbord de Chamados de TI 🔧</h1>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Indicadores de Chamados de TI
                </p>
                <button className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold block w-fit hover:scale-105 transition mb-4"> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdkovIwpjf_rxBWkSJvQqgvFC7d1Fanhwqc8IbLlvZKwFlzfw/viewform?usp=sharing&ouid=101621433194121975401" target="_blank" rel="noopener noreferrer">Abrir Chamado</a> </button>
                <div className="rouded-2xl overflow-hidden rounded-xl bg-white shadow dark:bg-slate-900">
                    <iframe 
                    src="https://datastudio.google.com/embed/reporting/0e3cb24a-3584-4f56-9187-501450d7bafc/page/p_z80jj2183d" 
                    title="Dashbord de Chamados de TI"
                    className="w-full h-[900px] border-0"
                    loading="lazy">
                    </iframe>
                </div>
            </div>
        </section>
    );
}