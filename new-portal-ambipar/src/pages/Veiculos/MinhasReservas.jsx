
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
    cancelado: {
        label: "Cancelado",
        classe: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    }
};

function formatarData(data) {
    if (!data) return "Não informada";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;                    
}

export default function MinhasReservas() {
    const navigate = useNavigate();

    const [reservas, setReservas] = useState([]);

    // ============================================
    // ESTADOS DA EDIÇÃO DE RESERVAS
    // ============================================
    const [reservaEditar, setReservaEditar] = useState(null);
    const [versaoEdicao, setVersaoEdicao] = useState(null);
    const [dadosEdicao, setDadosEdicao] = useState({
        destino: "",
        finalidade: "",
        data_agendada: "",
        hora_inicio: "",
        data_fim_prevista: "",
        hora_fim: "",
        numero_cnh: "",
        validade_cnh: "",
    });
    const [erroEdicao, setErroEdicao] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [reservaCancelar, setReservaCancelar] = useState(null);
    const [justificativaCancelamento, setJustificativaCancelamento] = useState("");
    const [erroCancelamento, setErroCancelamento] = useState("");
    const [cancelando, setCancelando] = useState(false);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [reservaVistoria, setReservaVistoria] = useState(null);
    const [kmInicial, setKmInicial] = useState("");
    const [combustivelSaida, setCombustivelSaida] = useState("");
    const [fotosRetirada, setFotosRetirada] = useState([]);
    const [observacoesRetirada, setObservacoesRetirada] = useState("");
    const [erroVistoria, setErroVistoria] = useState("");
    const [enviandoVistoria, setEnviandoVistoria] = useState(false);
    const [fotosEnviadas, setFotosEnviadas] = useState(false);
    const [reservaDevolucao, setReservaDevolucao] = useState(null);
    // ============================================
    // ESTADOS DA VISTORIA DE DEVOLUÇÃO
    // ============================================

    const [kmFinal, setKmFinal] = useState("");
    const [combustivelChegada, setCombustivelChegada] = useState("");
    const [fotosDevolucao, setFotosDevolucao] = useState([]);
    const [observacoesDevolucao, setObservacoesDevolucao] = useState("");

    const [erroDevolucao, setErroDevolucao] = useState("");
    const [enviandoDevolucao, setEnviandoDevolucao] = useState(false);
    const [fotosDevolucaoEnviadas, setFotosDevolucaoEnviadas] = useState(false);

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

        if (fotosRetirada.length === 0) {
            setErroVistoria("Selecione pelo menos uma fotografia para registrar.");
            return false;
        }

        if (fotosRetirada.length === 0) {
            setErroVistoria("Selecione pelo menos uma fotografia.");
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

    async function confirmarVistoria() {
        if (enviandoVistoria || fotosEnviadas) return;

        if (!validarVistoria()) return;

        if (!reservaVistoria?.documentId) {
            setErroVistoria("Não foi possível identificar a reserva.");
            return;
        }

        setEnviandoVistoria(true);
        setErroVistoria("");

        try {
            await enviarFotografiasRetirada(reservaVistoria.documentId);

            setFotosEnviadas(true);

            console.log("Fotografias de vistoria enviadas com sucesso.");

        } catch (error) {
            const mensagem = error.response?.data?.error?.message || 
                "Não foi possivel enviar as fotografias. tente novamente";

                setErroVistoria(mensagem);

                console.error("Erro ao enviar fotografias da vistoria:", error);
        } finally {
            
            setEnviandoVistoria(false);
        }
    }

    async function iniciarUtilizacao() {
        if (!fotosEnviadas || !reservaVistoria?.documentId || enviandoVistoria) {
            return;
        }

        if (!validarVistoria()) return;

        setEnviandoVistoria(true);
        setErroVistoria("");

        try {
            await api.post(`/agendamentos/${reservaVistoria.documentId}/iniciar`,
                {
                    quilometragem_inicial: Number(kmInicial),
                    nivel_combustivel_saida: combustivelSaida,
                    observacoes_retirada: observacoesRetirada.trim(),
                }
            );
            setReservaVistoria(null);

            //Atualizar a listegem após  confirmar.
            // função  já utilizada para carregar as reservas.

        } catch (error) {
            const mensagem = 
                error.response?.data?.error?.message ||
                "Não foi possivel inicar a utilização do veículo.";

            setErroVistoria(mensagem);
            console.error("Erro ao iniciar a utilização.");
        } finally {
            setEnviandoVistoria(false);
        }
    }


    function validarDevolucao() {
        setErroDevolucao("");

        // Validar quilometragem final
        if (kmFinal.trim() === "") {
            setErroDevolucao("Informe a quilometragem final.");
            return false;
        }

        const km = Number(kmFinal);
        const kmInicialReserva = Number(
            reservaDevolucao?.quilometragem_inicial
        );

        if (!Number.isSafeInteger(km) || km < 0) {
            setErroDevolucao(
                "Informe uma quilometragem final válida, sem casas decimais."
            );
            return false;
        }

        if (
            reservaDevolucao?.quilometragem_inicial == null ||
            !Number.isSafeInteger(kmInicialReserva) ||
            kmInicialReserva < 0
        ) {
            setErroDevolucao(
                "Não foi possível identificar a quilometragem inicial da reserva."
            );
            return false;
        }

        if (km < kmInicialReserva) {
            setErroDevolucao(
                `A quilometragem final não pode ser menor que ${kmInicialReserva} km.`
            );
            return false;
        }

        // Validar combustível na chegada
        const niveisPermitidos = [
            "vazio",
            "um_quarto",
            "meio",
            "tres_quartos",
            "cheio",
        ];

        if (!niveisPermitidos.includes(combustivelChegada)) {
            setErroDevolucao(
                "Selecione o nível de combustível na chegada."
            );
            return false;
        }

        // Validar fotografias e comprovantes
        if (fotosDevolucao.length < 1) {
            setErroDevolucao(
                "Selecione pelo menos uma imagem da devolução."
            );
            return false;
        }

        if (fotosDevolucao.length > 5) {
            setErroDevolucao(
                "Selecione no máximo 5 imagens."
            );
            return false;
        }

        const formatosPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        for (const foto of fotosDevolucao) {
            if (!formatosPermitidos.includes(foto.type)) {
                setErroDevolucao(
                    `O arquivo "${foto.name}" não possui um formato permitido.`
                );
                return false;
            }

            if (foto.size <= 0 || foto.size > 5 * 1024 * 1024) {
                setErroDevolucao(
                    `O arquivo "${foto.name}" deve ter até 5 MB e não pode estar vazio.`
                );
                return false;
            }
        }

        return true;
    }

    async function enviarFotografiasDevolucao(documentId) {
        const formData = new FormData();

        fotosDevolucao.forEach((foto) => {
            formData.append("imagens_ocorrencia", foto);
        });

        const resposta = await api.post(
            `/agendamentos/${documentId}/vistoria-devolucao`,
            formData
        );

        return resposta.data;
    }


    async function confirmarDevolucao() {
        if (enviandoDevolucao || fotosDevolucaoEnviadas) return;

        if (!validarDevolucao()) return;

        if (!reservaDevolucao?.documentId) {
            setErroDevolucao("Não foi possível identificar a reserva.");
            return;
        }

        setEnviandoDevolucao(true);
        setErroDevolucao("");

        try {
            await enviarFotografiasDevolucao(
                reservaDevolucao.documentId
            );

            setFotosDevolucaoEnviadas(true);

            console.log(
                "Fotografias da devolução registradas com sucesso."
            );

        } catch (error) {
            const mensagem =
                error.response?.data?.error?.message ||
                "Não foi possível registrar as fotografias da devolução.";

            setErroDevolucao(mensagem);
            console.error("Erro ao registrar devolução:", error);

        } finally {
            setEnviandoDevolucao(false);
        }
    }

    async function finalizarUtilizacao() {
        if (
            !fotosDevolucaoEnviadas ||
            !reservaDevolucao?.documentId ||
            enviandoDevolucao
        ) {
            return;
        }

        setEnviandoDevolucao(true);
        setErroDevolucao("");

        try {
            await api.post(
                `/agendamentos/${reservaDevolucao.documentId}/finalizar`,
                {
                    quilometragem_final: Number(kmFinal),
                    nivel_combustivel_chegada: combustivelChegada,
                    observacoes_ocorrencias: observacoesDevolucao.trim(),
                }
            );

            // Atualizar a listagem após a finalização.
            const resposta = await api.get("/agendamentos/meus");
            setReservas(resposta.data.data || []);

            setReservaDevolucao(null);

            console.log("Utilização finalizada com sucesso.");

        } catch (error) {
            const mensagem =
                error.response?.data?.error?.message ||
                "Não foi possível finalizar a utilização do veículo.";

            setErroDevolucao(mensagem);
            console.error("Erro ao finalizar utilização:", error);

        } finally {
            setEnviandoDevolucao(false);
        }
    }

    function abrirEdicao(reserva) {
        if (reserva.status_agendamento !== "reservado") {
            return;
        }

        setDadosEdicao({
            destino: reserva.destino || "",
            finalidade: reserva.finalidade || "",
            data_agendada: reserva.data_agendada || "",
            hora_inicio: reserva.hora_inicio?.slice(0, 5) || "",
            data_fim_prevista: reserva.data_fim_prevista || "",
            hora_fim: reserva.hora_fim?.slice(0, 5) || "",
            numero_cnh: reserva.numero_cnh || "",
            validade_cnh: reserva.validade_cnh || "",
        })
        setErroEdicao("");
        setVersaoEdicao(reserva.updatedAt || null);
        setReservaEditar(reserva);
    }

    async function salvarEdicao() {
        if (salvandoEdicao || !reservaEditar?.documentId) return;

        setSalvandoEdicao(true);
        setErroEdicao("");

        try {
            await api.put(
                `/agendamentos/${reservaEditar.documentId}/editar`,
                {
                    versaoEdicao,
                    data: dadosEdicao,
                }
            );

            const resposta = await api.get("/agendamentos/meus");
            setReservas(resposta.data.data || []);

            setReservaEditar(null);

        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/veiculos/login", { replace: true });
                return;
            }

            setErroEdicao(
                error.response?.data?.error?.message ||
                "Não foi possível atualizar a reserva. Tente novamente."
            );

        } finally {
            setSalvandoEdicao(false);
        }
    }

    async function confirmarCancelamento() {
        if (cancelando || !reservaCancelar?.documentId) return;

        setCancelando(true);
        setErroCancelamento("");

        try {
            await api.post(
                `/agendamentos/${reservaCancelar.documentId}/cancelar`,
                { data: { justificativa_cancelamento: justificativaCancelamento.trim() } }
            );

            const resposta = await api.get("/agendamentos/meus");
            setReservas(resposta.data.data || []);
            setReservaCancelar(null);
            setJustificativaCancelamento("");
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/veiculos/login", { replace: true });
                return;
            }
            setErroCancelamento(
                error.response?.data?.error?.message ||
                "Não foi possível cancelar a reserva. Tente novamente."
            );
        } finally {
            setCancelando(false);
        }
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
                                {reserva.hora_inicio?.slice(0, 5) || "--:--"} até{" "}
                                {reserva.hora_fim?.slice(0, 5) || "--:--"}
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
                                    onClick={() => abrirEdicao(reserva)}
                                    className="w-full rounded-xl border border-blue-500 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20"
                                    >
                                        ✏️ Editar reserva
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setKmInicial("");
                                            setCombustivelSaida("");
                                            setFotosRetirada([]);
                                            setObservacoesRetirada("");
                                            setErroVistoria("");
                                            setFotosEnviadas(false);
                                            setReservaVistoria(reserva);
                                        }}
                                        className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                                    >
                                        🔑 Iniciar utilização
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReservaCancelar(reserva);
                                            setJustificativaCancelamento("");
                                            setErroCancelamento("");
                                        }}
                                        className="w-full rounded-xl border-2 border-red-600 bg-red-600 px-5 py-3 font-bold text-white transition-all duration-200 hover:border-blue-500 hover:bg-red-700 hover:shadow-md dark:border-red-500 dark:bg-red-600 dark:text-white dark:hover:border-blue-400 dark:hover:bg-red-700"
                                    >
                                        Cancelar reserva
                                    </button>
                                </div>
                            )}
                            {reserva.status_agendamento === "em_uso" && (
                                <div className="mt-5 space-y-3">
                                    <p className="rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                        Veículo em utilização. Devolução pendente.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setKmFinal("");
                                            setCombustivelChegada("");
                                            setFotosDevolucao([]);
                                            setObservacoesDevolucao("");
                                            setErroDevolucao("");
                                            setFotosDevolucaoEnviadas(false);
                                            setReservaDevolucao(reserva);
                                        }}
                                        className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                                    >
                                        🏁 Finalizar utilização
                                    </button>
                                </div>
                            )}
                            </article>
                        );
                        })}
                    </div>
                    )}
                </section>
                ))}

                {reservaEditar && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 sm:p-6">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="titulo-edicao"
                            className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white"
                        >
                            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700">
                                <div>
                                    <h2 id="titulo-edicao" className="text-xl font-bold">
                                        ✏️ Editar reserva
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {reservaEditar.veiculo?.nome || "Veículo"} |{" "}
                                        {reservaEditar.veiculo?.placa || "Placa não informada"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setReservaEditar(null)}
                                    aria-label="Fechar edição"
                                    className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-5 overflow-y-auto p-5">

                                {/* DESTINO */}
                                <div>
                                    <label
                                        htmlFor="edicao-destino"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Destino
                                    </label>

                                    <input
                                        id="edicao-destino"
                                        type="text"
                                        value={dadosEdicao.destino}
                                        onChange={(e) =>
                                            setDadosEdicao({
                                                ...dadosEdicao,
                                                destino: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 font-bold text-gray-900 transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                                    />
                                </div>

                                {/* FINALIDADE */}
                                <div>
                                    <label
                                        htmlFor="edicao-finalidade"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Finalidade da utilização
                                    </label>

                                    <textarea
                                        id="edicao-finalidade"
                                        rows={3}
                                        value={dadosEdicao.finalidade}
                                        onChange={(e) =>
                                            setDadosEdicao({
                                                ...dadosEdicao,
                                                finalidade: e.target.value,
                                            })
                                        }
                                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#B2CC21] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                {/* DATAS E HORÁRIOS */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>
                                        <label
                                            htmlFor="edicao-data-inicio"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Data de retirada
                                        </label>
                                        <input
                                            id="edicao-data-inicio"
                                            type="date"
                                            value={dadosEdicao.data_agendada}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    data_agendada: e.target.value,
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edicao-hora-inicio"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Horário de retirada
                                        </label>
                                        <input
                                            id="edicao-hora-inicio"
                                            type="time"
                                            value={dadosEdicao.hora_inicio}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    hora_inicio: e.target.value,
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edicao-data-fim"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Data prevista de devolução
                                        </label>
                                        <input
                                            id="edicao-data-fim"
                                            type="date"
                                            value={dadosEdicao.data_fim_prevista}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    data_fim_prevista: e.target.value,
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edicao-hora-fim"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Horário previsto de devolução
                                        </label>
                                        <input
                                            id="edicao-hora-fim"
                                            type="time"
                                            value={dadosEdicao.hora_fim}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    hora_fim: e.target.value,
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                                {/* DADOS DA CNH */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>
                                        <label
                                            htmlFor="edicao-numero-cnh"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Número da CNH
                                        </label>

                                        <input
                                            id="edicao-numero-cnh"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={11}
                                            value={dadosEdicao.numero_cnh}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    numero_cnh: e.target.value.replace(/\D/g, ""),
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#B2CC21] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="edicao-validade-cnh"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Validade da CNH
                                        </label>

                                        <input
                                            id="edicao-validade-cnh"
                                            type="date"
                                            value={dadosEdicao.validade_cnh}
                                            onChange={(e) =>
                                                setDadosEdicao({
                                                    ...dadosEdicao,
                                                    validade_cnh: e.target.value,
                                                })
                                            }
                                            className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 p-5 dark:border-gray-700">

                                {erroEdicao && (
                                    <p
                                        role="alert"
                                        className="mb-4 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    >
                                        ⚠️ {erroEdicao}
                                    </p>
                                )}

                                <div className="flex flex-col gap-3 sm:flex-row">

                                    <button
                                        type="button"
                                        onClick={() => setReservaEditar(null)}
                                        disabled={salvandoEdicao}
                                        className="flex-1 rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 font-bold text-gray-900 transition hover:bg-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                                    >
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={salvarEdicao}
                                        disabled={salvandoEdicao}
                                        className="flex-1 rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#CDFF00]"
                                    >
                                        {salvandoEdicao ? "⏳ Salvando..." : "💾 Salvar alterações"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                                        {reservaCancelar && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6">
                            <div role="dialog" aria-modal="true" aria-labelledby="titulo-cancelamento" className="w-full max-w-lg rounded-2xl bg-white p-6 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white">
                                <h2 id="titulo-cancelamento" className="text-xl font-bold">Cancelar reserva</h2>
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                    Deseja cancelar a reserva de {reservaCancelar.veiculo?.nome || "veículo"},
                                    em {formatarData(reservaCancelar.data_agendada)}?
                                </p>
                                <label htmlFor="justificativa-cancelamento" className="mt-5 block text-sm font-semibold">
                                    Justificativa (opcional)
                                </label>
                                <textarea
                                    id="justificativa-cancelamento"
                                    rows={3}
                                    maxLength={2000}
                                    value={justificativaCancelamento}
                                    onChange={(e) => setJustificativaCancelamento(e.target.value)}
                                    placeholder="Informe o motivo, se desejar..."
                                    disabled={cancelando}
                                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {erroCancelamento && (
                                    <p role="alert" className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        {erroCancelamento}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={cancelando}
                                        onClick={() => setReservaCancelar(null)}
                                        className="rounded-xl border bg-[#B2CC21] border-gray-300 px-5 py-3 font-semibold dark:border-gray-700"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={cancelando}
                                        onClick={confirmarCancelamento}
                                        className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                                    >
                                        {cancelando ? "Cancelando..." : "Confirmar cancelamento"}
                                    </button>
                                </div>
                            </div>
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
                                disabled={enviandoVistoria}
                                aria-label="Fechar vistoria"
                                className="rounded-lg bg-red-500 px-3 py-2 text-xl text-white transition hover:bg-red-600 disabled:opacity-50"
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
                                onClick={confirmarVistoria}
                                disabled={enviandoVistoria || fotosEnviadas}
                                className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#CDFF00]"
                            >
                                {enviandoVistoria
                                    ? "📤 Enviando fotografias..."
                                    : fotosEnviadas
                                    ? "✅ Fotografias registradas"
                                    : "📸 Registrar fotografias da vistoria"}
                            </button>
                            {fotosEnviadas && (
                                <p role="status" className="mt-3 rounded-xl bg-green-100 p-3 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    ✅ Fotografias registradas com sucesso! A utilização do veículo ainda não foi iniciada.
                                </p>
                            )}
                            {fotosEnviadas && (
                                <button 
                                type="button"
                                onClick={iniciarUtilizacao}
                                disabled={enviandoVistoria}
                                className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {enviandoVistoria
                                        ? "⏳ Iniciando utilização..."
                                        : "🚙 Confirmar início da utilização"}
                                    
                                </button>
                            )}



                        </div>
                    </div>
                </div>
                
                )}
                            {reservaDevolucao && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6"
                                    role="presentation"
                                >
                                    <div
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="titulo-devolucao"
                                        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white"
                                    >
                                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700">
                                            <div>
                                                <h2 id="titulo-devolucao" className="text-xl font-bold">
                                                    🏁 Vistoria de devolução
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {reservaDevolucao.veiculo?.nome || "Veículo"} |{" "}
                                                    {reservaDevolucao.veiculo?.placa || "Placa não informada"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setReservaDevolucao(null)}
                                                disabled={enviandoDevolucao}
                                                aria-label="Fechar devolução"
                                                className="rounded-lg bg-red-500 px-3 py-2 text-xl text-white transition hover:bg-red-600 disabled:opacity-50"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="space-y-5 overflow-y-auto p-5">
                                            <div>
                                                <label htmlFor="devolucao-km" className="mb-2 block text-sm font-semibold">
                                                    Quilometragem final
                                                </label>
                                                <input
                                                    id="devolucao-km"
                                                    type="number"
                                                    min={reservaDevolucao.quilometragem_inicial ?? 0}
                                                    step="1"
                                                    placeholder="Informe a quilometragem de retorno"
                                                    value={kmFinal}
                                                    onChange={(e) => setKmFinal(e.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#B2CC21] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                />
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Quilometragem inicial: {reservaDevolucao.quilometragem_inicial ?? "Não informada"} km
                                                </p>
                                            </div>

                                            <div>
                                                <label htmlFor="devolucao-combustivel" className="mb-2 block text-sm font-semibold">
                                                    Combustível na chegada
                                                </label>
                                                <select
                                                    id="devolucao-combustivel"
                                                    value={combustivelChegada}
                                                    onChange={(e) => setCombustivelChegada(e.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                >
                                                    <option value="" disabled>Selecione o nível</option>
                                                    <option value="vazio">Vazio</option>
                                                    <option value="um_quarto">1/4</option>
                                                    <option value="meio">1/2</option>
                                                    <option value="tres_quartos">3/4</option>
                                                    <option value="cheio">Cheio</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="devolucao-fotos" className="mb-2 block text-sm font-semibold">
                                                    Fotografias e comprovantes
                                                </label>
                                                <input
                                                    id="devolucao-fotos"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    multiple
                                                    onChange={(e) => setFotosDevolucao(Array.from(e.target.files || []))}
                                                    className="block w-full rounded-xl border border-dashed border-gray-300 p-4 text-sm dark:border-gray-700"
                                                />
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Selecione de 1 a 5 imagens, com até 5 MB cada.
                                                    Inclua fotografias do veículo e, quando houver,
                                                    comprovantes de abastecimento ou outras despesas.
                                                </p>
                                            </div>

                                            <div>
                                                <label htmlFor="devolucao-observacoes" className="mb-2 block text-sm font-semibold">
                                                    Observações e ocorrências (opcional)
                                                </label>
                                                <textarea
                                                    id="devolucao-observacoes"
                                                    rows={4}
                                                    value={observacoesDevolucao}
                                                    onChange={(e) => setObservacoesDevolucao(e.target.value)}
                                                    placeholder="Descreva ocorrências, avarias ou informações relevantes..."
                                                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 p-5 dark:border-gray-700">
                                            {erroDevolucao && (
                                                <p
                                                    role="alert"
                                                    className="mb-3 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                >
                                                    ⚠️ {erroDevolucao}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={confirmarDevolucao}
                                                disabled={enviandoDevolucao || fotosDevolucaoEnviadas}
                                                className="w-full rounded-xl bg-[#B2CC21] px-5 py-3 font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#CDFF00]"
                                            >
                                                {enviandoDevolucao
                                                    ? "📤 Enviando fotografias..."
                                                    : fotosDevolucaoEnviadas
                                                    ? "✅ Fotografias registradas"
                                                    : "📸 Registrar imagens da devolução"}
                                            </button>

                                            {fotosDevolucaoEnviadas && (
                                                <p
                                                    role="status"
                                                    className="mt-3 rounded-xl bg-green-100 p-3 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                >
                                                    ✅ Fotografias registradas com sucesso!
                                                    A utilização do veículo ainda não foi finalizada.
                                                </p>
                                            )}

                                            {fotosDevolucaoEnviadas && (
                                                <button
                                                    type="button"
                                                    onClick={finalizarUtilizacao}
                                                    disabled={enviandoDevolucao}
                                                    className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {enviandoDevolucao
                                                        ? "⏳ Finalizando utilização..."
                                                        : "🏁 Confirmar finalização da utilização"}
                                                </button>
                                            )}

                                            <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                                                A utilização será encerrada somente após a confirmação final.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
            </div>
            )}
        </div>
        </section>
    );
}
