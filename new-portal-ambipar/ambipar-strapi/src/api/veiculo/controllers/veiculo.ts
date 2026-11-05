import { factories } from "@strapi/strapi";

export default factories.createCoreController(
    "api::veiculo.veiculo",
    ({ strapi}) => ({
        async agenda(ctx) {
            //A consulta da agenda exige autenticação.
            if (!ctx.state.user){
                return ctx.unauthorized("Usuário não autenticado.");
            }
            const { documentId } = ctx.params;

            if (
                typeof documentId !== "string" ||
                !documentId.trim()
            ) {
                return ctx.badRequest("Veículo não informado");
            }

            try {
                //Localiza o veículo solicitado.
                const veiculo = await strapi.documents(
                    "api::veiculo.veiculo"
                ).findOne({
                    documentId, 
                    fields: ["nome", "placa", "status_veiculo"],
                });

                if (!veiculo) {
                    return ctx.notFound("veículo não encontrado.");
                }

                //Buscar os agendamentos do veículo.
                const reservas = await strapi.documents(
                    "api::agendamento.agendamento"
                ).findMany({
                    filters: {
                        veiculo: {
                            documentId: {
                                $eq: documentId,
                            },
                        },
                        status_agendamento: {
                            $in: ["reservado", "em_uso", "concluido"],
                        },
                    },
                    fields: [
                        "documentId",
                        "data_agendada",
                        "hora_inicio",
                        "data_fim_prevista",
                        "hora_fim",
                        "status_agendamento",
                    ],
                    sort: ["data_agendada:asc", "hora_inicio:asc"],
                });

                //Retornar somente os dados necessários
                //para exibir a agenda.
                ctx.body = {
                    data: {
                        veiculo: {
                            documentId: veiculo.documentId,
                            nome: veiculo.nome,
                            placa: veiculo.placa,
                            status_veiculo: veiculo.status_veiculo,
                        },
                        agendamentos: reservas,
                    },
                };
            } catch (error) {
                strapi.log.error(
                    "Erro ao consultar agenda do veículo",
                    error
                );
                return ctx.internalServerError(
                    "Não foi possível consultar a agenda."
                );
            }
        },
    })
);