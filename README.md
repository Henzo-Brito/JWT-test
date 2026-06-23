<div align="center">

# SaintScale

**Gerenciador de Escalas para Igrejas**

[![Bun](https://img.shields.io/badge/Bun-1.x-black?logo=bun)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-4.x-orange?logo=hono)](https://hono.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose)

</div>

---

## Visão Geral

SaintScale é uma aplicação fullstack para gerenciamento de escalas de igrejas. O projeto é estruturado como **monorepo** e roda inteiramente via **Docker Compose** com um único comando.

---

## Tecnologias

### Back-end (`/back`)
| Tecnologia | Descrição |
|------------|-----------|
| [Bun](https://bun.sh) | Runtime e gerenciador de pacotes |
| [Hono](https://hono.dev) | Framework web leve e rápido |
| [Drizzle ORM](https://orm.drizzle.team) | ORM type-safe para PostgreSQL |
| [Zod](https://zod.dev) | Validação de schemas |
| [Jose](https://github.com/panva/jose) | Geração e verificação de JWT |
| [Scalar](https://scalar.com) | Documentação interativa da API (OpenAPI) |

### Front-end (`/saint-scale`)
| Tecnologia | Descrição |
|------------|-----------|
| HTML / CSS / JavaScript | Interface estática sem frameworks |
| [Nginx](https://nginx.org) | Servidor para os arquivos estáticos |
| [Bootstrap Icons](https://icons.getbootstrap.com) | Ícones via CDN |

### Infraestrutura
| Tecnologia | Descrição |
|------------|-----------|
| [Docker](https://docker.com) | Containerização dos serviços |
| [Docker Compose](https://docs.docker.com/compose) | Orquestração dos containers |
| [PostgreSQL 16](https://www.postgresql.org) | Banco de dados relacional |

---

## Estrutura do Projeto

```
JWT/
├── back/                        # API REST
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts         # Conexão com o banco (Drizzle)
│   │   │   └── schema.ts        # Tabelas: users, refresh_tokens
│   │   ├── lib/
│   │   │   ├── create-app.ts    # Factory da aplicação Hono
│   │   │   ├── app.documentation.ts  # Scalar / OpenAPI
│   │   │   └── jwt.ts           # Sign e verify de tokens
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   ├── api.ts           # Agrega todas as rotas
│   │   │   ├── auth/            # Register, Login, Refresh, Logout, Me
│   │   │   └── music/           # Rota protegida de exemplo
│   │   ├── app.ts
│   │   ├── index.ts
│   │   └── migrate.ts
│   ├── drizzle/                 # Migrations geradas
│   ├── Dockerfile
│   ├── entrypoint.sh            # Roda db:push e inicia o servidor
│   └── package.json
│
├── saint-scale/                 # Front-end estático
│   ├── index.html
│   ├── login.html
│   ├── cadastro.html
│   ├── config.js                # URL base da API (altere aqui)
│   ├── style.css
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml           # Orquestra db + api + front
├── .env.example                 # Variáveis necessárias
└── README.md
```

---

## Endpoints da API

Base URL: `http://localhost:3000/api`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/register` | Cria um novo usuário | ❌ |
| `POST` | `/auth/login` | Autentica e retorna `accessToken` | ❌ |
| `GET` | `/auth/me` | Retorna dados do usuário logado | ✅ Bearer |
| `POST` | `/auth/refresh` | Renova o `accessToken` | ❌ |
| `POST` | `/auth/logout` | Invalida o `refreshToken` | ❌ |
| `GET` | `/music/music` | Exemplo de rota protegida | ✅ Bearer |

> Documentação interativa disponível em `http://localhost:3000/scalar`

---

## Como Rodar

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install) instalado

### 1. Clone o repositório

```bash
git clone https://github.com/Henzo-Brito/JWT-test.git
cd JWT-test
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina uma chave secreta forte para o JWT:

```env
JWT_SIGNATURE=sua_chave_secreta_aqui
```

### 3. Suba a aplicação

```bash
docker compose up --build
```

Na primeira execução, o Docker irá:
1. Baixar as imagens base (`bun`, `nginx`, `postgres`)
2. Instalar as dependências da API
3. Criar as tabelas no banco automaticamente via `db:push`
4. Iniciar os 3 serviços

### 4. Acesse

| Serviço | URL |
|---------|-----|
| **Front-end** | http://localhost:8080 |
| **API** | http://localhost:3000 |
| **Docs (Scalar)** | http://localhost:3000/scalar |

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `JWT_SIGNATURE` | Chave secreta para assinar os tokens JWT | `changeme_in_production` |

> `DATABASE_URL` é configurado automaticamente pelo Docker Compose e não precisa ser definido manualmente.

---

## Comandos Úteis

```bash
# Subir em background
docker compose up -d --build

# Ver logs de um serviço específico
docker compose logs api -f
docker compose logs front -f
docker compose logs db -f

# Parar tudo
docker compose down

# Parar e remover os volumes (apaga o banco)
docker compose down -v
```
