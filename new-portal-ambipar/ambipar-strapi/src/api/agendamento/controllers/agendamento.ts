/**
 * agendamento controller
 */

import { factories } from "@strapi/strapi";
import agendamento from "../routes/agendamento";
import { error } from "console";

// Controle de vistorias em processamento
const vistoriasEmProcessamento = new Set<string>();

export default factories.createCoreController(
  "api::agendamento.agendamento",
  ({ strapi }) => ({

    // =========================================
    // PROTEGER EVIDÊNCIAS DA VISTORIA
    // =========================================
    
    async update(ctx){
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }
      
      const dados =  ctx.request.body?.data;

      if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        return ctx.badRequest("Dados de atualização inválidos.");
      }

      const camposProtegidos = [
        "imagens_retirada",
        "observacoes_retirada",
        "imagens_ocorrencia",
        "ocorrencias",
      ];
    
      const tentativaAlteracao = camposProtegidos.some(
        (campo) => Object.prototype.hasOwnProperty.call(dados, campo)
      );

      if (tentativaAlteracao) {
        return ctx.forbidden(
          "As evidencias de vistoria não podem ser alteradas por esta rota."
        );
      }
      return await super.update(ctx);
    },

    // =========================================
    // PROTEGER EXCLUSÃO DE AGENDAMENTOS
    // =========================================

    async delete(ctx) {
      const usuario = ctx.state.user;
      const { id } = ctx.params;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      const agendamento = await strapi
        .documents("api::agendamento.agendamento")
        .findOne({
          documentId: id,
          populate: {
            solicitante: true,
            imagens_retirada: true,
          },
        });

      if (!agendamento) {
        return ctx.notFound("Agendamento não encontrado.");
      }

      if (agendamento.solicitante?.id !== usuario.id) {
        return ctx.forbidden(
          "Você não tem permissão para excluir esta reserva."
        );
      }

      if (agendamento.status_agendamento !== "reservado") {
        return ctx.forbidden(
          "Reservas em uso ou concluídas não podem ser excluídas."
        );
      }

      if ((agendamento.imagens_retirada?.length ?? 0) > 0) {
        return ctx.forbidden(
          "Esta reserva possui fotografias de vistoria e não pode ser excluída."
        );
      }

      return await super.delete(ctx);
    },

    // =========================================
    // EDITAR RESERVA NÃO INICIADA
    // =========================================

    async editar(ctx) {
      const usuario = ctx.state.user;
      const { documentId } = ctx.params;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Reserva não informada.");
      }

      const dados = ctx.request.body?.data;

      // Versão da reserva recebida do front 
      const versaoRecebida = ctx.request.body?.versaoEdicao;

      if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
      ) {
        return ctx.badRequest("Dados de edição inválidos.");
      }

      // A versão será obrigatória para evitar sobrescritas.
      if (
        typeof versaoRecebida !== "string" ||
        !Number.isFinite(Date.parse(versaoRecebida))
      ) {
        return ctx.badRequest(
          "Versão da reserva não informada ou inválida."
        );
      }

      // Apenas estes campos podem ser modificados.
      const camposPermitidos = [
        "destino",
        "finalidade",
        "data_agendada",
        "hora_inicio",
        "data_fim_prevista",
        "hora_fim",
        "numero_cnh",
        "validade_cnh",
      ];

      const camposRecebidos = Object.keys(dados);

      if (
        camposRecebidos.length === 0 ||
        camposRecebidos.some(
          (campo) => !camposPermitidos.includes(campo)
        ) ||
        camposPermitidos.some(
          (campo) => !Object.prototype.hasOwnProperty.call(dados, campo)
        )
      ) {
        return ctx.badRequest(
          "Envie somente os oito campos permitidos para edição."
        );
      }

      const {
        destino,
        finalidade,
        data_agendada,
        hora_inicio,
        data_fim_prevista,
        hora_fim,
        numero_cnh,
        validade_cnh,
      } = dados;

      // Validar textos.
      if (
        typeof destino !== "string" ||
        !destino.trim() ||
        typeof finalidade !== "string" ||
        !finalidade.trim() ||
        typeof numero_cnh !== "string" ||
        !numero_cnh.trim()
      ) {
        return ctx.badRequest(
          "Destino, finalidade e número da CNH são obrigatórios."
        );
      }

      // Validar datas reais no formato AAAA-MM-DD.
      const dataValida = (valor: unknown): valor is string => {
        if (
          typeof valor !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(valor)
        ) {
          return false;
        }

        const data = new Date(`${valor}T00:00:00Z`);

        return (
          !Number.isNaN(data.getTime()) &&
          data.toISOString().slice(0, 10) === valor
        );
      };

      if (
        !dataValida(data_agendada) ||
        !dataValida(data_fim_prevista) ||
        !dataValida(validade_cnh)
      ) {
        return ctx.badRequest(
          "Data de retirada, devolução ou validade da CNH inválida."
        );
      }

      if (data_fim_prevista < data_agendada) {
        return ctx.badRequest(
          "A devolução não pode ocorrer antes da retirada."
        );
      }

      if (validade_cnh < data_fim_prevista) {
        return ctx.badRequest(
          "A CNH deve estar válida até a devolução prevista."
        );
      }

      // Validar e normalizar horários.
      const horarioValido = (valor: unknown): valor is string =>
        typeof valor === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(valor);

      if (
        !horarioValido(hora_inicio) ||
        !horarioValido(hora_fim)
      ) {
        return ctx.badRequest(
          "Informe horários válidos no formato HH:mm."
        );
      }

      const normalizar = (valor: string | Date): string => {
        if (valor instanceof Date) {
          return valor.toISOString().slice(11, 19);
        }

        return valor.length === 5
          ? `${valor}:00`
          : valor.slice(0, 8);
      };

      const inicioNormalizado = normalizar(hora_inicio);
      const fimNormalizado = normalizar(hora_fim);

      const inicioNovo =
        `${data_agendada}T${inicioNormalizado}`;

      const fimNovo =
        `${data_fim_prevista}T${fimNormalizado}`;

      if (fimNovo <= inicioNovo) {
        return ctx.badRequest(
          "O término deve ser posterior ao início da reserva."
        );
      }

      // Horário atual da operação no Brasil.
      const agoraBrasil = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).format(new Date()).replace(" ", "T");

      if (inicioNovo <= agoraBrasil) {
        return ctx.badRequest(
          "A retirada deve ocorrer em data e horário futuros."
        );
      }

      try {
        const resultado = await strapi.db.transaction(
          async ({ trx }) => {
            const registro = await strapi.db
              .query("api::agendamento.agendamento")
              .findOne({
                where: { documentId },
                populate: ["veiculo"],
              });

            if (!registro) {
              return { tipo: "nao_encontrado" };
            }

            // Serializar alterações concorrentes no SQLite.
            // A mesma tabela de veículos é usada na criação.
            const veiculoId = registro.veiculo?.id;

            if (!veiculoId) {
              return { tipo: "veiculo_invalido" };
            }

            const bloqueados = await trx("veiculos")
              .where({ id: veiculoId })
              .update({ id: trx.ref("id") });

            if (bloqueados !== 1) {
              return { tipo: "veiculo_invalido" };
            }

            const reserva = await strapi.documents(
              "api::agendamento.agendamento"
            ).findOne({
              documentId,
              populate: [
                "solicitante",
                "veiculo",
                "imagens_retirada",
              ],
            });

            if (!reserva) {
              return { tipo: "nao_encontrado" };
            }

            if (reserva.solicitante?.id !== usuario.id) {
              return { tipo: "proibido" };
            }

            // impedir que uma edição antiga sobescreva uma mais recente.
            const versaoAtual = reserva.updatedAt;

            if(
              !versaoAtual ||
              new Date(versaoAtual).getTime() !==
              new Date(versaoRecebida).getTime()
            ) {
              return { tipo: "versao_desatualizada"};
            }

            if (reserva.status_agendamento !== "reservado") {
              return { tipo: "status_invalido" };
            }

            if ((reserva.imagens_retirada?.length ?? 0) > 0) {
              return { tipo: "vistoria_existente" };
            }

            const veiculoAtual = await strapi.db
              .query("api::veiculo.veiculo")
              .findOne({
                where: { id: veiculoId },
              });

            if (veiculoAtual?.status_veiculo !== "disponivel") {
              return { tipo: "veiculo_indisponivel" };
            }

            // Consultar todas as reservas ativas do veículo.
            const reservasExistentes: any[] = [];
            const tamanhoPagina = 100;
            let pagina = 1;

            while (true) {
              const lote = await strapi.documents(
                "api::agendamento.agendamento"
              ).findMany({
                filters: {
                  veiculo: {
                    id: { $eq: veiculoId },
                  },
                  status_agendamento: {
                    $in: ["reservado", "em_uso"],
                  },
                },
                sort: [
                  "data_agendada:asc",
                  "hora_inicio:asc",
                  "id:asc",
                ],
                start: (pagina - 1) * tamanhoPagina,
                limit: tamanhoPagina,
              });

              reservasExistentes.push(...lote);

              if (lote.length < tamanhoPagina) break;

              pagina++;
            }

            const conflito = reservasExistentes.some(
              (outra: any) => {
                // A própria reserva não é um conflito.
                if (outra.documentId === documentId) {
                  return false;
                }

                if (
                  !outra.data_agendada ||
                  !outra.hora_inicio ||
                  !outra.hora_fim
                ) {
                  return false;
                }

                const inicioAntigo = normalizar(
                  outra.hora_inicio
                );

                const fimAntigo = normalizar(
                  outra.hora_fim
                );

                let dataFimAntiga =
                  outra.data_fim_prevista;

                // Compatibilidade com registros antigos.
                if (!dataFimAntiga) {
                  const dataCalculada = new Date(
                    `${outra.data_agendada}T00:00:00Z`
                  );

                  if (fimAntigo < inicioAntigo) {
                    dataCalculada.setUTCDate(
                      dataCalculada.getUTCDate() + 1
                    );
                  }

                  dataFimAntiga = dataCalculada
                    .toISOString()
                    .slice(0, 10);
                }

                const inicioExistente =
                  `${outra.data_agendada}T${inicioAntigo}`;

                const fimExistente =
                  `${dataFimAntiga}T${fimAntigo}`;

                return (
                  inicioNovo < fimExistente &&
                  fimNovo > inicioExistente
                );
              }
            );

            if (conflito) {
              return { tipo: "conflito" };
            }

            // Atualizar apenas os campos autorizados.
            const atualizado = await strapi.documents(
              "api::agendamento.agendamento"
            ).update({
              documentId,
              data: {
                destino: destino.trim(),
                finalidade: finalidade.trim(),
                data_agendada,
                hora_inicio: inicioNormalizado,
                data_fim_prevista,
                hora_fim: fimNormalizado,
                numero_cnh: numero_cnh.trim(),
                validade_cnh,
              },
            });

            return {
              tipo: "sucesso",
              data: atualizado,
            };
          }
        );

        switch (resultado.tipo) {
          case "nao_encontrado":
            return ctx.notFound("Reserva não encontrada.");

          case "proibido":
            return ctx.forbidden(
              "Você não pode editar esta reserva."
            );
          case "versao_desatualizada":
            ctx.status = 409; // Conflito
            ctx.body = {
              data: null,
              error: {
                status: 409,
                name: "ConflictError",
                message: 
                "Esta reserva foi alterada em outra sessão. Atualize os dados antes de tentar novamente.",
                details: {},
              },
            };
            return;

          case "status_invalido":
            return ctx.badRequest(
              "Somente reservas não iniciadas podem ser editadas."
            );

          case "vistoria_existente":
            return ctx.badRequest(
              "A reserva já possui vistoria de retirada."
            );

          case "veiculo_invalido":
            return ctx.badRequest(
              "O veículo original não foi encontrado."
            );

          case "veiculo_indisponivel":
            return ctx.badRequest(
              "O veículo está indisponível ou em manutenção."
            );

          case "conflito":
            return ctx.badRequest(
              "Veículo já está agendado nesta data e período."
            );
        }

        ctx.body = {
          data: resultado.data,
          message: "Reserva atualizada com sucesso.",
        };
      } catch (error: any) {
        const mensagem = String(error?.message ?? "");
        const codigo = String(error?.code ?? "");

        if (
          codigo.includes("SQLITE_BUSY") ||
          mensagem.includes("SQLITE_BUSY") ||
          mensagem.includes("database is locked")
        ) {
          return ctx.serviceUnavailable(
            "Outra operação está em andamento. Tente novamente."
          );
        }

        strapi.log.error("Erro ao editar reserva:", error);

        return ctx.internalServerError(
          "Não foi possível editar a reserva."
        );
      }
    },

    // =========================================
    // CANCELAR RESERVA
    // =========================================
    async cancelar(ctx) {
      const usuario = ctx.state.user;
      const { documentId } = ctx.params;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      const dados = ctx.request.body?.data ?? {};

      if (
        typeof dados !== "object" ||
        dados === null ||
        Array.isArray(dados)
      ) {
        return ctx.badRequest("Dados de cancelamento inválidos.");
      }

      const justificativa = dados.justificativa_cancelamento;

      if (
        justificativa !== undefined &&
        justificativa !== null &&
        typeof justificativa !== "string"
      ) {
        return ctx.badRequest("Justificativa inválida.");
      }

      if (
        typeof justificativa === "string" &&
        justificativa.length > 2000
      ) {
        return ctx.badRequest(
          "A justificativa deve ter no máximo 2000 caracteres."
        );
      }

      try {
        const resultado = await strapi.db.transaction(
          async ({ trx }) => {
            const registro = await strapi.db
              .query("api::agendamento.agendamento")
              .findOne({
                where: { documentId },
              });

            if (!registro) {
              return { tipo: "nao_encontrado" };
            }

            // Bloqueia alterações concorrentes no SQLite.
            await trx("agendamentos")
              .where({ id: registro.id })
              .update({ id: trx.ref("id") });

            const agendamento = await strapi.documents(
              "api::agendamento.agendamento"
            ).findOne({
              documentId,
              populate: ["solicitante", "imagens_retirada"],
            });

            if (!agendamento) {
              return { tipo: "nao_encontrado" };
            }

            if (agendamento.solicitante?.id !== usuario.id) {
              return { tipo: "proibido" };
            }

            if (agendamento.status_agendamento !== "reservado") {
              return { tipo: "status_invalido" };
            }

            if ((agendamento.imagens_retirada?.length ?? 0) > 0) {
              return { tipo: "vistoria_existente" };
            }

            const atualizado = await strapi.documents(
              "api::agendamento.agendamento"
            ).update({
              documentId,
              data: {
                status_agendamento: "cancelado",
                justificativa_cancelamento:
                  typeof justificativa === "string"
                    ? justificativa.trim()
                    : "",
                data_cancelamento: new Date().toISOString(),
                cancelado_por: usuario.id,
              },
            });

            return { tipo: "sucesso", data: atualizado };
          }
        );

        if (resultado.tipo === "nao_encontrado") {
          return ctx.notFound("Reserva não encontrada.");
        }

        if (resultado.tipo === "proibido") {
          return ctx.forbidden(
            "Você não pode cancelar esta reserva."
          );
        }

        if (resultado.tipo === "status_invalido") {
          return ctx.badRequest(
            "Somente reservas não iniciadas podem ser canceladas."
          );
        }

        if (resultado.tipo === "vistoria_existente") {
          return ctx.badRequest(
            "Esta reserva já possui fotografias de retirada."
          );
        }

        ctx.body = {
          data: resultado.data,
          message: "Reserva cancelada com sucesso.",
        };
      } catch (error: any) {
        const mensagem = String(error?.message ?? "");
        const codigo = String(error?.code ?? "");

        if (
          codigo.includes("SQLITE_BUSY") ||
          mensagem.includes("SQLITE_BUSY") ||
          mensagem.includes("database is locked")
        ) {
          return ctx.serviceUnavailable(
            "Outra operação está em andamento. Tente novamente."
          );
        }

        strapi.log.error("Erro ao cancelar reserva:", error);

        return ctx.internalServerError(
          "Não foi possível cancelar a reserva."
        );
      }
    },


    // =========================================
    // LISTAR AGENDAMENTOS DO MOTORISTA
    // =========================================

    async meus(ctx) {
      const usuario = ctx.state.user;
      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      try {
        const agendamentos = await strapi.documents(
          "api::agendamento.agendamento"
        ).findMany({
          filters: {
            solicitante: {
              id: {
                $eq: usuario.id,
              },
            },
          },
          populate: {
            veiculo: {
              fields: ["documentId", "nome", "placa"],
            },
          },
          sort: ["data_agendada:desc", "hora_chegada:desc" ],
          limit: 100,
        });
        ctx.body = { 
          data: agendamentos,
        };
      } catch (error) {
        strapi.log.error (
          "Erro ao listar agendamento do motorista: ",
          error
        );
        return ctx.internalServerError(
          "não foi possivel carregar suas reservas."
        );

      } 
    },

    // =========================================
    // CRIAR AGENDAMENTO
    // =========================================
    async create(ctx) {
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      const body = ctx.request.body as {
        data?: Record<string, any>;
      };

      const dados = body?.data;

      if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
      ) {
        return ctx.badRequest("Dados do agendamento inválidos.");
      }

      const {
        veiculo,
        destino,
        finalidade,
        data_agendada,
        quilometragem_inicial,
        hora_inicio,
        data_fim_prevista, 
        hora_fim,
        numero_cnh,
        validade_cnh,
      } = dados;

      // =========================================
      // VALIDAR IDENTIFICADOR DO VEÍCULO
      // =========================================
      if (
        !(
          (typeof veiculo === "number" &&
            Number.isInteger(veiculo) &&
            veiculo > 0) ||
          (typeof veiculo === "string" &&
            veiculo.trim().length > 0)
        )
      ) {
        return ctx.badRequest(
          "Veículo inválido ou não informado."
        );
      }

      // =========================================
      // VALIDAR CNH
      // =========================================
      if (
        typeof numero_cnh !== "string" ||
        !numero_cnh.trim() ||
        typeof validade_cnh !== "string" ||
        !validade_cnh.trim()
      ) {
        return ctx.badRequest(
          "Número e validade da CNH são obrigatórios."
        );
      }

      // Verificar se a data existe no formato AAAA-MM-DD
      const dataValida = (valor: string): boolean => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          return false;
        }

        const data = new Date(`${valor}T00:00:00Z`);

        return (
          !Number.isNaN(data.getTime()) &&
          data.toISOString().slice(0, 10) === valor
        );
      };

      // Validar data agendada e validade da CNH
      if (
        typeof data_agendada !== "string" ||
        !dataValida(data_agendada) ||
        !dataValida(validade_cnh)
      ) {
        return ctx.badRequest(
          "Data agendada ou validade da CNH inválida."
        );
      }

      // Bloquear CNH vencida na data da viagem
      if (validade_cnh < data_agendada) {
        return ctx.badRequest(
          "CNH vencida para a data agendada. Reserva não permitida."
        );
      }

      // =========================================
      // VALIDAR HORÁRIOS
      // =========================================
      const horarioValido = (
        valor: unknown
      ): valor is string => {
        return (
          typeof valor === "string" &&
          /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(valor)
        );
      };

      if (
        !horarioValido(hora_inicio) ||
        !horarioValido(hora_fim)
      ) {
        return ctx.badRequest(
          "Horários inválidos. Informe horários entre 00:00 e 23:59 no formato HH:mm."
        );
      }

      // Padronizar horários para HH:mm:ss
      const inicioNormalizado =
        hora_inicio.length === 5
          ? `${hora_inicio}:00`
          : hora_inicio;

      const fimNormalizado =
        hora_fim.length === 5
          ? `${hora_fim}:00`
          : hora_fim;

      // =========================================
      // VALIDAR DATA PREVISTA DE DEVOLUÇÃO
      // =========================================
      if (
        typeof data_fim_prevista !== "string" ||
        !dataValida(data_fim_prevista)
      ) {
        return ctx.badRequest(
          "Informe uma data prevista de término válida."
        );
      }

      if (data_fim_prevista < data_agendada) {
        return ctx.badRequest(
          "A data prevista de término não pode ser anterior à data de início."
        );
      }

      const inicioReserva =
        `${data_agendada}T${inicioNormalizado}`;

      const fimReserva =
        `${data_fim_prevista}T${fimNormalizado}`;

      if (fimReserva <= inicioReserva) {
        return ctx.badRequest(
          "O término da reserva deve ser posterior ao início."
        );
      }
      if (
        !Number.isSafeInteger(quilometragem_inicial) ||
        quilometragem_inicial < 0
      ) {
        return ctx.badRequest(
          "Informe uma quilometragem inicial válida."
        );
      }

      // =========================================
      // VALIDAR PERÍODO FUTURO DA RESERVA
      // =========================================

      // Horário local da operação (Brasil)

      const agora = new Date();

      const dataHoraBrasil = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).format(agora).replace(" ", "T");

      // Bloquear inicio no passado
      if (inicioReserva <= dataHoraBrasil) {
        return ctx.badRequest(
          "A data e horário de inicio devem ser futuros."
        );
      }
      // CNH deve estar até o termino da reserva
      if ( validade_cnh < data_fim_prevista) {
        return ctx.badRequest(
          "A CNH deve estar válida até a data prevista de devolução."
        );
      }

      // =========================================
      // LOCALIZAR VEÍCULO
      // =========================================
      const filtroVeiculo =
        typeof veiculo === "number"
          ? { id: veiculo }
          : { documentId: veiculo.trim() };

      try {
        // =========================================
        // TRANSAÇÃO DE AGENDAMENTO
        // =========================================

        const agendamento = await strapi.db.transaction(
          async ({ trx }) => {

            // Adquirir o bloqueio de escrita do SQLite
            // antes de consultar reservas existentes.
            //
            // O UPDATE não altera o ID do veículo.
            // Sua finalidade é adquirir o bloqueio.
            const linhasBloqueadas = await trx("veiculos")
              .where({ id: (
                await strapi.db
                  .query("api::veiculo.veiculo")
                  .findOne({ where: filtroVeiculo })
              )?.id ?? -1 })
              .update({ id: trx.ref("id") });

            if (linhasBloqueadas !== 1) {
              throw new Error(
                "Veículo não encontrado para reserva."
              );
            }

            // Após adquirir o bloqueio, localizar
            // novamente o veículo dentro da transação.
            const veiculoEncontrado = await strapi.db
              .query("api::veiculo.veiculo")
              .findOne({
                where: filtroVeiculo,
              });

            if (!veiculoEncontrado) {
              throw new Error(
                "Veículo não encontrado."
              );
            }

            if (
              veiculoEncontrado.status_veiculo !==
              "disponivel"
            ) {
              throw new Error(
                "Veículo indisponível ou em manutenção."
              );
            }

            const veiculoId = veiculoEncontrado.id;

            // =========================================
            // VERIFICAR CONFLITOS DE AGENDAMENTO
            // =========================================
            const reservasExistentes: any[] = [];

            const tamanhoPagina = 100;
            let pagina = 1;

            while (true) {
              const lote = await strapi.documents(
                "api::agendamento.agendamento"
              ).findMany({
                filters: {
                  veiculo: {
                    id: {
                      $eq: veiculoId,
                    },
                  },
                  status_agendamento: {
                    $in: ["reservado", "em_uso"],
                  },
                },
                sort: [
                  "data_agendada:asc",
                  "hora_inicio:asc",
                  "id:asc",
                ],
                start: (pagina - 1) * tamanhoPagina,
                limit: tamanhoPagina,
              });

              reservasExistentes.push(...lote);

              if (lote.length < tamanhoPagina) {
                break;
              }

              pagina++;
            }

            // Montar o período da nova reserva
            const inicioNovo =
              `${data_agendada}T${inicioNormalizado}`;

            const fimNovo =
              `${data_fim_prevista}T${fimNormalizado}`;

            // Normalizar horários retornados pelo Strapi
            const normalizarHorario = (
              valor: string | Date
            ): string => {
              if (valor instanceof Date) {
                return valor.toISOString().slice(11, 19);
              }

              return valor.slice(0, 8);
            };

            const existeConflito = reservasExistentes.some(
              (reserva) => {
                if (
                  !reserva.data_agendada ||
                  !reserva.hora_inicio ||
                  !reserva.hora_fim
                ) {
                  return false;
                }

                // Compatibilidade com reservas antigas
                // sem data_fim_prevista.
                let dataFimExistente =
                  reserva.data_fim_prevista;

                const inicioAntigo =
                  normalizarHorario(
                    reserva.hora_inicio
                  );

                const fimAntigo =
                  normalizarHorario(
                    reserva.hora_fim
                  );

                if (!dataFimExistente) {
                  const dataCalculada = new Date(
                    `${reserva.data_agendada}T00:00:00Z`
                  );

                  if (fimAntigo < inicioAntigo) {
                    dataCalculada.setUTCDate(
                      dataCalculada.getUTCDate() + 1
                    );
                  }

                  dataFimExistente = dataCalculada
                    .toISOString()
                    .slice(0, 10);
                }

                const inicioExistente =
                  `${reserva.data_agendada}T${inicioAntigo}`;

                const fimExistente =
                  `${dataFimExistente}T${fimAntigo}`;

                return (
                  inicioNovo < fimExistente &&
                  fimNovo > inicioExistente
                );
              }
            );

            if (existeConflito) {
              throw new Error(
                "Veículo já está agendado nesta data e período."
              );
            }

            // =========================================
            // CRIAR AGENDAMENTO
            // =========================================
            const novoAgendamento = await strapi.documents(
              "api::agendamento.agendamento"
            ).create({
              data: {
                veiculo: veiculoEncontrado.documentId,
                destino,
                finalidade,
                data_agendada,
                hora_inicio: inicioNormalizado,
                quilometragem_inicial,
                data_fim_prevista,
                hora_fim: fimNormalizado,
                numero_cnh,
                validade_cnh,
                solicitante: usuario.id,
                status_agendamento: "reservado",
              },
            });

            return novoAgendamento;
          }
        );

        // A transação foi concluída com sucesso.
        ctx.body = {
          data: agendamento,
        };

      } catch (error: any) {
        const mensagem = String(error?.message ?? "" )
        const codigo = String(error?.code ?? "");

        //Banco temporariamente ocupado 
        if (
          codigo.includes("SQLITE_BUSY") ||
          mensagem.includes("SQLITE_BUSY") ||
          mensagem.includes("database is locked")
        ) {
          strapi.log.warn(
            "SQLite ocupado durante a criação do agendamento."
          );
          ctx.status = 503;
          ctx.body = {
            data: null,
            error: {
              status: 503,
              name: "ServiceUnavailableError",
              message: "O sistema está processando outra operação. Aguarde alguns segundos e tente novamente."
            },
        };
        return;
      }
      if ( mensagem === 
        "Veículo já está agendado nesta data e período."
      ) {
        return ctx.badRequest(mensagem)
      }
      // Demais Erros 

      strapi.log.error(
        "Erro ao criar agendamento", error
      );

      return ctx.badRequest(
        mensagem || "Não foi possível criar o agendamento"
      );
    }
    },

    // =========================================
    // VISTORIA DE RETIRADA
    // =========================================
    async vistoriaRetirada(ctx) {
      const usuario = ctx.state.user;
      const { documentId } = ctx.params;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      // Verificar se já existe vistoria em andamento
      if (vistoriasEmProcessamento.has(documentId)) {
        return ctx.conflict(
          "Já existe uma vistoria de retirada em processamento para esta reserva."
        );
      }

      // ATIVAR A TRAVA
      vistoriasEmProcessamento.add(documentId);

      try {
        const agendamento = await strapi
          .documents("api::agendamento.agendamento")
          .findOne({
            documentId,
            populate: {
              solicitante: true,
            },
          });

        if (!agendamento) {
          return ctx.notFound("Agendamento não encontrado.");
        }

        if (agendamento.solicitante?.id !== usuario.id) {
          return ctx.forbidden(
            "Você não tem permissão para realizar esta vistoria."
          );
        }

        if (agendamento.status_agendamento !== "reservado") {
          return ctx.badRequest(
            "A vistoria de retirada só pode ser realizada antes do início da utilização."
          );
        }

        // =========================================
        // VALIDAR FOTOGRAFIAS DA RETIRADA
        // =========================================

        const arquivosRecebidos = (ctx.request as any).files?.imagens_retirada;

        const imagens = arquivosRecebidos
          ? Array.isArray(arquivosRecebidos)
            ? arquivosRecebidos
            : [arquivosRecebidos]
          : [];

          const MAX_IMAGENS = 5;
          const MAX_TAMANHO = 5 * 1024 * 1024;

          const formatosPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
          ];
          if (imagens.length > MAX_IMAGENS) {
            return ctx.badRequest(
              "É permitido enviar no máximo 5 fotografias."
            );
          }
          for (const imagem of imagens) {
            const tipoArquivo = imagem.mimetype ?? imagem.type;

            strapi.log.info(
              `Vistoria: tipo recebido = ${tipoArquivo ?? "não identificado"}`
            );

            if (!formatosPermitidos.includes(tipoArquivo)) {
              return ctx.badRequest(
                "Formato inválido. Utilize JPG, PNG ou WebP."
              );
            }
            if (imagem.size > MAX_TAMANHO) {
              return ctx.badRequest(
                "Cada fotografia deve ter no máximo 5 MB."
              );
            }
          }

          // =========================================
          // IMPEDIR REENVIO DE FOTOGRAFIAS
          // =======================================

          if (imagens.length > 0 ) {
            const reservaComImagens = await strapi
              .documents("api::agendamento.agendamento")
              .findOne({
                documentId,
                populate: {
                  imagens_retirada: true,
                },
              });
              const imagensExistentes =  reservaComImagens?.imagens_retirada ?? [];

              if (imagensExistentes.length > 0 ) {
                return ctx.badRequest(
                  "esta reserva já possui fotografias de retirada. Não é permitido subistituilas."
                );
              }
          }

        // =========================================
        // ARMAZENAR FOTOGRAFIAS DA RETIRADA
        // =========================================

        if (imagens.length > 0) {
          const uploadService = strapi.plugin("upload").service("upload");

          const arquivosSalvos = await uploadService.upload({
            data:{
              refId: agendamento.id,
              ref: "api::agendamento.agendamento",
              field: "imagens_retirada",
            },
            files: imagens,
          });
          strapi.log.info(
            `Vistoria ${documentId}: ${arquivosSalvos.length} fotografia(as) enviada(as).`
          );
        }

        ctx.body = {
          data: {
            documentId,
            autorizado: true,
            mensagem: "Reserva validada para vistoria de retirada.",
          },
        };

      } catch (error: any) {
        const codigo = String(error?.code ?? "");
        const mensagem = String(error?.message ?? "");

        strapi.log.error(
          `Erro na vistoria ${documentId}: ${codigo} - ${mensagem}`
        );

        if (codigo === "EBUSY" || mensagem.includes("EBUSY")) {
          return ctx.internalServerError(
            "O processamento das fotografias encontrou um arquivo temporário bloqueado. Verifique as imagens já registradas antes de tentar novamente."
          );
        }

        return ctx.internalServerError(
          "Não foi possível concluir a vistoria de retirada."
        );
      } finally {
        // Limpar a trava de vistorias em processamento
        vistoriasEmProcessamento.delete(documentId);
      }
    },

    // =========================================
    // INICIAR AGENDAMENTO
    // =========================================
    async iniciar(ctx) {
      const { documentId } = ctx.params;
      const dados = ctx.request.body;
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized(
          "Usuário não autenticado."
        );
      }

      if (!documentId) {
        return ctx.badRequest(
          "Agendamento não informado."
        );
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .iniciarAgendamento(
            documentId,
            dados,
            usuario
          );

        ctx.body = {
          data: agendamento,
        };
        } catch (error: any) {
          const mensagem = String (
            error?.message ?? "Não foi possível criar um agendamento."
          );
          const codigo = String(error?.code ?? "");

          //Banco ocupado por outra operação simultânea 
          if (
            codigo.includes("SQLITE_BUSY") ||
            mensagem.includes("SQLITE_BUSY") ||
            mensagem.includes("database is locked")
          ) {
            strapi.log.warn(
              "SQLite ocupado durante o inicio dda utilização."
            );

            ctx.status = 503;

            ctx.body = {
              data: null,
              error: {
                status: 503,
                name: "ServiceUnavailableError",
                message:
                "O sistema está processando outra operação. Aguarde alguns segundos e tente novamente.",
              },
            };
            return;
          }
          return ctx.badRequest(mensagem);
        }
    },

    // =========================================
    // VISTORIA DE DEVOLUÇÃO
    // =========================================

    async vistoriaDevolucao(ctx) {
      const usuario = ctx.state.user;
      const { documentId } = ctx.params;

      if (!usuario) {
        return ctx.unauthorized("Usuário não autenticado.");
      }

      if (!documentId) {
        return ctx.badRequest("Agendamento não informado.");
      }

      // Trava exclusiva da vistoria de devolução.
      const chaveTrava = `devolucao:${documentId}`;

      if (vistoriasEmProcessamento.has(chaveTrava)) {
        return ctx.conflict(
          "Já existe uma vistoria de devolução em processamento."
        );
      }

      vistoriasEmProcessamento.add(chaveTrava);

      try {
        const agendamento = await strapi
          .documents("api::agendamento.agendamento")
          .findOne({
            documentId,
            populate: ["solicitante", "imagens_ocorrencia"],
          });

        if (!agendamento) {
          return ctx.notFound("Agendamento não encontrado.");
        }

        strapi.log.info(
            `[DEVOLUCAO] Proprietario=${agendamento.solicitante?.id}, Usuario=${usuario.id}`
        );

        if (agendamento.solicitante?.id !== usuario.id) {
          return ctx.forbidden(
            "Você não tem permissão para realizar esta vistoria."
          );
        }

        if (agendamento.status_agendamento !== "em_uso") {
          return ctx.badRequest(
            "A vistoria de devolução só pode ser realizada enquanto o veículo estiver em uso."
          );
        }

        // =========================================
        // VALIDAR IMAGENS
        // =========================================
        const arquivosRecebidos =
          (ctx.request as any).files?.imagens_ocorrencia;

        const imagens = arquivosRecebidos
          ? Array.isArray(arquivosRecebidos)
            ? arquivosRecebidos
            : [arquivosRecebidos]
          : [];

        const MAX_IMAGENS = 5;
        const MAX_TAMANHO = 5 * 1024 * 1024;

        const formatosPermitidos = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (imagens.length < 1 || imagens.length > MAX_IMAGENS) {
          return ctx.badRequest(
            "Envie de 1 a 5 imagens da devolução."
          );
        }

        for (const imagem of imagens) {
          const tipoArquivo = imagem.mimetype ?? imagem.type;

          if (!formatosPermitidos.includes(tipoArquivo)) {
            return ctx.badRequest(
              "Formato inválido. Utilize JPG, PNG ou WebP."
            );
          }

          if (
            !Number.isFinite(imagem.size) ||
            imagem.size <= 0 ||
            imagem.size > MAX_TAMANHO
          ) {
            return ctx.badRequest(
              "Cada imagem deve ter no máximo 5 MB e não pode estar vazia."
            );
          }
        }

        // Impedir substituição das imagens já registradas.
        const imagensExistentes =
          agendamento.imagens_ocorrencia ?? [];

        if (imagensExistentes.length > 0) {
          return ctx.badRequest(
            "Esta reserva já possui imagens de devolução registradas."
          );
        }

        // =========================================
        // ARMAZENAR IMAGENS
        // =========================================
        const uploadService = strapi
          .plugin("upload")
          .service("upload");

        strapi.log.info(
            `[DEVOLUCAO] Iniciando upload de ${imagens.length} imagem(ns).`
        );

        const arquivosSalvos = await uploadService.upload({
          data: {
            refId: agendamento.id,
            ref: "api::agendamento.agendamento",
            field: "imagens_ocorrencia",
          },
          files: imagens,
        });

        strapi.log.info(
          `Devolução ${documentId}: ${arquivosSalvos.length} imagem(ns) registrada(s).`
        );

        ctx.body = {
          data: {
            documentId,
            imagensRegistradas: arquivosSalvos.length,
            mensagem:
              "Imagens da devolução registradas com sucesso. A utilização ainda não foi finalizada.",
          },
        };
      } catch (error: any) {
        const codigo = String(error?.code ?? "");
        const mensagem = String(error?.message ?? "");

        strapi.log.error(
          `Erro na vistoria de devolução ${documentId}: ${codigo} - ${mensagem}`
        );

        if (
          codigo === "EBUSY" ||
          codigo === "EPERM" ||
          mensagem.includes("EBUSY") ||
          mensagem.includes("EPERM")
        ) {
          return ctx.internalServerError(
            "O processamento das imagens encontrou um arquivo temporário bloqueado. Verifique os arquivos registrados antes de tentar novamente."
          );
        }

        return ctx.internalServerError(
          "Não foi possível registrar as imagens da devolução."
        );
      } finally {
        vistoriasEmProcessamento.delete(chaveTrava);
      }
    },

    // =========================================
    // FINALIZAR AGENDAMENTO
    // =========================================
    async finalizar(ctx) {
      const { documentId } = ctx.params;
      const dados = ctx.request.body;
      const usuario = ctx.state.user;

      if (!usuario) {
        return ctx.unauthorized(
          "Usuário não autenticado."
        );
      }

      if (!documentId) {
        return ctx.badRequest(
          "Agendamento não informado."
        );
      }

      try {
        const agendamento = await strapi
          .service("api::agendamento.agendamento")
          .finalizarAgendamento(
            documentId,
            dados,
            usuario
          );

        ctx.body = {
          data: agendamento,
        };
      } catch (error: any) {
        return ctx.badRequest(error.message);
      }
    },

  })
);
