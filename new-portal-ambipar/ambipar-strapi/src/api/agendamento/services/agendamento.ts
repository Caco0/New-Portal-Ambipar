/**
 * agendamento service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::agendamento.agendamento",
      ({ strapi }) => ({
        async iniciarAgendamento(documentId: string, dados: any){
          const agendamento = await strapi
          .documents("api::agendamento.agendamento")
          .findOne({ 
            documentId, 
            populate: ["veiculo", "solicitante"],
      });
      if (!agendamento) {
        throw new Error(`Agendamento não pode ser iniciado pois está com status '${agendamento.status_agendamento}'`);
      }
      return agendamento;
    },
  })
);
