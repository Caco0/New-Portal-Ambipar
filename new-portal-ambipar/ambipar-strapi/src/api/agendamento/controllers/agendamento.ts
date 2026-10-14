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

      // validação da CNH
      if (
        typeof numero_cnh !== "string" ||
        !numero_cnh.trim() ||
        typeof validade_cnh !== "string" ||
        !validade_cnh.trim()
      ){
        return ctx.badRequest("Número e validade da CNH são obrigatórios.");
      }

      // Verificar se a data existe e está no formato AAAA-MM-DD
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

    // Validar a data agendada e a validade da CNH
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

    const horarioValido = (valor: unknown): valor is string =>{
      if (typeof valor !== "string") {
        return false;
      }
      return /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(valor);
    };

    if (!horarioValido(hora_inicio) ||
        !horarioValido(hora_fim)) {
          return ctx.badRequest("Horários inválidos. Informe horários entre 00:00 e 23:59 no formato HH:mm.");
    }

    // Padronizar hoários para HH:mm:ss
    const inicioNormalizado = hora_inicio.length === 5 ? `${hora_inicio}:00` : hora_inicio;

    const fimNormalizado = hora_fim.length === 5 ? `${hora_fim}:00` : hora_fim;

    if (inicioNormalizado === fimNormalizado) {
      return ctx.badRequest("Horário de inicio deve ser diferente do horário de término.");
    }

    // calcular a data prevista de devolução

    const dataFim = new Date(`${data_agendada}T00:00:00Z`);

    if (fimNormalizado < inicioNormalizado) {
        dataFim.setUTCDate(dataFim.getUTCDate() + 1);
    }
    
    const data_fim_prevista = dataFim.toISOString().slice(0, 10);
    
    

    try {

        // =========================================
        // VERIFICAR CONFLITOS DE AGENDAMENTO
        // =========================================

        // Consultar todas as reservas ativas do veículo em lotes
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
                  $eq: veiculo,
                },
              },
              status_agendamento: {
                $in: ["reservado", "em_uso"],
              },
            },
            sort: ["data_agendada:asc", "hora_inicio:asc", "id:asc"],
            start: (pagina - 1) * tamanhoPagina,
            limit: tamanhoPagina,
          });

          reservasExistentes.push(...lote);

          if (lote.length < tamanhoPagina) {
            break;
          }

          pagina++;
        }

        // Montar os períodos usando data e horário
        const inicioNovo = `${data_agendada}T${inicioNormalizado}`;
        const fimNovo = `${data_fim_prevista}T${fimNormalizado}`;

        const existeConflito = reservasExistentes.some((reserva) => {
          if (
            !reserva.data_agendada ||
            !reserva.hora_inicio ||
            !reserva.hora_fim
          ) {
            return false;
          }

          // Compatibilidade com reservas antigas,
          // que ainda não possuem data_fim_prevista.
          let dataFimExistente = reserva.data_fim_prevista;

          if (!dataFimExistente) {
            const dataCalculada = new Date(
              `${reserva.data_agendada}T00:00:00Z`
            );

            if (reserva.hora_fim < reserva.hora_inicio) {
              dataCalculada.setUTCDate(
                dataCalculada.getUTCDate() + 1
              );
            }

            dataFimExistente = dataCalculada
              .toISOString()
              .slice(0, 10);
          }

          // Normalizar horários retornados pelo Strapi
          const normalizarHorario = (valor: string | Date): string => {
            if (valor instanceof Date) {
              return valor.toISOString().slice(11, 19);
            }

            return valor.slice(0, 8);
          };

          const inicioExistente =
            `${reserva.data_agendada}T${normalizarHorario(reserva.hora_inicio)}`;

          const fimExistente =
            `${dataFimExistente}T${normalizarHorario(reserva.hora_fim)}`;

          return (
            inicioNovo < fimExistente &&
            fimNovo > inicioExistente
          );
        });

        if (existeConflito) {
          return ctx.badRequest(
            "Veículo já está agendado nesta data e período."
          );
        }

        const agendamento = await strapi.documents(
          "api::agendamento.agendamento"
        ).create({
          data: {
            veiculo,
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

        ctx.body = {
          data: agendamento,
        };
      } catch (error: any) {
        return ctx.badRequest(error.message);
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
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .iniciarAgendamento(documentId, dados, usuario);

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
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .finalizarAgendamento(documentId, dados, usuario);

        ctx.body = {
          data: agendamento,
        };
      } catch (error: any) {
        return ctx.badRequest(error.message);
      }
    },

  })
);