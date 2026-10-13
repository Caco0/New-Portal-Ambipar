
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
          "Você não tem permissão para iniciar o agendamento de outro usuário."
        );
      }

      // Somente reservas podem ser iniciadas
      if (agendamento.status_agendamento !== "reservado") {
        throw new Error(
          `Agendamento não pode ser iniciado pois está com status '${agendamento.status_agendamento}'.`
        );
      }

      // Verificar quilometragem inicial obrigatória
      if (
        dados.quilometragem_inicial === undefined ||
        dados.quilometragem_inicial === null
      ) {
        throw new Error(
          "Quilometragem inicial é obrigatória para iniciar o agendamento."
        );
      }

      // Validar quilometragem inicial
      if (
        !Number.isInteger(dados.quilometragem_inicial) ||
        dados.quilometragem_inicial < 0
      ) {
        throw new Error(
          "A quilometragem inicial deve ser um número inteiro não negativo."
        );
      }

      // Verificar combustível de saída obrigatório
      if (
        dados.nivel_combustivel_saida === undefined ||
        dados.nivel_combustivel_saida === null
      ) {
        throw new Error(
          "Combustível inicial é obrigatório para iniciar o agendamento."
        );
      }

      // Validar os níveis de combustível permitidos
      const niveisPermitidos = [
        "vazio",
        "um_quarto",
        "meio",
        "tres_quartos",
        "cheio",
      ];

      if (!niveisPermitidos.includes(dados.nivel_combustivel_saida)) {
        throw new Error(
          "O nível de combustível de saída informado é inválido."
        );
      }

      // Capturar data e hora reais da partida
      const agora = new Date();

      const dataLocal = agora.toLocaleDateString("en-CA", {
        timeZone: "America/Sao_Paulo",
      });

      const horaLocal = agora.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      });

      // Atualizar agendamento no Strapi
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
