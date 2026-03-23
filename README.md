# 🌱 EcoConnect — Portal Web Corporativo Sustentável

Sistema web interno (intranet) desenvolvido para centralizar
informações, processos e ferramentas corporativas.

------------------------------------------------------------------------

# 🧭 Visão Geral

## Arquitetura

Frontend (React + Vite) ↓ API REST (Strapi v5) ↓ Banco de Dados (SQLite
→ PostgreSQL futuro)

## Ambiente

-   🌐 Intranet: http://10.0.0.197/Portal/
-   ⚙️ Backend Strapi: http://10.0.0.197:1337
-   🧪 Desenvolvimento local:
    -   Frontend: http://localhost:5174
    -   Strapi: http://localhost:1338

------------------------------------------------------------------------

# 🧩 Módulos do Sistema

## 🏠 Home

-   Página inicial do portal
-   Não consome API diretamente

## 🔗 Acessos Rápidos

-   Links para sistemas internos/externos
-   Não consome API do Strapi

## ⚙️ Workflow Processos

Content-types: - workflow-api - card-list - card-detalhe

Endpoints: - GET /api/workflow-apis - GET /api/workflow-apis/:id - GET
/api/card-lists - GET /api/card-lists/:id - GET /api/card-detalhes - GET
/api/card-detalhes/:id

Permissões: - find - findOne

## 📰 Notícias

Content-type: - noticia

Endpoints: - GET /api/noticias - GET /api/noticias/:id

Permissões: - find - findOne

## 📅 Sala de Reuniões

-   Integração com Cal.com

## 🚗 Veículos (Em desenvolvimento)

-   veiculo
-   agendamento

------------------------------------------------------------------------

# 🔐 Segurança

Role Public: - workflow-api → find, findOne - card-list → find,
findOne - card-detalhe → find, findOne - noticia → find, findOne

------------------------------------------------------------------------

# 🌍 Ambientes

## Desenvolvimento

Frontend: http://localhost:5174 Strapi: http://localhost:1338

## Produção

Portal: http://10.0.0.197/Portal/ Strapi: http://10.0.0.197:1337

------------------------------------------------------------------------

# ▶️ Como Rodar

## Frontend

npm install npm run dev

## Backend

npm install npm run develop

------------------------------------------------------------------------


## 👨‍💻 **Autor**

**Rafael Fortunato Dametto**  
Estudante de **Tecnologia em Inteligência Artificial Aplicada** — PUCPR  
Desenvolvedor Full Stack apaixonado por IA, web e inovação.  

📎 [LinkedIn](https://www.linkedin.com/in/rafael-fortunato-dametto)  
💻 [GitHub](https://github.com/Caco0)

---

## 🪴 **Licença**

Este projeto é licenciado sob a **MIT License** — sinta-se livre para usar, modificar e distribuir.

---
