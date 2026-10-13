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

      ctx.request.body = {
        data: {
          veiculo,
          destino,
          finalidade,
          data_agendada,
          hora_inicio,
          hora_fim,
          numero_cnh,
          validade_cnh,

          // Valores controlados pelo servidor
          solicitante: usuario.id,
          status_agendamento: "reservado",
        },
      };

      return super.create(ctx);
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