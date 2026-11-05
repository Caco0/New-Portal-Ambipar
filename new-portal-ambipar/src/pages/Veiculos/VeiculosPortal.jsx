
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setStrapiToken } from "../../services/strapi";

const statusConfig = {
    disponivel: {
        label: "Operacional",
        classe:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    manutencao: {
        label: "Em manutenção",
        classe:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    indisponivel: {
        label: "Indisponível",
        classe:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
    };

    export default function VeiculosPortal() {
    const navigate = useNavigate();

    const [token, setToken] = useState(
        () => sessionStorage.getItem("veiculos_jwt")
    );
    const [usuario] = useState(() => {
        try {
        return JSON.parse(
            sessionStorage.getItem("veiculos_usuario") || "null"
        );
        } catch {
        return null;
        }
    });

    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(Boolean(token));
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!token) {
        setLoading(false);
        return;
        }

        let ativo = true;

        async function carregarVeiculos() {
        setLoading(true);
        setErro("");

        // Restaura o JWT no Axios após atualizar a página.
        setStrapiToken(token);

        try {
            const resposta = await api.get("/veiculos", {
            params: {
                "pagination[pageSize]": 100,
                "sort[0]": "nome:asc",
            },
            });

            if (ativo) {
            setVeiculos(resposta.data.data || []);
            }
        } catch (error) {
            if (!ativo) return;

            if ([401, 403].includes(error.response?.status)) {
            sessionStorage.removeItem("veiculos_jwt");
            sessionStorage.removeItem("veiculos_usuario");
            setStrapiToken();
            setToken(null);
            setErro("Sua sessão expirou. Faça login novamente.");
            } else {
            setErro("Não foi possível carregar os veículos.");
            }
        } finally {
            if (ativo) setLoading(false);
        }
        }

        carregarVeiculos();

        return () => {
        ativo = false;
        };
    }, [token]);

    function sair() {
        sessionStorage.removeItem("veiculos_jwt");
        sessionStorage.removeItem("veiculos_usuario");
        setStrapiToken();
        setToken(null);
        setVeiculos([]);
        navigate("/veiculos", { replace: true });
    }

    const operacionais = veiculos.filter(
        (v) => v.status_veiculo === "disponivel"
    ).length;

    const manutencao = veiculos.filter(
        (v) => v.status_veiculo === "manutencao"
    ).length;

    const indicadores = [
        { titulo: "Veículos cadastrados", valor: veiculos.length },
        { titulo: "Operacionais", valor: operacionais },
        { titulo: "Em manutenção", valor: manutencao },
    ];

    return (
        <section className="min-h-[calc(100vh-80px)] bg-white px-4 py-10 text-gray-900 dark:bg-[#0b1220] dark:text-gray-100">
        <div className="mx-auto max-w-6xl space-y-8">

            {/* CABEÇALHO */}
            <header className="flex flex-col gap-5 rounded-3xl bg-gray-100 p-6 dark:bg-gray-900 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-[#CDFF00]">
                Portal Ambipar
                </p>

                <h1 className="text-3xl font-extrabold md:text-4xl">
                Gestão da Frota
                </h1>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                Unidades Limeira e Andradas
                </p>

                {token && usuario?.username && (
                <p className="text-sm font-medium">
                    Bem-vindo, {usuario.username}!
                </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {token ? (
                <button
                    type="button"
                    onClick={sair}
                    className="rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-800 transition hover:bg-gray-800 dark:border-gray-200 hover:text-gray-200  dark:hover:bg-gray-800"
                >
                    Sair
                </button>
                ) : (
                <Link
                    to="/veiculos/login"
                    className="rounded-xl bg-[#B2CC21] px-6 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                >
                    Login
                </Link>
                )}
            </div>
            </header>

            {!token ? (
            /* VISITANTE */
            <div className="grid items-center gap-8 rounded-3xl border border-gray-200 p-6 dark:border-gray-800 md:grid-cols-2">
                <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                    Agendamento de Veículos
                </h2>

                <p className="text-gray-600 dark:text-gray-300">
                    Entre com sua conta para consultar a frota,
                    visualizar a agenda e realizar reservas.
                </p>

                <Link
                    to="/veiculos/login"
                    className="inline-block rounded-xl bg-[#B2CC21] px-6 py-3 font-bold text-black dark:bg-[#CDFF00]"
                >
                    Acessar sistema
                </Link>
                </div>

                <img
                src={`${import.meta.env.BASE_URL}carro-ambipar.jpg`}
                alt="Veículo Ambipar"
                className="mx-auto max-h-72 w-full object-contain"
                />
            </div>
            ) : (
            /* MOTORISTA AUTENTICADO */
            <>
                {/* INDICADORES */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {indicadores.map((item) => (
                    <div
                    key={item.titulo}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.titulo}
                    </p>

                    <p className="mt-2 text-4xl font-extrabold">
                        {loading ? "..." : item.valor}
                    </p>
                    </div>
                ))}
                </div>

                {/* LISTAGEM */}
                <div className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold">
                    Veículos da Frota
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Identifique o veículo pela placa e consulte sua condição.
                    </p>
                </div>

                {erro && (
                    <div
                    role="alert"
                    className="rounded-xl bg-red-100 p-4 text-red-800"
                    >
                    {erro}
                    </div>
                )}

                {loading ? (
                    <p>Carregando veículos...</p>
                ) : veiculos.length === 0 && !erro ? (
                    <p>Nenhum veículo cadastrado.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {veiculos.map((veiculo) => {
                        const status =
                        statusConfig[veiculo.status_veiculo] ||
                        statusConfig.indisponivel;

                        return (
                        <article
                            key={veiculo.documentId || veiculo.id}
                            className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#CDFF00]/20 text-3xl">
                                🚙
                                </div>

                                <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}
                                >
                                {status.label}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                {veiculo.nome}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Placa:{" "}
                                <strong>{veiculo.placa}</strong>
                                </p>

                                <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
                                Categoria: {veiculo.categoria || "Não informada"}
                                </p>
                            </div>
                            </div>

                            <button
                            type="button"
                            disabled={veiculo.status_veiculo !== "disponivel"}
                            onClick={() => {
                                // A agenda será implementada na próxima etapa.
                                navigate (
                                `/veiculos/agenda?veiculo=${encodeURIComponent(veiculo.documentId)}`
                                );
                            }}
                            className="w-full rounded-xl bg-[#B2CC21] px-4 py-3 font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#CDFF00]"
                            >
                            📅 Consultar agenda e agendar
                            </button>
                        </article>
                        );
                    })}
                    </div>
                )}
                </div>
            </>
            )}
        </div>
        </section>
    );
}
