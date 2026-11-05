import middlewares from "../../../../config/middlewares";

export default {
    routes:[
        {
            method: "GET",
            path: "/veiculos/:documentId/agenda",
            handler:"veiculo.agenda",
            config: {
                auth: {},
                policies: [],
                middlewares: [],
            },
        },
    ],
};