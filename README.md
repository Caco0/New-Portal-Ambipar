# 🌱 EcoConnect — Portal Web Corporativo Sustentável

Portal corporativo interno desenvolvido para centralizar **informações, processos, serviços e ferramentas utilizadas no ambiente corporativo**, oferecendo uma interface única para acesso aos recursos da empresa.

O projeto utiliza uma arquitetura desacoplada, com **React + Vite no frontend** e **Strapi 5 no backend**, permitindo que conteúdos e módulos sejam administrados sem necessidade de alterações constantes no código da interface.

---

# 🧭 Visão Geral

O EcoConnect funciona como uma **intranet corporativa**, reunindo em um único ambiente:

- 🏠 Página inicial institucional
- 🔗 Acessos rápidos aos sistemas corporativos
- ⚙️ Workflows e documentação de processos
- 📰 Notícias internas
- 📅 Agendamento de salas de reunião
- 🎫 Acesso ao sistema de chamados de TI
- 🚗 Gestão e agendamento de veículos da frota
- 🌙 Tema claro e escuro
- 🔐 Recursos autenticados para módulos restritos

O portal foi desenvolvido de forma modular para permitir a inclusão progressiva de novos serviços.

---

# 🏗️ Arquitetura

```text
                       🌱 EcoConnect
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React 19 + Vite   │
                 │      Frontend       │
                 └──────────┬──────────┘
                            │
                         REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │     Strapi 5.31     │
                 │       Backend       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │       SQLite        │
                 │                     │
                 │ PostgreSQL previsto │
                 └─────────────────────┘
```

O frontend e o backend são aplicações independentes.

O **React** é responsável pela experiência do usuário, enquanto o **Strapi** concentra conteúdo, dados, autenticação, relacionamentos e regras de negócio dos módulos dinâmicos.

---

# 🛠️ Tecnologias e Ferramentas

## 🎨 Frontend

| Tecnologia | Utilização |
|---|---|
| React 19 | Construção da interface |
| Vite 5 | Build e ambiente de desenvolvimento |
| React Router | Navegação e gerenciamento de rotas |
| Tailwind CSS | Estilização da interface |
| Axios | Comunicação com a API |
| Framer Motion | Animações |
| Lucide React | Biblioteca de ícones |
| Styled Components | Componentes estilizados |
| React Scroll | Navegação e rolagem |
| Strapi Blocks Renderer | Renderização de conteúdo Rich Text |
| ESLint | Padronização e análise do código |

## ⚙️ Backend

| Tecnologia | Utilização |
|---|---|
| Strapi 5.31 | CMS e API REST |
| Node.js | Ambiente de execução |
| TypeScript | Desenvolvimento do backend |
| Users & Permissions | Autenticação e autorização |
| Document Service API | Manipulação de documentos no Strapi 5 |
| Upload Plugin | Gerenciamento de mídias |
| SQLite | Banco de dados atual |
| PostgreSQL | Banco planejado para evolução da infraestrutura |

## 🖥️ Infraestrutura

- Windows
- Apache / XAMPP
- Git
- GitHub
- npm
- API REST
- Ambiente separado de desenvolvimento e produção

---

# 📁 Estrutura do Projeto

```text
New-Portal-Ambipar/
│
├── README.md
│
└── new-portal-ambipar/
    │
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── data/
    │   ├── pages/
    │   │   ├── Noticias/
    │   │   ├── Veiculos/
    │   │   └── Workflow/
    │   │
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    │
    └── ambipar-strapi/
        │
        └── src/
            ├── api/
            │   ├── agendamento/
            │   ├── card-detalhe/
            │   ├── card-list/
            │   ├── noticia/
            │   ├── veiculo/
            │   └── workflow-api/
            │
            └── policies/
```

---

# 🧩 Módulos do Sistema

## 🏠 Home

Página principal do portal e ponto central de acesso aos recursos disponíveis.

A Home concentra componentes e atalhos para os principais serviços da intranet.

---

## 🔗 Acessos Rápidos

Área destinada aos principais sistemas e recursos utilizados pelos colaboradores.

O portal possui grupos específicos de acesso para diferentes áreas, incluindo:

- Tecnologia da Informação
- Logística
- Financeiro
- Sistemas e serviços corporativos

---

## ⚙️ Workflow de Processos

Módulo dinâmico para organização e consulta de processos corporativos.

O conteúdo é administrado pelo Strapi e apresentado dinamicamente no frontend.

### Content-types

```text
workflow-api
      │
      ▼
 card-list
      │
      ▼
card-detalhe
```

Essa estrutura permite organizar processos em diferentes níveis, mantendo as informações centralizadas no CMS.

### Principais endpoints

```http
GET /api/workflow-apis
GET /api/workflow-apis/:id

GET /api/card-lists
GET /api/card-lists/:id

GET /api/card-detalhes
GET /api/card-detalhes/:id
```

O módulo também suporta conteúdo estruturado e documentos associados aos processos.

---

# 📰 Notícias

Módulo utilizado para publicação de notícias e comunicados internos.

### Content-type

```text
noticia
```

### Principais endpoints

```http
GET /api/noticias
GET /api/noticias/:id
```

O frontend possui páginas específicas para:

```text
/noticias
/noticias/:slug
```

permitindo listagem e visualização individual das publicações.

---

# 📅 Salas de Reunião

Integração destinada ao agendamento de salas de reunião.

O portal utiliza **Cal.com** para gerenciamento das reservas, permitindo que os colaboradores realizem os agendamentos diretamente pela intranet.

---

# 🎫 Chamados de TI

Área destinada ao acesso e acompanhamento dos recursos relacionados ao atendimento de Tecnologia da Informação.

O módulo integra o portal ao fluxo utilizado para abertura e acompanhamento dos chamados internos.

---

# 🚗 Gestão de Veículos

> 🚧 **Módulo atualmente em desenvolvimento**

O módulo de veículos está sendo desenvolvido para controlar a utilização da frota corporativa diretamente pelo portal.

A arquitetura utiliza dois principais Content-types:

```text
veiculo
   │
   │ 1:N
   ▼
agendamento
```

Cada veículo pode possuir vários agendamentos, enquanto cada agendamento pertence a um veículo específico.

---

## 🚙 Cadastro de Veículos

O cadastro permite armazenar informações como:

- Nome
- Placa
- Categoria
- Imagem
- Quilometragem
- Observações
- Situação operacional do veículo

### Status do veículo

```text
disponivel
manutencao
indisponivel
```

O campo utilizado no backend é:

```text
status_veiculo
```

A disponibilidade operacional do veículo é mantida separada do estado de cada agendamento.

---

# 📆 Agendamentos de Veículos

Os agendamentos possuem relacionamento com:

```text
Veículo
   +
Usuário autenticado
```

O usuário responsável pelo agendamento é registrado através do **Users & Permissions** do Strapi.

### Estados do agendamento

```text
reservado
    │
    ▼
 em_uso
    │
    ▼
concluido
```

O campo responsável pelo controle é:

```text
status_agendamento
```

---

# 🔐 Segurança do módulo de Veículos

O módulo utiliza autenticação baseada em **JWT** através do Strapi Users & Permissions.

A identidade do usuário é obtida pelo backend através da sessão autenticada:

```text
JWT
 │
 ▼
ctx.state.user
 │
 ▼
Usuário autenticado
```

O backend não depende apenas das informações enviadas pelo frontend para determinar quem está executando determinadas operações.

---

## 🔑 Autorização por proprietário

O início de uma viagem possui validação de propriedade.

```text
Usuário autenticado
        │
        ▼
Agendamento solicitado
        │
        ▼
solicitante.id == usuario.id ?
        │
      ┌─┴─┐
      │   │
     SIM  NÃO
      │   │
      ▼   ▼
 permite bloqueia
```

Isso impede que um usuário autenticado inicie uma reserva pertencente a outro colaborador.

---

# 🚦 Endpoint de início da viagem

Endpoint customizado:

```http
POST /api/agendamentos/:documentId/iniciar
```

Atualmente o fluxo executa as seguintes verificações:

```text
Requisição
    │
    ▼
Usuário autenticado?
    │
    ▼
documentId informado?
    │
    ▼
Agendamento existe?
    │
    ▼
Usuário é o solicitante?
    │
    ▼
Status é "reservado"?
    │
    ▼
Operação autorizada
```

### Estado atual

| Funcionalidade | Situação |
|---|:---:|
| Autenticação JWT | ✅ |
| Integração Users & Permissions | ✅ |
| Uso de `documentId` | ✅ |
| Document Service API | ✅ |
| Validação de existência | ✅ |
| Validação do proprietário | ✅ |
| Validação do status `reservado` | ✅ |
| Bloqueio de outro usuário | ✅ |
| Alteração `reservado → em_uso` | 🚧 |
| Registro da saída | 🚧 |
| Finalização da viagem | 📋 |
| Relatório de utilização | 📋 |

---

# 🪪 Informações da viagem

A estrutura do agendamento já prevê informações relacionadas à utilização do veículo, incluindo:

### Reserva

- Veículo
- Solicitante
- Destino
- Finalidade
- Data agendada
- Hora inicial
- Hora final
- Número da CNH
- Validade da CNH

### Saída

- Quilometragem inicial
- Nível de combustível
- Data real de início
- Hora real de início

### Retorno

- Quilometragem final
- Nível de combustível na chegada
- Data de retorno
- Hora de chegada
- Ocorrências
- Imagens de ocorrências

---

# 🛡️ Validações planejadas

O desenvolvimento do módulo de veículos continuará incluindo regras como:

```text
CNH válida
      │
      ▼
Veículo disponível
      │
      ▼
Horário disponível
      │
      ▼
Reserva
      │
      ▼
Início da viagem
      │
      ▼
Retorno
      │
      ▼
Conclusão
```

Também estão previstas validações contra conflitos de horários entre reservas do mesmo veículo.

---

# 👥 Usuários

Os usuários do Portal utilizam o sistema de autenticação fornecido pelo:

```text
Strapi Users & Permissions
```

Os usuários da aplicação são independentes dos usuários administrativos utilizados para acessar o painel `/admin` do Strapi.

Essa separação permite manter diferentes níveis de acesso entre:

```text
Administradores do CMS
        │
        └── Administração do Strapi

Usuários do Portal
        │
        └── Utilização dos módulos corporativos
```

---

# 🔌 API REST

O frontend consome os dados do Strapi através de uma API REST.

Exemplo simplificado:

```text
React
  │
  │ Axios
  ▼
Strapi REST API
  │
  ▼
Content-types
  │
  ▼
SQLite
```

Os serviços responsáveis pela comunicação com o backend ficam concentrados principalmente em:

```text
src/services/
```

---

# 🌍 Ambientes

O projeto possui separação entre desenvolvimento e produção.

## 🧪 Desenvolvimento

```text
Frontend
http://localhost:5174

Strapi
http://localhost:1338
```

Utilizado para desenvolvimento, testes e validação de novas funcionalidades.

## 🏭 Produção

```text
Portal
http://10.0.0.199/Portal/

Strapi
http://10.0.0.199:1337
```

O frontend de produção é compilado pelo Vite e disponibilizado pelo Apache.

---

# ▶️ Executando o Projeto

## Frontend

Acesse:

```bash
cd new-portal-ambipar
```

Instale as dependências:

```bash
npm install
```

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

---

## Backend

Acesse:

```bash
cd new-portal-ambipar/ambipar-strapi
```

Instale as dependências:

```bash
npm install
```

Execute o Strapi:

```bash
npm run develop
```

---

# 🏗️ Build

## Frontend

```bash
npm run build
```

O Vite gera a versão otimizada da aplicação para publicação no ambiente Apache.

## Backend / Strapi Admin

```bash
npm run build
```

Gera o build do painel administrativo do Strapi.

---

# 🔐 Segurança

O projeto utiliza diferentes estratégias de segurança de acordo com cada módulo.

Entre elas:

- Strapi Users & Permissions
- Autenticação JWT
- Controle de rotas
- Roles de usuários
- Validação de propriedade de recursos
- Regras de negócio no backend
- Separação entre usuários administrativos e usuários do Portal

> Credenciais, tokens JWT, senhas e outras informações sensíveis não devem ser armazenados nesta documentação.

---

# 🗺️ Roadmap

## 🚗 Gestão de Veículos

```text
[x] Cadastro de veículos
[x] Estrutura de agendamentos
[x] Autenticação
[x] Validação de proprietário
[x] Validação de status
[ ] Iniciar utilização do veículo
[ ] Registrar quilometragem de saída
[ ] Registrar horário real de saída
[ ] Validar CNH
[ ] Detectar conflitos de agendamento
[ ] Finalizar utilização
[ ] Registrar quilometragem final
[ ] Registrar combustível de retorno
[ ] Registrar ocorrências
[ ] Anexar imagens de ocorrências
[ ] Relatório de utilização
```

## ⏱️ Horas Extras

Módulo previsto para gerenciamento de solicitações de horas extras.

Fluxo planejado:

```text
Colaborador
     │
     ▼
Solicitação
     │
     ▼
Gestor responsável
     │
  ┌──┴───┐
  ▼      ▼
Aprova  Rejeita
  │
  ▼
Histórico / Relatórios
```

O módulo deverá possuir fluxo de aprovação, notificações e relatórios.

## 🗄️ Banco de Dados

```text
SQLite
   │
   ▼
PostgreSQL
```

A migração para PostgreSQL está prevista como evolução da infraestrutura do backend.

---

# 🌱 Evolução do Projeto

O EcoConnect foi estruturado para crescer de maneira modular.

Novas funcionalidades podem ser incorporadas ao Portal mantendo a separação entre:

```text
Interface
    │
    ▼
Serviços
    │
    ▼
API
    │
    ▼
Regras de negócio
    │
    ▼
Dados
```

Essa arquitetura permite que o portal evolua gradualmente sem concentrar todas as responsabilidades em uma única camada.

---

# 👨‍💻 Autor

**Rafael Fortunato Dametto**

Estudante de **Tecnologia em Inteligência Artificial Aplicada — PUCPR**

Desenvolvedor Full Stack com foco em desenvolvimento web, automação, integração de sistemas e Inteligência Artificial.

📎 [LinkedIn](https://www.linkedin.com/in/rafael-fortunato-dametto)  
💻 [GitHub](https://github.com/Caco0)

---

# 🪴 Licença

Este projeto é licenciado sob a **MIT License**.

Consulte o arquivo de licença do projeto para mais informações.

---

### 🌱 EcoConnect

**Tecnologia conectando pessoas, processos e informação.**