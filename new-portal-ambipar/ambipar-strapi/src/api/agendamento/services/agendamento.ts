/**
 * agendamento service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::agendamento.agendamento",
      ({ strapi }) => ({
        async iniciarAgendamento(
          documentId: string, 
          dados: any, 
          usuario: any) {
          const agendamento = await strapi
          .documents("api::agendamento.agendamento")
          .findOne({ 
            documentId, 
            populate: ["veiculo", "solicitante"],
      });
      if (!agendamento) {
        throw new Error("Agendamento não encontrado");
      }

      if (agendamento.solicitante?.id !== usuario.id) {
        throw new Error("Você não tem permissão para iniciar o agendamento de outro usuário.");
      }


      if (agendamento.status_agendamento !== "reservado") {
        throw new Error(`Agendamento não pode ser iniciado pois está com status '${agendamento.status_agendamento}'`);
      }
      return agendamento;
    },
  })
);
