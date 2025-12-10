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
        {
        method: "PUT",
        path: "/agendamentos/:id",
        handler: "agendamento.update",
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
