export default {
    routes: [
        {
        method: "GET",
        path: "/agendamentos",
        handler: "agendamento.find",
        config: {
            policies: [],
        },
        },

        {
        method: "GET",
        path: "/agendamentos/meus",
        handler: "agendamento.meus",
        config: {
            policies: [],
        },
        },

        {
        method: "GET",
        path: "/agendamentos/:id",
        handler: "agendamento.findOne",
        config: {
            policies: [],
        },
        },
        {
        method: "POST",
        path: "/agendamentos",
        handler: "agendamento.create",
        config: {
            policies: [],
        },
        },

        // Enviar fotografias da vistoria de retirada.

        {
        method: "POST",
        path: "/agendamentos/:documentId/vistoria-retirada",
        handler: "agendamento.vistoriaRetirada",
        config: {
            policies: [],
        },
        },

        // Iniciar utilização do veículo
        {
        method: "POST",
        path: "/agendamentos/:documentId/iniciar", //Rota solicitada!!!
        handler: "agendamento.iniciar",
        config: {
            policies: [],
        },
        },

        // ============================================
        // VISTORIA DE DEVOLUÇÃO
        // ============================================
        {
        method: "POST",
        path: "/agendamentos/:documentId/vistoria-devolucao",
        handler: "agendamento.vistoriaDevolucao",
        config: {
            policies: [],
        },
        },
        // Finalizar utilização do veículo

        {
        method: "POST",
        path: "/agendamentos/:documentId/finalizar",
        handler: "agendamento.finalizar",
        config: {
            policies: [],
        },
        },

        // EDITAR RESERVA NÃO INICIADA
        {
            method: "PUT",
            path: "/agendamentos/:documentId/editar",
            handler: "agendamento.editar",
            config: {
                policies: [],
            },
        },

        // Cancelamento de reserva não iniciada
        {
            method: "POST",
            path: "/agendamentos/:documentId/cancelar",
            handler: "agendamento.cancelar",
            config: {
                policies: [],
            },
        },

        {
        method: "PUT",
        path: "/agendamentos/:documentId/editar",
        handler: "agendamento.editar    ",
        config: {
            policies: ["global::e-proprietario-do-agendamento"],
        },
        },
        {
        method: "DELETE",
        path: "/agendamentos/:id",
        handler: "agendamento.delete",
        config: {
            policies: ["global::e-proprietario-do-agendamento"],
        },
        },
    ],
};
