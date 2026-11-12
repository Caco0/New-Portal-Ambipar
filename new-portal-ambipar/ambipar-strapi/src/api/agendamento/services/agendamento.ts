
/**
 * agendamento service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::agendamento.agendamento",
  ({ strapi }) => ({

    // ============================================
    // INICIAR AGENDAMENTO
    // ============================================

    async iniciarAgendamento(
      documentId: string,
      dados: any,
      usuario: any
    ) {
      // Identificar o veículo ANTES da transação de escrita SQLite.
      const reservaInicial = await strapi
        .documents("api::agendamento.agendamento")
        .findOne({ documentId, populate: ["veiculo"] });

      if (!reservaInicial?.veiculo?.id) {
        throw new Error("Agendamento ou veículo vinculado não encontrado.");
      }

      const veiculoId = reservaInicial.veiculo.id;

      return await strapi.db.transaction(async ({ trx }) => {
        // Adquirir o bloqueio de escrita antes de reconsultar o agendamento.
        const linhasBloqueadas = await trx("veiculos")
          .where({ id: veiculoId })
          .update({ id: trx.ref("id") });

        if (linhasBloqueadas !== 1) {
          throw new Error("Não foi possível bloquear o veículo para a retirada.");
        }

        // Revalidar os dados APÓS obter o bloqueio.
        const agendamento = await strapi
          .documents("api::agendamento.agendamento")
          .findOne({ documentId, populate: ["veiculo", "solicitante"] });

        if (!agendamento) {
          throw new Error("Agendamento não encontrado.");
        }
        if (agendamento.veiculo?.id !== veiculoId) {
          throw new Error("O veículo vinculado à reserva foi alterado. Tente novamente.");
        }
        if (agendamento.solicitante?.id !== usuario.id) {
          throw new Error("Você não tem permissão para iniciar o agendamento de outro usuário.");
        }
        if (agendamento.status_agendamento !== "reservado") {
          throw new Error(
            `Agendamento não pode ser iniciado pois está com status '${agendamento.status_agendamento}'.`
          );
        }

        if (!Number.isInteger(dados.quilometragem_inicial) || dados.quilometragem_inicial < 0) {
          throw new Error("A quilometragem inicial é obrigatória e deve ser um número inteiro não negativo.");
        }
        const niveisPermitidos = ["vazio", "um_quarto", "meio", "tres_quartos", "cheio"];
        if (!niveisPermitidos.includes(dados.nivel_combustivel_saida)) {
          throw new Error("O nível de combustível de saída é obrigatório e deve ser válido.");
        }

        // Usar data e hora civis de São Paulo, sem depender do fuso do servidor.
        const partes = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Sao_Paulo",
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hourCycle: "h23",
        }).formatToParts(new Date());
        const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
        const dataLocal = `${parte("year")}-${parte("month")}-${parte("day")}`;
        const horaLocal = `${parte("hour")}:${parte("minute")}:${parte("second")}`;
        const agoraBrasil = `${dataLocal}T${horaLocal}`;

        const horario = (valor: unknown): string => {
          if (valor instanceof Date) return valor.toISOString().slice(11, 19);
          const texto = String(valor ?? "");
          if (!/^\d{2}:\d{2}(:\d{2})?$/.test(texto)) {
            throw new Error("Horário inválido no agendamento.");
          }
          const completo = texto.length === 5 ? `${texto}:00` : texto;
          const [h, m, s] = completo.split(":").map(Number);
          if (h > 23 || m > 59 || s > 59) throw new Error("Horário inválido no agendamento.");
          return completo;
        };
        const dataValida = (valor: unknown): string => {
          const data = String(valor ?? "");
          if (!/^\d{4}-\d{2}-\d{2}$/.test(data) ||
              Number.isNaN(Date.parse(`${data}T00:00:00Z`)) ||
              new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) !== data) {
            throw new Error("Data de devolução inválida.");
          }
          return data;
        };

        const inicioAgendado = `${dataValida(agendamento.data_agendada)}T${horario(agendamento.hora_inicio)}`;
        const inicioMs = Date.parse(inicioAgendado);
        const agoraMs = Date.parse(agoraBrasil);
        if (!Number.isFinite(inicioMs) || !Number.isFinite(agoraMs)) {
          throw new Error("Data ou horário da reserva inválidos.");
        }
        if (agoraMs < inicioMs - 30 * 60 * 1000) {
          throw new Error("A utilização só pode ser iniciada até 30 minutos antes do horário agendado.");
        }

        // Previsão original de retorno; compatibilidade com reservas antigas.
        let dataFim = agendamento.data_fim_prevista
          ? dataValida(agendamento.data_fim_prevista)
          : dataValida(agendamento.data_agendada);
        const horaFimOriginal = horario(agendamento.hora_fim);
        if (!agendamento.data_fim_prevista && horaFimOriginal <= horario(agendamento.hora_inicio)) {
          const proximoDia = new Date(`${dataFim}T00:00:00Z`);
          proximoDia.setUTCDate(proximoDia.getUTCDate() + 1);
          dataFim = proximoDia.toISOString().slice(0, 10);
        }
        let horaFim = horaFimOriginal;
        let fimPrevisto = `${dataFim}T${horaFim}`;

        // Opção B: permitir início atrasado, mas exigir nova previsão
        // quando a reserva original já terminou.
        if (fimPrevisto <= agoraBrasil) {
          if (!dados.data_fim_prevista || !dados.hora_fim) {
            throw new Error(
              "O horário original de devolução já passou. Informe uma nova data e hora previstas de retorno."
            );
          }
          dataFim = dataValida(dados.data_fim_prevista);
          horaFim = horario(dados.hora_fim);
          fimPrevisto = `${dataFim}T${horaFim}`;
        } else if (dados.data_fim_prevista || dados.hora_fim) {
          // Alterações explícitas devem vir com os dois campos.
          if (!dados.data_fim_prevista || !dados.hora_fim) {
            throw new Error("Informe data e hora juntas para alterar a previsão de retorno.");
          }
          dataFim = dataValida(dados.data_fim_prevista);
          horaFim = horario(dados.hora_fim);
          fimPrevisto = `${dataFim}T${horaFim}`;
        }
        if (fimPrevisto <= agoraBrasil) {
          throw new Error("A previsão de devolução deve ser posterior ao horário da retirada.");
        }

        // Consultar TODAS as reservas relevantes sob o mesmo bloqueio,
        // sem limite de paginação. O JOIN usa a relação real do Strapi 5.
        const reservas: any[] = await trx("agendamentos as a")
          .join("agendamentos_veiculo_lnk as l", "l.agendamento_id", "a.id")
          .where("l.veiculo_id", veiculoId)
          .whereIn("a.status_agendamento", ["reservado", "em_uso"])
          .whereNot("a.document_id", documentId)
          .select("a.*");

        for (const reserva of reservas) {
          if (reserva.status_agendamento === "em_uso") {
            throw new Error("Este veículo está em uso por outro motorista. Aguarde a finalização.");
          }
          if (!reserva.data_agendada || !reserva.hora_inicio || !reserva.hora_fim) {
            // Não autorizar retirada quando não for possível avaliar a agenda.
            throw new Error("Existe outra reserva com período incompleto. Solicite verificação à frota.");
          }
          const inicioOutra = `${dataValida(reserva.data_agendada)}T${horario(reserva.hora_inicio)}`;
          const horaFimOutra = horario(reserva.hora_fim);
          let dataFimOutra = reserva.data_fim_prevista
            ? dataValida(reserva.data_fim_prevista)
            : dataValida(reserva.data_agendada);
          if (!reserva.data_fim_prevista && horaFimOutra <= horario(reserva.hora_inicio)) {
            const proximoDia = new Date(`${dataFimOutra}T00:00:00Z`);
            proximoDia.setUTCDate(proximoDia.getUTCDate() + 1);
            dataFimOutra = proximoDia.toISOString().slice(0, 10);
          }
          const fimOutra = `${dataFimOutra}T${horaFimOutra}`;
          if (agoraBrasil < fimOutra && fimPrevisto > inicioOutra) {
            throw new Error("A retirada conflita com outra reserva do veículo neste período.");
          }
        }

        // Atualizar a previsão e iniciar o uso atomicamente.
        return await strapi
          .documents("api::agendamento.agendamento")
          .update({
            documentId,
            data: {
              status_agendamento: "em_uso",
              quilometragem_inicial: dados.quilometragem_inicial,
              nivel_combustivel_saida: dados.nivel_combustivel_saida,
              observacoes_retirada:
              typeof dados.observacoes_retirada === "string"
                ? dados.observacoes_retirada.trim()
                :"",
              data_inicio_real: dataLocal,
              hora_inicio_real: horaLocal,
              data_fim_prevista: dataFim,
              hora_fim: horaFim,
            },
          });
      });
    },

    // ============================================
    // FINALIZAR AGENDAMENTO
    // ============================================

    async finalizarAgendamento(
      documentId: string,
      dados: any,
      usuario: any
    ) {
      const agendamento = await strapi
        .documents("api::agendamento.agendamento")
        .findOne({
          documentId,
          populate: ["veiculo", "solicitante"],
        });

      // Verificar se o agendamento existe
      if (!agendamento) {
        throw new Error("Agendamento não encontrado.");
      }

      // Verificar se o usuário é o responsável
      if (agendamento.solicitante?.id !== usuario.id) {
        throw new Error(
          "Você não tem permissão para finalizar o agendamento de outro usuário."
        );
      }

      // Somente viagens em uso podem ser finalizadas
      if (agendamento.status_agendamento !== "em_uso") {
        throw new Error(
          `Agendamento não pode ser finalizado pois está com status '${agendamento.status_agendamento}'.`
        );
      }

      // Verificar quilometragem final obrigatória
      if (
        dados.quilometragem_final === undefined ||
        dados.quilometragem_final === null
      ) {
        throw new Error(
          "Quilometragem final é obrigatória para encerrar o agendamento."
        );
      }

      // Validar quilometragem final enviada pelo motorista
      if (
        !Number.isInteger(dados.quilometragem_final) ||
        dados.quilometragem_final < 0
      ) {
        throw new Error(
          "A quilometragem final deve ser um número inteiro não negativo."
        );
      }

      // Validar quilometragem inicial armazenada no banco
      if (
        !Number.isInteger(agendamento.quilometragem_inicial) ||
        agendamento.quilometragem_inicial < 0
      ) {
        throw new Error(
          "A quilometragem inicial do agendamento está ausente ou inválida."
        );
      }

      // Impedir quilometragem final menor que a inicial
      if (
        dados.quilometragem_final < agendamento.quilometragem_inicial
      ) {
        throw new Error(
          "A quilometragem final não pode ser menor que a quilometragem inicial."
        );
      }

      // Verificar combustível de chegada obrigatório
      if (
        dados.nivel_combustivel_chegada === undefined ||
        dados.nivel_combustivel_chegada === null
      ) {
        throw new Error(
          "O nível de combustível na chegada é obrigatório para encerrar o agendamento."
        );
      }

      // Validar níveis de combustível permitidos
      const niveisPermitidos = [
        "vazio",
        "um_quarto",
        "meio",
        "tres_quartos",
        "cheio",
      ];

      if (!niveisPermitidos.includes(dados.nivel_combustivel_chegada)) {
        throw new Error(
          "O nível de combustível de chegada informado é inválido."
        );
      }

      const agora = new Date();

      const dataLocal = agora.toLocaleDateString("en-CA", {
        timeZone: "America/Sao_Paulo",
      });

      const horaLocal = agora.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      });

      const agendamentoAtualizado = await strapi
        .documents("api::agendamento.agendamento")
        .update({
          documentId,
          data: {
            status_agendamento: "concluido",
            quilometragem_final: dados.quilometragem_final,
            nivel_combustivel_chegada: dados.nivel_combustivel_chegada,
            data_retorno: dataLocal,
            hora_chegada: horaLocal,
          },
        });

      return agendamentoAtualizado;
    },
  })
);
