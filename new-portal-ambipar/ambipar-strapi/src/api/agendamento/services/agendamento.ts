/**
 * agendamento service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::agendamento.agendamento",
  ({ strapi}) => ({
    async iniciarAgendamento(id: number, dados: any) {
      const agendamento = await strapi.entityService.findOne(
        "api::agendamento.agendamento", id,
        {
          populate: ["veiculo", "solicitante"],
        }
      );
      if (!agendamento) {
        throw new Error("Agendamento não encontrado");
      }
      if (agendamento.status !== "reservado") {
        throw new Error(
          `Agendamento não pode ser iniciado porque está com status '${agendamento.status}'`
        );
      }
      return agendamento;
    }
  })
);
