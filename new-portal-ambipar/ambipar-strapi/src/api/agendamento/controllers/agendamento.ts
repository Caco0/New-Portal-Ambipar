/**
 * agendamento controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::agendamento.agendamento",
  ({ strapi }) => ({
    async iniciar(ctx) {
      const { documentId } = ctx.params;
      const dados = ctx.request.body;

      const usuario = ctx.state.user;
      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      try{
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
  })
);
