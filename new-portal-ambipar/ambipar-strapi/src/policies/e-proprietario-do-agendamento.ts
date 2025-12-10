export default async (policyContext, config, { strapi }) => {
    const { id } = policyContext.params;

    const registro = await strapi.entityService.findOne(
        "api::agendamento.agendamento",
        id,
        { populate: ["solicitante"] }
    );

    return registro.solicitante?.id === policyContext.state.user.id;
};
