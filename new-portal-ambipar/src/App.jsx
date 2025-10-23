import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import LinksCarousel from "./components/LinksCarousel";
import MeetingScheduler from "./components/MeetingScheduler";
import ScrollToTop from "./components/ScrollToTop";
import NoticiasList from "./components/NoticiasList";
import NoticiaDetalhe from "./components/NoticiaDetalhe";

import "./index.css";

// 🔹 Criamos um componente interno para usar useLocation corretamente
function AppContent() {
  const location = useLocation();

  // Faz o scroll suave até o ID (#workflow, #acessos-rapidos etc.)
  useEffect(() => {
    if (location.hash) {
      const section = document.querySelector(location.hash);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors overflow-x-hidden">
      {/* Header fixo */}
      <Header />

      {/* Conteúdo principal */}
      <main id="home" className="pt-24 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Página principal */}
          <Route
            path="/"
            element={
              <>
                {/* Banner principal */}
                <section className="w-[70%] mx-auto mt-8 bg-[#CDFF00] text-black text-center p-10 rounded-3xl shadow-lg mb-10 transition-all duration-300">
                  <h2 className="text-4xl font-bold">🍃 Juntos por um Planeta Mais Verde</h2>
                  <p className="mt-4 text-black">
                    Nosso compromisso com a sustentabilidade em ação.
                  </p>
                </section>

                {/* Workflow Processos */}
                <section id="workflow" className="max-w-7xl mx-auto px-6 mb-12">
                  <h2 className="text-2xl font-semibold mb-6">Workflow Processos</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Coluna 1 */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          💻 Sistema Sygecom
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Processos de geração, alteração e relatórios de boletos Sygecom.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          🎓 Treinamentos
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Treinamentos Sistema, Pacote Office, e Teams.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          📰 Formulários de Reembolso
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Preenchimento de formulários de reembolso.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          🚙 Agendamento de Veículos
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Agendamento de uso dos veículos em comum.
                        </p>
                      </div>
                    </div>

                    {/* Coluna 2 */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          👨‍💻 Manuais de TI
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Manuais de configuração básica de TI.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition">
                        <h4 className="font-bold text-[#B2CC21] dark:text-[#CDFF00]">
                          🌳 Manuais de Implementação
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Manuais de configuração básica de Implementação.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Carrossel de Links */}
                <LinksCarousel />

                {/* Agendamento de reuniões */}
                <MeetingScheduler />
              </>
            }
          />

          {/* Rotas de notícias */}
          <Route path="/noticias" element={<NoticiasList />} />
          <Route path="/noticias/:id" element={<NoticiaDetalhe />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
