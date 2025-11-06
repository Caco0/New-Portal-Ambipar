import { Link } from "react-router-dom";


export default function FinanceiroLinks() {
    const financeiroLinks = [
        { id: 1, titulo: "BS FIDIC", link: "https://orderby.bsfidc.com.br:8083/netFactor/jsp/nfrInicia.jsp" },
        { id: 2, titulo: "IB CAITAL", link: "https://www.ibcapital.com.br/" },
        { id: 3, titulo: "IWBA RECEBÍVEIS", link: "https://iwbarecebiveis.wba.com.br/iwba/pages/index.jsf?failed=true" },
        { id: 4, titulo: "LOTUS", link: "https://sso.lotus.com.br/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dapi_portal%26redirect_uri%3Dhttps%253A%252F%252Fportal.lotus.com.br%252Fassets%252Fauth%252Foidc-login-redirect.html%26response_type%3Did_token%2520token%26scope%3Dopenid%2520profile%2520api_portal%26state%3Da21190fcbb324b82bcce9991c8a6a812%26nonce%3Dd3e39de3a4fd4ae6853faa9fbc474c10" },
        { id: 5, titulo: "LS IINTERBANK", link: "https://lsinterbank.qprof.com.br/Authentication/Login.aspx?ReturnUrl=/SystemTemplate/FSI001.aspx" },
        { id: 6, titulo: "SAH CAPITAL", link: "https://www.sahcapital.com/portal" },
        { id: 7, titulo: "PLATA", link: "https://www.plata.com.br/" },
        { id: 8, titulo: "PLENO", link: "https://plenoinvest.com.br/" },
        { id: 9, titulo: "GRUPO RDF", link: "https://grupordf.com/autoatendimento" },
        { id: 10, titulo: "SBcrédito", link: "https://home-credit.sbcredito.com.br/login" },
        { id: 11, titulo: "GRUPO SIFRA", link: "https://sigsportalcliente.gruposifra.com.br/" },
        { id: 12, titulo: "SIDMA CRED", link: "https://portal.sigmacredit.com.br/netFactor/jsp/nfrInicia.jsp" },
        { id: 13, titulo: "BANCO SOFISA", link: "https://auth.sofisa.com.br/auth/realms/ibpj/protocol/openid-connect/auth?client_id=portal-ibpj&redirect_uri=https%3A%2F%2Fibpj.sofisa.com.br%2FauthCallback&response_type=code&scope=openid&state=af3a3f29125e4898a4669a4dee93bfc9&code_challenge=pmAVD_Spq8nVb7oer6CJRfIl33y000vWrqGfdAEmfUI&code_challenge_method=S256&response_mode=query" },
        { id: 14, titulo: "PORTAL CASH", link: "https://login.santander.com.br/auth/realms/corp/protocol/openid-connect/auth?client_id=880bf54d-a14e-4990-a1b3-399926271ec9&state=null&scope=openid%20cpf&redirect_uri=https://www.sxintegra.com.br/sxi-frontend-op/authenticate&response_type=code" },
        { id: 15, titulo: "DEXCO", link: "https://portaldexco.aevee.com.br/login" },
        { id: 16, titulo: "BENFICA", link: "https://grupobenfica.com.br/" },
    ];

    return (
        <section
        id="financeiroLinks"
        className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
        <h2 className="text-3xl font-bold text-center mb-10 text-[#B2CC21] dark:text-[#CDFF00]">
            💰 Links Financeiro Limeira / Andradas
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
            {financeiroLinks.map((financeiroLink) => (
            <a
                key={financeiroLink.id}
                href={financeiroLink.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-[#CDFF00]/40 hover:-translate-y-1 transition-all duration-300 truncate-link"
            >
                <h3 className="text-xl font-semibold mb-3 text-[#3a3a3a] dark:text-[#CDFF00]">
                {financeiroLink.titulo}
                </h3>

                {/* 🧠 Aqui entra o truncamento inteligente */}
                <p
                className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed truncate-link"
                title={financeiroLink.link}
                >
                {financeiroLink.link.length > 30
                    ? financeiroLink.link.slice(0, 30) + "..."
                    : financeiroLink.link}
                </p>

                <span className="block mt-4 text-[#B2CC21] dark:text-[#CDFF00] font-medium">
                Acessar →
                </span>
            </a>
            ))}
        </div>
        </section>
    );
}
