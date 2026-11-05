
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { api } from "../../services/strapi";

function formatarHorario(horario) {
    return horario?.slice(0, 8) || "00:00:00";
}

export default function AgendaVeiculos() {
    const [searchParams] = useSearchParams();
    const documentId = searchParams.get("veiculo");

    const [eventos, setEventos] = useState([]);
    const [veiculo, setVeiculo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [etapaAgendamento, setEtapaAgendamento] = useState(null);
    const [reservaValidada, setReservaValidada] = useState(false);
    const [salvandoReserva, setSalvandoReserva] = useState(false);
    const [versaoAgenda, setVersaoAgenda] = useState(0);
    const [dadosReserva, setDadosReserva] = useState({
        hora_inicio: "",
        data_fim_prevista: "",
        hora_fim: "",
        destino: "",
        finalidade: "",
        numero_cnh: "",
        validade_cnh: "",
        quilometragem_inicial: "",
    });

    
    // Qualquer alteração após validar exige uma nova validação.
    useEffect(() => {
        setReservaValidada(false);
    }, [dataSelecionada, dadosReserva]);

    function limparFormulario() {
        setDataSelecionada(null);
        setEtapaAgendamento(1);
        setReservaValidada(false);
        setDadosReserva({
            hora_inicio: "",
            data_fim_prevista: "",
            hora_fim: "",
            destino: "",
            finalidade: "",
            numero_cnh: "",
            validade_cnh: "",
            quilometragem_inicial: "",
        });
    }

    async function confirmarAgendamento() {
        if (salvandoReserva || !reservaValidada) return;

        const erroValidacao = validarReserva();
        if (erroValidacao) {
            setReservaValidada(false);
            alert(erroValidacao);
            return;
        }

        if (!documentId) {
            alert("Veículo não identificado. Volte à lista e selecione o veículo.");
            return;
        }

        const jwt = sessionStorage.getItem("veiculos_jwt");
        if (!jwt) {
            alert("Sua sessão expirou. Faça login novamente.");
            return;
        }

        setSalvandoReserva(true);
        try {
            await api.post(
                "/agendamentos",
                {
                    data: {
                        veiculo: documentId,
                        data_agendada: dataSelecionada,
                        data_fim_prevista: dadosReserva.data_fim_prevista,
                        hora_inicio: dadosReserva.hora_inicio,
                        hora_fim: dadosReserva.hora_fim,
                        destino: dadosReserva.destino.trim(),
                        finalidade: dadosReserva.finalidade.trim(),
                        numero_cnh: dadosReserva.numero_cnh.trim(),
                        validade_cnh: dadosReserva.validade_cnh,
                        quilometragem_inicial: Number(dadosReserva.quilometragem_inicial),
                    },
                },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            limparFormulario();
            setVersaoAgenda((versao) => versao + 1);
            alert("✅ Agendamento realizado com sucesso!");
        } catch (error) {
            console.error("Erro ao confirmar agendamento:", error);
            const mensagem = error.response?.data?.error?.message;
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Sessão sem permissão para agendar. Confira seu login e as permissões no Strapi.");
            } else {
                alert(mensagem || "Não foi possível confirmar o agendamento. Tente novamente.");
            }
        } finally {
            setSalvandoReserva(false);
        }
    }

    function validarReserva() {
        if (!dataSelecionada) {
            return "Selecione a data do agendamento.";
        }

        const hoje = new Date();

        const dataHoje = [
            hoje.getFullYear(),
            String(hoje.getMonth() + 1).padStart(2, "0"),
            String(hoje.getDate()).padStart(2, "0"),
        ].join("-");

        // 1. Data inicial
        if (dataSelecionada < dataHoje) {
            return "A data de início não pode estar no passado.";
        }

        // 2. Data prevista de término
        if (!dadosReserva.data_fim_prevista) {
            return "Informe a data prevista de término.";
        }

        if (dadosReserva.data_fim_prevista < dataSelecionada) {
            return "A data prevista de término não pode ser anterior à data de início.";
        }

        // 3. Horários obrigatórios
        if (!dadosReserva.hora_inicio || !dadosReserva.hora_fim) {
            return "Informe os horários de início e término.";
        }

        // 4. Horário inicial para reservas de hoje
        if (dataSelecionada === dataHoje) {
            const horaAtual = [
                String(hoje.getHours()).padStart(2, "0"),
                String(hoje.getMinutes()).padStart(2, "0"),
            ].join(":");

            if (dadosReserva.hora_inicio <= horaAtual) {
                return "Para agendamentos de hoje, informe um horário de início futuro.";
            }
        }

        // 5. Horários na mesma data
        if (
            dadosReserva.data_fim_prevista === dataSelecionada &&
            dadosReserva.hora_fim <= dadosReserva.hora_inicio
        ) {
            return "Na mesma data, o horário de término deve ser posterior ao início.";
        }

        // 6. Destino e finalidade
        if (!dadosReserva.destino.trim()) {
            return "Informe o destino da viagem.";
        }

        if (!dadosReserva.finalidade.trim()) {
            return "Informe a finalidade da utilização.";
        }

        // 7. CNH
        if (!/^\d{11}$/.test(dadosReserva.numero_cnh.trim())) {
            return "Informe os 11 dígitos do número da CNH.";
        }

        if (!dadosReserva.validade_cnh) {
            return "Informe a validade da CNH.";
        }

        if (dadosReserva.validade_cnh < dadosReserva.data_fim_prevista) {
            return "A CNH deve estar válida até a data prevista de devolução.";
        }

        // 8. Quilometragem
        const km = Number(dadosReserva.quilometragem_inicial);

        if (
            dadosReserva.quilometragem_inicial === "" ||
            !Number.isSafeInteger(km) ||
            km < 0
        ) {
            return "Informe uma quilometragem inicial válida.";
        }

        return null;
    }


    useEffect(() => {
        let ativo = true;

        async function carregarAgenda() {
            setCarregando(true);
            setErro("");
            setEventos([]);
            setVeiculo(null);

            if (!documentId) {
                setErro("Nenhum veículo foi selecionado.");
                setCarregando(false);
                return;
            }

            try {
                const jwt = sessionStorage.getItem("veiculos_jwt");

                if (!jwt) {
                    throw new Error(
                        "Faça login para consultar a agenda."
                    );
                }

                const resposta = await api.get(
                    `/veiculos/${encodeURIComponent(documentId)}/agenda`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwt}`,
                        },
                    }
                );

                if (!ativo) return;

                const dados = resposta.data.data;
                const reservas = dados.agendamentos || [];

                const eventosCalendario = reservas.map((reserva) => {
                    const dataInicio = reserva.data_agendada;
                    const dataFim =
                        reserva.data_fim_prevista || dataInicio;

                    const inicio = `${dataInicio}T${formatarHorario(
                        reserva.hora_inicio
                    )}`;

                    let fim = `${dataFim}T${formatarHorario(
                        reserva.hora_fim
                    )}`;

                    // Compatibilidade com reservas antigas
                    // que atravessam a meia-noite.
                    if (new Date(fim) <= new Date(inicio)) {
                        const diaSeguinte = new Date(
                            `${dataInicio}T12:00:00`
                        );
                        diaSeguinte.setDate(diaSeguinte.getDate() + 1);

                        const ano = diaSeguinte.getFullYear();
                        const mes = String(
                            diaSeguinte.getMonth() + 1
                        ).padStart(2, "0");
                        const dia = String(
                            diaSeguinte.getDate()
                        ).padStart(2, "0");

                        fim = `${ano}-${mes}-${dia}T${formatarHorario(
                            reserva.hora_fim
                        )}`;
                    }

                    const cores = {
                        reservado: "#D97706",
                        em_uso: "#DC2626",
                        concluido: "#64748B",
                    };

                    const nomes = {
                        reservado: "Reservado",
                        em_uso: "Em uso",
                        concluido: "Concluído",
                    };

                    return {
                        id: reserva.documentId,
                        title:
                            nomes[reserva.status_agendamento] ||
                            "Agendamento",
                        start: inicio,
                        end: fim,
                        backgroundColor:
                            cores[reserva.status_agendamento] ||
                            "#64748B",
                        borderColor:
                            cores[reserva.status_agendamento] ||
                            "#64748B",
                        textColor: "#FFFFFF",
                    };
                });

                setVeiculo(dados.veiculo);
                setEventos(eventosCalendario);
            } catch (error) {
                if (!ativo) return;

                console.error("Erro ao carregar agenda:", error);

                setErro(
                    error.response?.data?.error?.message ||
                    error.message ||
                    "Não foi possível carregar a agenda."
                );
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarAgenda();

        return () => {
            ativo = false;
        };
    }, [documentId, versaoAgenda]);

    return (
        <section className="w-[95%] max-w-7xl mx-auto py-8">
            <div className="mb-6">
                <Link
                    to="/veiculos"
                    className="text-green-700 dark:text-lime-400 hover:underline"
                >
                    ← Voltar para veículos
                </Link>

                <h1 className="text-3xl font-bold mt-4">
                    📅 Agenda de Veículos
                </h1>

                {veiculo && (
                    <p className="font-semibold mt-2">
                        🚙 {veiculo.nome} | Placa: {veiculo.placa}
                    </p>
                )}

                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Consulte os períodos reservados da frota Ambipar.
                </p>
            </div>

            {carregando && (
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                    Carregando agendamentos...
                </p>
            )}

            {erro && (
                <p
                    role="alert"
                    className="mb-4 text-red-600 dark:text-red-400"
                >
                    {erro}
                </p>
            )}

            {!carregando && !erro && (
                <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    <span>🟠 Reservado</span>
                    <span>🔴 Em uso</span>
                    <span>⚪ Concluído</span>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                <FullCalendar
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                    ]}
                    initialView="dayGridMonth"
                    locale={ptBrLocale}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek",
                    }}
                    buttonText={{
                        today: "Hoje",
                        month: "Mês",
                        week: "Semana",
                    }}
                    height="auto"
                    events={eventos}
                    dateClick={(info) => {
                        setEtapaAgendamento(1);
                        setDataSelecionada(info.dateStr.substring(0, 10));
                    }}

                    eventClick={(info) => {
                        setEventoSelecionado({
                            titulo: info.event.title,
                            inicio: info.event.start,
                            fim: info.event.end,
                            cor: info.event.backgroundColor,
                        });
                    }}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                />
            </div>
            {eventoSelecionado && (
                <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={() => setEventoSelecionado(null)}
                >
                    <div 
                    role="dialog"
                    aria-modal="true"
                    atia-label="Detalhe do agendamento"
                    className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                        className="mb-5 flex items-center justify-between"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                📅 Detalhes do agendamento
                            </h2>
                            <button
                            type="button"
                            onClick={() => setEventoSelecionado(null)}
                            className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                X
                            </button>
                        </div>
                        <div className="space-y-4 text-gray-800 dark:text-gray-400">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Status
                                </p>
                                <span className="mt-1 inline-block rounded-lg px-3 py-1 font-semubold text-white"
                                style={{
                                    backgroundColor: eventoSelecionado.cor,
                                }}
                                >
                                {eventoSelecionado.titulo}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Início 
                                </p>
                                <p className="font-semibold">
                                    {eventoSelecionado.inicio?.toLocaleString("pt-BR", {
                                        dateStyle: "full",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-900 dark:text-gray-400">
                                    Término
                                </p>
                                <p className="font-semibold">
                                    {eventoSelecionado.fim?.toLocaleString("pt-BR", {
                                        dateStyle: "full",
                                        timeStyle: "short",
                                    })}
                                </p>

                            </div>

                            {veiculo && (
                                <div>
                                    <p className="text-sm text-gray-500 datk:text-gray-400">
                                        Veículo
                                    </p>
                                    <p className="font-semibold">
                                        {veiculo.nome} | {veiculo.placa}

                                    </p>
                                </div>
                            )}


                        </div>
                        <button
                        type="button"
                        onClick={() => setEventoSelecionado(null)}
                        className="mt-6 w-full rounded-xl bg-[#B2CC21] px-4 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
            
            
            {dataSelecionada && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => {
                        if (!salvandoReserva) limparFormulario();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Novo agendamento"
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CABEÇALHO: APARECE NAS DUAS ETAPAS */}

                        <h2 className="mb-2 text-xl font-bold">
                            📅 Novo agendamento
                        </h2>

                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-300">
                            Etapa {etapaAgendamento} de 2
                        </p>

                        {/* INÍCIO DA CONDICIONAL */}

                        {etapaAgendamento === 1 ? (
                            <>
                                {/* ETAPA 1: ESCOLHER A DATA */}

                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                    Veículo selecionado
                                </p>

                                <p className="mb-5 font-semibold">
                                    {veiculo?.nome} | {veiculo?.placa}
                                </p>

                                <label
                                    htmlFor="data-nova-reserva"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Data do agendamento
                                </label>

                                <input
                                    id="data-nova-reserva"
                                    type="date"
                                    value={dataSelecionada}
                                    onChange={(e) =>
                                        setDataSelecionada(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />


                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={limparFormulario}
                                        className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!dataSelecionada}
                                        onClick={() => setEtapaAgendamento(2)}
                                        className="flex-1 rounded-xl bg-[#B2CC21] px-4 py-3 font-bold text-black transition hover:brightness-110 disabled:opacity-40 dark:bg-[#CDFF00]"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* ETAPA 2: PREPARAÇÃO DO FORMULÁRIO */}

                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                    Veículo selecionado
                                </p>

                                <p className="mb-4 font-semibold">
                                    🚙 {veiculo?.nome} | {veiculo?.placa}
                                </p>

                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                    Data selecionada
                                </p>

                                <p className="mb-5 font-semibold">
                                    {dataSelecionada
                                        ? new Date(
                                            `${dataSelecionada}T12:00:00`
                                            ).toLocaleDateString("pt-BR")
                                        : ""}
                                </p>             
                        <div className="space-y-4 rounded-xl border border-gray-300 p-4 dark:border-gray-600">

                            <h3 className="font-semibold">
                                📝 Dados da reserva
                            </h3>

                            {/* HORÁRIOS */}
                            
                            {/* PERÍODO DO AGENDAMENTO */}
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm">
                                        Data prevista de término
                                    </label>
                                    <input
                                        type="date"
                                        min={dataSelecionada || undefined}
                                        value={dadosReserva.data_fim_prevista}
                                        onChange={(e) =>
                                            setDadosReserva({
                                                ...dadosReserva,
                                                data_fim_prevista: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm">
                                            Hora de início
                                        </label>
                                        <input
                                            type="time"
                                            value={dadosReserva.hora_inicio}
                                            onChange={(e) =>
                                                setDadosReserva({
                                                    ...dadosReserva,
                                                    hora_inicio: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm">
                                            Hora prevista de término
                                        </label>
                                        <input
                                            type="time"
                                            value={dadosReserva.hora_fim}
                                            onChange={(e) =>
                                                setDadosReserva({
                                                    ...dadosReserva,
                                                    hora_fim: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* DESTINO */}
                            <div>
                                <label className="mb-1 block text-sm">
                                    Destino
                                </label>
                                <input
                                    type="text"
                                    value={dadosReserva.destino}
                                    onChange={(e) =>
                                        setDadosReserva({
                                            ...dadosReserva,
                                            destino: e.target.value,
                                        })
                                    }
                                    placeholder="Ex.: Unidade Andradas"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* FINALIDADE */}
                            <div>
                                <label className="mb-1 block text-sm">
                                    Finalidade
                                </label>
                                <textarea
                                    rows={2}
                                    value={dadosReserva.finalidade}
                                    onChange={(e) =>
                                        setDadosReserva({
                                            ...dadosReserva,
                                            finalidade: e.target.value,
                                        })
                                    }
                                    placeholder="Motivo da utilização"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* CNH */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm">
                                        Número da CNH
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={dadosReserva.numero_cnh}
                                        onChange={(e) =>
                                            setDadosReserva({
                                                ...dadosReserva,
                                                numero_cnh: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm">
                                        Validade da CNH
                                    </label>
                                    <input
                                        type="date"
                                        value={dadosReserva.validade_cnh}
                                        onChange={(e) =>
                                            setDadosReserva({
                                                ...dadosReserva,
                                                validade_cnh: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* QUILOMETRAGEM */}
                            <div>
                                <label className="mb-1 block text-sm">
                                    Quilometragem inicial
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={dadosReserva.quilometragem_inicial}
                                    onChange={(e) =>
                                        setDadosReserva({
                                            ...dadosReserva,
                                            quilometragem_inicial: e.target.value,
                                        })
                                    }
                                    placeholder="Ex.: 45200"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const erroValidacao = validarReserva();

                                if (erroValidacao) {
                                    setReservaValidada(false);
                                    alert(erroValidacao);
                                    return;
                                }

                                setReservaValidada(true);

                                alert(
                                    "✅ Dados validados com sucesso!\n\n" +
                                    "Confira as informações e confirme o agendamento."
                                );
                            }}
                            className="mt-5 w-full rounded-xl bg-[#B2CC21] px-4 py-3 font-bold text-black transition hover:brightness-110 dark:bg-[#CDFF00]"
                        >
                            ✓ Validar dados da reserva
                        </button>

                        {reservaValidada && (
                            <button
                                type="button"
                                disabled={salvandoReserva}
                                onClick={confirmarAgendamento}
                                className="mt-3 w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
                            >
                                {salvandoReserva
                                    ? "Salvando agendamento..."
                                    : "🚙 Confirmar agendamento"}
                            </button>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setEtapaAgendamento(1)
                                }
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 bg-[#B2CC21] font-semibold text-gray-900 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                ← Voltar
                            </button>

                            <button
                                type="button"
                                disabled={salvandoReserva}
                                onClick={limparFormulario}
                                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
                            >
                                Cancelar
                            </button>
                        </div>
                        </>
                        )}

                        {/* FIM DA CONDICIONAL */}
                    </div>
                </div>
            )}
        </section>
    );
}
