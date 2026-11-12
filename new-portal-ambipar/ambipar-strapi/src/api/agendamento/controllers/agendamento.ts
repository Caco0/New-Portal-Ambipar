/**
 * agendamento controller
 */

import { factories } from "@strapi/strapi";
import agendamento from "../routes/agendamento";

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

      } catch (error) {
        strapi.log.error(
          "Erro ao validar vistoria de retirada:",
          error
        );

        return ctx.internalServerError(
          "Não foi possível validar a vistoria de retirada."
        );
      } finally {
        // Liberara a trava mesmo se ocorrer um erro
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
