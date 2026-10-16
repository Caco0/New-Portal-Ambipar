
/**
 * agendamento controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::agendamento.agendamento",
  ({ strapi }) => ({

    // =========================================
    // CRIAR AGENDAMENTO
    // =========================================
    async create(ctx) {
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      const body = ctx.request.body as {
        data?: Record<string, any>;
      };

      const dados = body?.data;

      if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
      ) {
        return ctx.badRequest("Dados do agendamento inválidos.");
      }

      const {
        veiculo,
        destino,
        finalidade,
        data_agendada,
        hora_inicio,
        hora_fim,
        numero_cnh,
        validade_cnh,
      } = dados;

      // =========================================
      // VALIDAR IDENTIFICADOR DO VEÍCULO
      // =========================================
      if (
        !(
          (typeof veiculo === "number" &&
            Number.isInteger(veiculo) &&
            veiculo > 0) ||
          (typeof veiculo === "string" &&
            veiculo.trim().length > 0)
        )
      ) {
        return ctx.badRequest(
          "Veículo inválido ou não informado."
        );
      }

      // =========================================
      // VALIDAR CNH
      // =========================================
      if (
        typeof numero_cnh !== "string" ||
        !numero_cnh.trim() ||
        typeof validade_cnh !== "string" ||
        !validade_cnh.trim()
      ) {
        return ctx.badRequest(
          "Número e validade da CNH são obrigatórios."
        );
      }

      // Verificar se a data existe no formato AAAA-MM-DD
      const dataValida = (valor: string): boolean => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          return false;
        }

        const data = new Date(`${valor}T00:00:00Z`);

        return (
          !Number.isNaN(data.getTime()) &&
          data.toISOString().slice(0, 10) === valor
        );
      };

      // Validar data agendada e validade da CNH
      if (
        typeof data_agendada !== "string" ||
        !dataValida(data_agendada) ||
        !dataValida(validade_cnh)
      ) {
        return ctx.badRequest(
          "Data agendada ou validade da CNH inválida."
        );
      }

      // Bloquear CNH vencida na data da viagem
      if (validade_cnh < data_agendada) {
        return ctx.badRequest(
          "CNH vencida para a data agendada. Reserva não permitida."
        );
      }

      // =========================================
      // VALIDAR HORÁRIOS
      // =========================================
      const horarioValido = (
        valor: unknown
      ): valor is string => {
        return (
          typeof valor === "string" &&
          /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(valor)
        );
      };

      if (
        !horarioValido(hora_inicio) ||
        !horarioValido(hora_fim)
      ) {
        return ctx.badRequest(
          "Horários inválidos. Informe horários entre 00:00 e 23:59 no formato HH:mm."
        );
      }

      // Padronizar horários para HH:mm:ss
      const inicioNormalizado =
        hora_inicio.length === 5
          ? `${hora_inicio}:00`
          : hora_inicio;

      const fimNormalizado =
        hora_fim.length === 5
          ? `${hora_fim}:00`
          : hora_fim;

      if (inicioNormalizado === fimNormalizado) {
        return ctx.badRequest(
          "Horário de início deve ser diferente do horário de término."
        );
      }

      // =========================================
      // CALCULAR DATA PREVISTA DE DEVOLUÇÃO
      // =========================================
      const dataFim = new Date(
        `${data_agendada}T00:00:00Z`
      );

      if (fimNormalizado < inicioNormalizado) {
        dataFim.setUTCDate(
          dataFim.getUTCDate() + 1
        );
      }

      const data_fim_prevista = dataFim
        .toISOString()
        .slice(0, 10);

      // =========================================
      // LOCALIZAR VEÍCULO
      // =========================================
      const filtroVeiculo =
        typeof veiculo === "number"
          ? { id: veiculo }
          : { documentId: veiculo.trim() };

      try {
        // =========================================
        // TRANSAÇÃO DE AGENDAMENTO
        // =========================================
        const agendamento = await strapi.db.transaction(
          async ({ trx }) => {

            // Adquirir o bloqueio de escrita do SQLite
            // antes de consultar reservas existentes.
            //
            // O UPDATE não altera o ID do veículo.
            // Sua finalidade é adquirir o bloqueio.
            const linhasBloqueadas = await trx("veiculos")
              .where({ id: (
                await strapi.db
                  .query("api::veiculo.veiculo")
                  .findOne({ where: filtroVeiculo })
              )?.id ?? -1 })
              .update({ id: trx.ref("id") });

            if (linhasBloqueadas !== 1) {
              throw new Error(
                "Veículo não encontrado para reserva."
              );
            }

            // Após adquirir o bloqueio, localizar
            // novamente o veículo dentro da transação.
            const veiculoEncontrado = await strapi.db
              .query("api::veiculo.veiculo")
              .findOne({
                where: filtroVeiculo,
              });

            if (!veiculoEncontrado) {
              throw new Error(
                "Veículo não encontrado."
              );
            }

            if (
              veiculoEncontrado.status_veiculo !==
              "disponivel"
            ) {
              throw new Error(
                "Veículo indisponível ou em manutenção."
              );
            }

            const veiculoId = veiculoEncontrado.id;

            // =========================================
            // VERIFICAR CONFLITOS DE AGENDAMENTO
            // =========================================
            const reservasExistentes: any[] = [];

            const tamanhoPagina = 100;
            let pagina = 1;

            while (true) {
              const lote = await strapi.documents(
                "api::agendamento.agendamento"
              ).findMany({
                filters: {
                  veiculo: {
                    id: {
                      $eq: veiculoId,
                    },
                  },
                  status_agendamento: {
                    $in: ["reservado", "em_uso"],
                  },
                },
                sort: [
                  "data_agendada:asc",
                  "hora_inicio:asc",
                  "id:asc",
                ],
                start: (pagina - 1) * tamanhoPagina,
                limit: tamanhoPagina,
              });

              reservasExistentes.push(...lote);

              if (lote.length < tamanhoPagina) {
                break;
              }

              pagina++;
            }

            // Montar o período da nova reserva
            const inicioNovo =
              `${data_agendada}T${inicioNormalizado}`;

            const fimNovo =
              `${data_fim_prevista}T${fimNormalizado}`;

            // Normalizar horários retornados pelo Strapi
            const normalizarHorario = (
              valor: string | Date
            ): string => {
              if (valor instanceof Date) {
                return valor.toISOString().slice(11, 19);
              }

              return valor.slice(0, 8);
            };

            const existeConflito = reservasExistentes.some(
              (reserva) => {
                if (
                  !reserva.data_agendada ||
                  !reserva.hora_inicio ||
                  !reserva.hora_fim
                ) {
                  return false;
                }

                // Compatibilidade com reservas antigas
                // sem data_fim_prevista.
                let dataFimExistente =
                  reserva.data_fim_prevista;

                const inicioAntigo =
                  normalizarHorario(
                    reserva.hora_inicio
                  );

                const fimAntigo =
                  normalizarHorario(
                    reserva.hora_fim
                  );

                if (!dataFimExistente) {
                  const dataCalculada = new Date(
                    `${reserva.data_agendada}T00:00:00Z`
                  );

                  if (fimAntigo < inicioAntigo) {
                    dataCalculada.setUTCDate(
                      dataCalculada.getUTCDate() + 1
                    );
                  }

                  dataFimExistente = dataCalculada
                    .toISOString()
                    .slice(0, 10);
                }

                const inicioExistente =
                  `${reserva.data_agendada}T${inicioAntigo}`;

                const fimExistente =
                  `${dataFimExistente}T${fimAntigo}`;

                return (
                  inicioNovo < fimExistente &&
                  fimNovo > inicioExistente
                );
              }
            );

            if (existeConflito) {
              throw new Error(
                "Veículo já está agendado nesta data e período."
              );
            }

            // =========================================
            // CRIAR AGENDAMENTO
            // =========================================
            const novoAgendamento = await strapi.documents(
              "api::agendamento.agendamento"
            ).create({
              data: {
                veiculo: veiculoEncontrado.documentId,
                destino,
                finalidade,
                data_agendada,
                hora_inicio: inicioNormalizado,
                data_fim_prevista,
                hora_fim: fimNormalizado,
                numero_cnh,
                validade_cnh,
                solicitante: usuario.id,
                status_agendamento: "reservado",
              },
            });

            return novoAgendamento;
          }
        );

        // A transação foi concluída com sucesso.
        ctx.body = {
          data: agendamento,
        };

      } catch (error: any) {
        strapi.log.error(
          "Erro ao criar agendamento:",
          error
        );

        return ctx.badRequest(
          error?.message ||
          "Não foi possível criar o agendamento."
        );
      }
    },

    // =========================================
    // INICIAR AGENDAMENTO
    // =========================================
    async iniciar(ctx) {
      const { documentId } = ctx.params;
      const dados = ctx.request.body;
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized(
          "Usuário não autenticado."
        );
      }

      if (!documentId) {
        return ctx.badRequest(
          "Agendamento não informado."
        );
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .iniciarAgendamento(
            documentId,
            dados,
            usuario
          );

        ctx.body = {
          data: agendamento,
        };
      } catch (error: any) {
        return ctx.badRequest(error.message);
      }
    },

    // =========================================
    // FINALIZAR AGENDAMENTO
    // =========================================
    async finalizar(ctx) {
      const { documentId } = ctx.params;
      const dados = ctx.request.body;
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized(
          "Usuário não autenticado."
        );
      }

      if (!documentId) {
        return ctx.badRequest(
          "Agendamento não informado."
        );
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .finalizarAgendamento(
            documentId,
            dados,
            usuario
          );

        ctx.body = {
          data: agendamento,
        };
      } catch (error: any) {
        return ctx.badRequest(error.message);
      }
    },

  })
);
