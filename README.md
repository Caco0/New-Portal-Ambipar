# 🌱 EcoConnect — Portal Web Corporativo Sustentável

> **"Juntos por um Planeta Mais Verde"**  
> Portal web corporativo desenvolvido com React + Vite, inspirado em redes sociais e voltado à sustentabilidade, integração de ferramentas internas e gestão de conteúdo via Strapi CMS.

---

## 📘 **Visão Geral do Projeto**

O **EcoConnect** é um portal corporativo voltado à comunicação interna, sustentabilidade e integração de ferramentas da empresa.  
Hospedado em **servidor Apache (intranet)**, ele oferece:

- 🧭 Navegação moderna com menu hamburguer  
- 🧱 Carrossel de links e ferramentas internas  
- 📊 Integração com **Trello** para exibir quadros e projetos  
- 🗓️ Sistema de agendamento de **Salas de Reunião** com calendário interativo  
- 📰 Seção de **Notícias e Comunicados Internos** (gerenciados via **Strapi**)  
- 🌗 Alternância entre **modo claro e escuro**  
- 🔒 Gestão de conteúdo sem necessidade de editar o código-fonte  

---

## 🧩 **Arquitetura do Sistema**

```
eco-connect/
│
├── frontend/            # Aplicação React (Vite)
│   ├── src/
│   │   ├── components/  # Componentes (Header, Carrossel, Cards, etc.)
│   │   ├── pages/       # Páginas principais (Home, Notícias, Agenda, etc.)
│   │   ├── hooks/       # Hooks personalizados (ex: modo escuro)
│   │   └── services/    # Consumo de APIs (Strapi, Trello)
│   └── public/
│
├── backend/             # Strapi CMS
│   ├── api/
│   │   ├── noticias/
│   │   ├── links/
│   │   └── salas/
│   └── config/
│
├── .env                 # Variáveis de ambiente
├── README.md
└── apache-config/       # Arquivos de configuração do servidor
```

---

## 🧰 **Tecnologias Utilizadas**

### **Frontend**
- ⚛️ React
- ⚡ Vite
- 🎨 TailwindCSS  
- 🧱 Shadcn/UI (componentes estilizados)
- 🔄 React Router DOM
- 🧭 React Slick (carrossel)
- 📅 React Big Calendar ou FullCalendar React
- 🌗 Alternância de tema (light/dark mode)
- 📡 Axios (requisições HTTP)

### **Backend / CMS**
- ⚙️ Strapi
- 🗃️ Banco de dados: SQLite (dev) ou PostgreSQL (produção)
- 🔐 Autenticação JWT nativa do Strapi
- 🌍 API REST/GraphQL

### **Integrações**
- 📋 Trello API
- 🗓️ Biblioteca de calendário para agendamentos

### **Infraestrutura**
- 🌐 Servidor Apache (intranet)
- 🧾 Configuração .htaccess para rotas SPA
- 🧩 Git + GitHub/GitLab (versionamento)
- 🧰 Node.js / npm (ambiente de desenvolvimento)

---

## 🚀 **Guia de Instalação**

### **1. Clonar o repositório**
```bash
git clone https://github.com/seuusuario/eco-connect.git
cd eco-connect
```

### **2. Instalar dependências do frontend**
```bash
cd frontend
npm install
```

### **3. Rodar o frontend (modo desenvolvimento)**
```bash
npm run dev
```
O portal estará disponível em [http://localhost:5173](http://localhost:5173)

### **4. Instalar e rodar o Strapi**
```bash
cd ../backend
npx create-strapi-app . --quickstart
```

### **5. Criar coleções no Strapi**
Acesse o painel do Strapi em [http://localhost:1337/admin](http://localhost:1337/admin)

Crie as seguintes coleções:
- **Notícias**: título, resumo, imagem, data, categoria  
- **Links**: nome, URL, descrição, ícone  
- **Salas de Reunião**: nome, horário, status  

---

## 🔗 **Integrações Planejadas**

### 🔹 Trello
- Exibir quadros internos com campanhas e projetos
- Endpoint base:
  ```
  https://api.trello.com/1/boards/{BOARD_ID}?key={API_KEY}&token={TOKEN}
  ```

### 🔹 Strapi
- Consumo via endpoints REST:
  ```
  GET /api/noticias
  GET /api/links
  GET /api/salas
  ```

---

## 🖥️ **Configuração no Servidor Apache**

### Arquivo `apache-config/ecoportal.conf`
```apache
<VirtualHost *:80>
    ServerName ecoportal.intranet
    DocumentRoot /var/www/ecoportal
    <Directory /var/www/ecoportal>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Arquivo `.htaccess`
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 🧪 **Testes e Qualidade**

- ✅ Testes de API com Postman / Insomnia  
- 📱 Verificação de responsividade (mobile, tablet, desktop)  
- ⚙️ Testes de performance e cache (Lighthouse / GTMetrix)  
- 🔒 Verificação de permissões e autenticação no Strapi  

---

## 📘 **Próximos Passos / Roadmap**

| Etapa | Status | Descrição |
|-------|---------|------------|
| Planejamento e mockups | ✅ | Baseado no croqui inicial |
| Criação do projeto React | 🔄 | Em desenvolvimento |
| Setup do Strapi CMS | 🔲 | A iniciar |
| Integração com Trello | 🔲 | Testar API interna |
| Implementar calendário | 🔲 | Componente FullCalendar |
| Deploy no Apache | 🔲 | Após build final |

---

## 💚 **Contribuições**

Sinta-se à vontade para contribuir, sugerir melhorias ou reportar bugs.  
Crie um **pull request** ou abra uma **issue**.

---

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
