export default async (policyContext, config, { strapi }) => {
    const { id: documentId } = policyContext.params;

    const usuario = policyContext.state.user;

    // Verificar autenticação
    if (!usuario) {
        return false;
    }

    // Verificar identificador
    if (!documentId) {
        return false;
    }

    // Consultar utilizando Document Service do Strapi 5
    const registro = await strapi
        .documents("api::agendamento.agendamento")
        .findOne({
        documentId,
        populate: {
            solicitante: true,
        },
        });

    // Impedir acesso se o registro não existir
    if (!registro) {
        return false;
    }

    // Permitir somente ao proprietário
    return registro.solicitante?.id === usuario.id;
};