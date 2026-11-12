
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setStrapiToken } from "../../services/strapi";

const statusConfig = {
    reservado: {
        label: "Reservado",
        classe: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    em_uso: {
        label: "Em uso",
        classe: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    concluido: {
        label: "Concluído",
        classe: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
};

function formatarData(data) {
    if (!data) return "Não informada";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;                    
}

export default function MinhasReservas() {
    const navigate = useNavigate();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [reservaVistoria, setReservaVistoria] = useState(null);
    const [kmInicial, setKmInicial] = useState("");
    const [combustivelSaida, setCombustivelSaida] = useState("");
    const [fotosRetirada, setFotosRetirada] = useState([]);
    const [observacoesRetirada, setObservacoesRetirada] = useState("");
    const [erroVistoria, setErroVistoria] = useState("");
    const [enviandoVistoria, setEnviandoVistoria] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("veiculos_jwt");

        if (!token) {
        navigate("/veiculos/login", { replace: true });
        return;
        }

        let ativo = true;

        async function carregarReservas() {
        setStrapiToken(token);

        try {
            const resposta = await api.get("/agendamentos/meus");

            if (ativo) {
            setReservas(resposta.data.data || []);
            }
        } catch (error) {
            if (!ativo) return;

            if (error.response?.status === 401) {
            navigate("/veiculos/login", { replace: true });
            } else {
            setErro("Não foi possível carregar suas reservas.");
            }
        } finally {
            if (ativo) setLoading(false);
        }
        }

        carregarReservas();

        return () => {
        ativo = false;
        };
    }, [navigate]);

        function validarVistoria() {
        setErroVistoria("");

        if (kmInicial.trim() === "") {
            setErroVistoria("Informe a quilometragem inicial.");
            return false;
        }

        const km = Number(kmInicial);

        if (!Number.isFinite(km) || !Number.isInteger(km) || km < 0) {
            setErroVistoria("Informe uma quilometragem válida.");
            return false;
        }

        if (!combustivelSaida) {
            setErroVistoria("Selecione o nível de combustível.");
            return false;
        }

        if (fotosRetirada.length > 5) {
            setErroVistoria("Selecione no máximo 5 fotografias.");
            return false;
        }

        const formatosPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        for (const foto of fotosRetirada) {
            if (!formatosPermitidos.includes(foto.type)) {
                setErroVistoria(
                    `O arquivo "${foto.name}" não possui um formato permitido.`
                );
                return false;
            }

            if (foto.size > 5 * 1024 * 1024) {
                setErroVistoria(
                    `O arquivo "${foto.name}" ultrapassa o limite de 5 MB.`
                );
                return false;
            }
        }

        return true;
    }

    async function enviarFotografiasRetirada(documentId) {
        if (fotosRetirada.length === 0) {
            return;
        }

        const formData = new FormData();

        fotosRetirada.forEach((foto) => {
            formData.append("imagens_retirada", foto);
        });

        const resposta = await api.post(
            `/agendamentos/${documentId}/vistoria-retirada`,
            formData
        );

        return resposta.data;
    }

    const grupos = [
        {
        titulo: "Reservas agendadas",
        descricao: "Veículos aguardando retirada.",
        dados: reservas.filter(
            (reserva) => reserva.status_agendamento === "reservado"
        ),
        },
        {
        titulo: "Veículos em uso",
        descricao: "Utilizações que ainda precisam ser finalizadas.",
        dados: reservas.filter(
            (reserva) => reserva.status_agendamento === "em_uso"
        ),
        },
        {
        titulo: "Histórico",
        descricao: "Reservas concluídas e demais registros.",
        dados: reservas.filter(
            (reserva) =>
            !["reservado", "em_uso"].includes(reserva.status_agendamento)
        ),
        },
    ];

    return (
        <section className="min-h-[calc(100vh-80px)] bg-white px-4 py-10 text-gray-900 dark:bg-[#0b1220] dark:text-gray-100">
        <div className="mx-auto max-w-6xl space-y-8">
            <header className="rounded-3xl bg-gray-100 p-6 dark:bg-gray-900 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-[#CDFF00]">
                Portal Ambipar
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
                Minhas Reservas
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Consulte seus agendamentos e acompanhe a utilização dos veículos.
            </p>

            <Link
                to="/veiculos"
                className="mt-5 inline-block rounded-xl border border-gray-300 px-5 py-3 font-bold transition hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
            >
                ← Voltar para a frota
            </Link>
            </header>

            {loading ? (
            <p>Carregando suas reservas...</p>
            ) : erro ? (
            <div
                role="alert"
                className="rounded-xl bg-red-100 p-4 text-red-800"
            >
                {erro}
            </div>
            ) : (
            <div className="space-y-10">
                {grupos.map((grupo) => (
                <section key={grupo.titulo} className="space-y-4">
                    <div>
                    <h2 className="text-2xl font-bold">
                        {grupo.titulo}
                        <span className="ml-3 text-base text-gray-500">
                        ({grupo.dados.length})
                        </span>
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {grupo.descricao}
                    </p>
                    </div>

                    {grupo.dados.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700">
                        Nenhum registro nesta categoria.
                    </div>
                    ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {grupo.dados.map((reserva) => {
                        const status =
                            statusConfig[reserva.status_agendamento] || {
                            label: reserva.status_agendamento || "Não informado",
                            classe: "bg-gray-100 text-gray-800",
                            };

                        return (
                            <article
                            key={reserva.documentId || reserva.id}
                            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                            >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                <h3 className="text-xl font-bold">
                                    🚙 {reserva.veiculo?.nome || "Veículo"}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Placa: {reserva.veiculo?.placa || "Não informada"}
                                </p>
                                </div>

                                <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}
                                >
                                {status.label}
                                </span>
                            </div>

                            <div className="mt-5 space-y-2 text-sm">
                                <p>
                                <strong>Data:</strong>{" "}
                                {formatarData(reserva.data_agendada)}
                                </p>

                                <p>
                                <strong>Horário:</strong>{" "}
                                {reserva.hora_inicio || "--:--"} até{" "}
                                {reserva.hora_fim || "--:--"}
                                </p>

                                <p>
                                <strong>Destino:</strong>{" "}
                                {reserva.destino || "Não informado"}
                                </p>
                            </div>

                            {reserva.status_agendamento === "reservado" && (
                                <div className="mt-5 space-y-3">
                                    <p 
                                        className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                    > 
                                    Aguardando início da utilização.
                                    </p>

                                    <button
                                    type="button"
                                    onClick={() => setReservaVistoria(reserva)}
                                    className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                                    >
                                        🔑 Iniciar utilização
                                    </button>
                                </div>
                            )}

                            {reserva.status_agendamento === "em_uso" && (
                                <p className="mt-5 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                Veículo em utilização. Devolução pendente.
                                </p>
                            )}
                            </article>
                        );
                        })}
                    </div>
                    )}

                    {reservaVistoria && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6"
                        role="presentation"
                    >
                        <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-vistoria"
                        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white"
                        >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700">
                            <div>
                            <h2 id="titulo-vistoria" className="text-xl font-bold">
                                📸 Vistoria de retirada
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {reservaVistoria.veiculo?.nome || "Veículo"} |{" "}
                                {reservaVistoria.veiculo?.placa || "Placa não informada"}
                            </p>
                            </div>

                            <button
                            type="button"
                            onClick={() => setReservaVistoria(null)}
                            aria-label="Fechar vistoria"
                            className="rounded-lg px-3 py-2 text-xl bg-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                            ✕
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto p-5">
                            <div>
                            <label
                                htmlFor="vistoria-km"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Quilometragem inicial
                            </label>
                            <input
                                id="vistoria-km"
                                type="number"
                                min="0"
                                placeholder="Ex.: 100000"
                                value={kmInicial}
                                onChange={(e) => setKmInicial(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#B2CC21] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            </div>

                            <div>
                            <label
                                htmlFor="vistoria-combustivel"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Combustível na saída
                            </label>
                            <select
                                id="vistoria-combustivel"
                                value={combustivelSaida}
                                onChange={(e) => setCombustivelSaida(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="" disabled>
                                Selecione o nível
                                </option>
                                <option value="vazio">Vazio</option>
                                <option value="um_quarto">1/4</option>
                                <option value="meio">1/2</option>
                                <option value="tres_quartos">3/4</option>
                                <option value="cheio">Cheio</option>
                            </select>
                            </div>

                            <div>
                            <label
                                htmlFor="vistoria-fotos"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Fotografias do veículo
                            </label>
                            <input
                                id="vistoria-fotos"
                                type="file"
                                onChange={(e) => {
                                    setFotosRetirada(Array.from(e.target.files || []));
                                }}
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="block w-full rounded-xl border border-dashed border-gray-300 p-4 text-sm dark:border-gray-700"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Até 5 fotografias, com no máximo 5 MB cada.
                                No celular, você poderá usar a câmera ou a galeria.
                            </p>
                            </div>

                            <div>
                            <label
                                htmlFor="vistoria-observacoes"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Observações da retirada
                            </label>
                            <textarea
                                id="vistoria-observacoes"
                                rows={4}
                                value={observacoesRetirada}
                                onChange={(e) => setObservacoesRetirada(e.target.value)}
                                placeholder="Descreva avarias, riscos ou outras condições do veículo..."
                                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 p-5 dark:border-gray-700">
                            {erroVistoria && (
                                <p
                                    role="alert"
                                    className="mb-3 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                >
                                    ⚠️ {erroVistoria}
                                </p>
                            )}
                            <button
                            type="button"
                            onClick={() => {
                                if (validarVistoria()) {
                                    console.log("Vistoria validada no frontend:", {
                                        documentId: reservaVistoria.documentId,
                                        kmInicial: Number(kmInicial),
                                        combustivelSaida,
                                        quantidadeFotos: fotosRetirada.length,
                                        observacoesRetirada,
                                    });
                                }
                            }}
                            className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black opacity-60 dark:bg-[#CDFF00]"
                            >
                            🔑 Confirmar início da utilização
                            </button>
                            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                            Prévia da interface. O envio será habilitado na próxima etapa.
                            </p>
                        </div>
                        </div>
                    </div>
                    )}
                </section>
                ))}
            </div>
            )}
        </div>
        </section>
    );
}
