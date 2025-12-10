// import type { Lifecycle } from '@strapi/strapi';

// const lifecycles: Lifecycle<'api::agendamento.agendamento'> = {

//     async beforeCreate(event) {
//         const { data } = event.params;

//         if (!data) return;

//         // 🔒 Validar CNH vencida
//         if (data.validade_cnh && data.data_agendada) {
//         const validade = new Date(data.validade_cnh);
//         const agendada = new Date(data.data_agendada);

//         if (validade < agendada) {
//             throw new Error("Carteira de motorista vencida.");
//         }
//         }
//     },

//     async beforeUpdate(event) {
//         const { data, where } = event.params;

//         if (!data) return;

//         // Buscar registro atual
//         const agendamentoAtual = await strapi.entityService.findOne(
//         "api::agendamento.agendamento",
//         where.id
//         );

//         // 🔒 Bloquear edição da reserva por outro usuário
//         if (
//         agendamentoAtual.solicitante?.id &&
//         event.state?.auth?.credentials?.id !== agendamentoAtual.solicitante.id
//         ) {
//         throw new Error("Você só pode alterar seus próprios agendamentos.");
//         }

//         // 🔒 Validar CNH novamente se alterar data
//         if (data.validade_cnh || data.data_agendada) {
//         const validade = new Date(data.validade_cnh || agendamentoAtual.validade_cnh);
//         const agendada = new Date(data.data_agendada || agendamentoAtual.data_agendada);

//         if (validade < agendada) {
//             throw new Error("Carteira de motorista vencida.");
//         }
//         }

//         // 🔵 INICIAR VIAGEM
//         if (data.quilometragem_inicial && !agendamentoAtual.data_inicio_real) {
//         data.data_inicio_real = new Date();
//         data.hora_inicio_real = new Date().toTimeString().slice(0, 5);
//         data.status = "em_uso";
//         }

//         // 🔴 FINALIZAR VIAGEM
//         const camposRetornoPreenchidos =
//         data.quilometragem_final ||
//         data.data_retorno ||
//         data.hora_chegada ||
//         data.nivel_combustivel_chegada ||
//         data.ocorrencias;

//         if (camposRetornoPreenchidos) {
//         if (
//             data.quilometragem_final &&
//             data.data_retorno &&
//             data.hora_chegada
//         ) {
//             data.status = "concluido";
//         }
//         }
//     }
// };

// export default lifecycles;
