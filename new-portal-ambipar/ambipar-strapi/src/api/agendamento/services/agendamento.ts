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

      if (dados.quilometragem_inicial === undefined ||
          dados.quilometragem_inicial === null){
        throw new Error("Quilometragem inicial é obrigatória para iniciar o agendamento.");
      }

      if (dados.nivel_combustivel_saida === undefined ||
          dados.nivel_combustivel_saida === null){
        throw new Error("Combustível inicial é obrigatório para iniciar o agendamento.");
      }

      if (dados.nivel_combustivel_saida === undefined ||
          dados.nivel_combustivel_saida === null
      ) {
          throw new Error( 
            "Combustivel inicial é obrigfatório para iniciar o agendamento."
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

      // console.log("Data para o Strapi: ", dataLocal);
      // console.log("Hora para o Strapi: ", horaLocal);

      // console.log("Data completa: ", agora);
      // console.log("ISO: ", agora.toISOString());
      // console.log("Data Local: ", agora.toLocaleDateString("pt-BR"));
      // console.log("Hora Local: ", agora.toLocaleTimeString("pt-BR"));

      const agendamentoAtualizado = await strapi
        .documents("api::agendamento.agendamento")
        .update({
          documentId,
          data: {
            status_agendamento: "em_uso",
            quilometragem_inicial: dados.quilometragem_inicial,
            nivel_combustivel_saida: dados.nivel_combustivel_saida,
            data_inicio_real: dataLocal,
            hora_inicio_real: horaLocal,
          },
        });
        return agendamentoAtualizado;
    },
  })
);
