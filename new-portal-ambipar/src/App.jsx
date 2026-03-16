import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import WorkflowList from "./components/WorkflowList";
import LinksCarousel from "./components/LinksCarousel";
import TiLinks from "./components/TiLinks";
import LogisticaLinks from "./components/LogisticaLinks";
import FinanceiroLinks from "./components/FinanceiroLinks";
import MeetingScheduler from "./components/MeetingScheduler";
import ForceTopOnMount from "./components/ForceTopOnMount";
import NoticiasList from "./pages/Noticias/NoticiasList";
import NoticiaDetalhe from "./pages/Noticias/NoticiaDetalhe";
import ListagemGeral from "./pages/Workflow/ListagemGeral";
import DetalheGeral from "./pages/Workflow/DetalheGeral";
import VeiculosPortal from "./pages/Veiculos/VeiculosPortal";
import VeiculosLogin from "./pages/Veiculos/login";
// import AgendaVeiculos from "./pages/Veiculos/AgendaVeiculos";

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
    // Se for apenas a home "/", volta para o topo
    else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                {/* Workflow Processos (dinâmico via Strapi) */}
                <WorkflowList />
                {/* Carrossel de Links */}
                <LinksCarousel />
                {/* Agendamento de reuniões */}
                <MeetingScheduler />
              </>
            }
          />
          {/* Notícias */}
          <Route path="/noticias" element={<NoticiasList />} />
          <Route path="/noticias/:slug" element={<NoticiaDetalhe />} />


          {/* TI Links / Financeiro / Logistica */}
          <Route path="/tiLinks" element={<TiLinks />} />
          <Route path="/logisticalinks" element={<LogisticaLinks />} />
          <Route path="/financeiroLinks" element={<FinanceiroLinks />} />

          {/* Workflow */}
          <Route path="/workflow/:categoria" element={<ListagemGeral />} />
          <Route path="/workflow/:categoria/:id" element={<DetalheGeral />} />

          {/** Veículos */}
          <Route path="/veiculos" element={<VeiculosPortal />} />
          <Route path="/veiculos/login" element={<VeiculosLogin />} />
          {/* <Route path="/veiculos/agenda" element={<AgendaVeiculos />} /> */}

        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename="/Portal">
      <ForceTopOnMount />
      <AppContent />
    </Router>
  );
}

export default App;
