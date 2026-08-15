# Task Manager

Sistema de gerenciamento de tarefas em formato Kanban, com projetos, boards e tickets organizados por coluna (Backlog, Development, Progress, Done). Desenvolvido com **ASP.NET Core** seguindo os princípios de **Clean Architecture**, autenticação via **JWT** com renovação automática de token, e frontend em **HTML/CSS/JavaScript puro**.

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do projeto](#configuração-do-projeto)
- [Banco de dados](#banco-de-dados)
- [Executando o projeto](#executando-o-projeto)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões técnicas](#decisões-técnicas)
- [Melhorias futuras](#melhorias-futuras)

## Funcionalidades

- Autenticação de usuários via JWT
- Renovação automática de token durante o uso, sem exigir novo login
- Criação, edição e organização de **projetos**
- Boards Kanban por projeto, com colunas de status
- Criação, edição, exclusão e movimentação (drag and drop) de **tickets**
- Indicadores de progresso e contagem de tickets por coluna em cada projeto

## Arquitetura

O backend segue os princípios de **Clean Architecture**, com separação clara de responsabilidades entre camadas:

```
Task_Manager.API              → Controllers, Middlewares, configuração da aplicação (camada de apresentação)
Task_Manager.Application      → Interfaces, DTOs, regras de negócio e serviços
Task_Manager.Infrastructure   → Implementação de acesso a dados, repositórios, integrações externas
```

**Fluxo de dependência:** `API` depende de `Application`, que define as abstrações implementadas por `Infrastructure`. Nenhuma camada de negócio conhece detalhes de infraestrutura (como `HttpContext` ou acesso direto ao banco).

## Tecnologias

**Backend**
- ASP.NET Core (.NET 8+)
- Autenticação JWT (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- BCrypt.Net para hash de senhas
- SQL Server

**Frontend**
- HTML5, CSS3
- JavaScript (ES Modules), sem frameworks

## Pré-requisitos

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express ou completo)
- Um editor de código (recomendado: Visual Studio ou VS Code)

## Configuração do projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Victor-Pereira-Dev/Task-Manager
cd task-manager
```

### 2. Configurar segredos locais

O arquivo `appsettings.json` **não contém segredos reais** (a chave JWT vem vazia por padrão). Antes de rodar o projeto, configure a chave localmente.


Para gerar uma chave aleatória segura (mínimo 32 caracteres):

```bash
openssl rand -hex 32
```

Preencha na string vazia com a chave aleatória que você criou:

"Jwt": {
    "Key": "PREENCHA AQUI!!!",
    "Issuer": "TaskManager",
    "Audience": "TaskManagerUsers",
    "ExpirationMinutes": "60",
    "RenovarToken": "10"
  },

### 3. Configurar a connection string

No `appsettings.json`, ajuste conforme seu ambiente:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TaskManagerDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

## Banco de dados

Execute-os na ordem numérica, via SSMS ou Azure Data Studio:

| Ordem | Script ou Pasta | Descrição |
|---|---|---|
| 1 | `001_CriarTabelas.sql` | Criação das tabelas e chaves estrangeiras |
| 2 | `002_Procedures` | Stored procedures utilizadas pela aplicação |
| 3 | `003_INSERT_USUARIO.sql` | Dados iniciais (opcional) |

OBS: O script 003 irá criar um usuário com o seguinte login:

Usuário: Adminteste@gmail.com
Senha: teste1234

> ⚠️ Usuário criado apenas para fins de demonstração/teste local. Não reutilize este e-mail/senha em nenhum outro sistema.

## Executando o projeto

```bash
cd Task_Manager.API
dotnet restore
dotnet run
```

A aplicação serve tanto a API quanto o frontend estático. Ao acessar a raiz (`/`), o usuário é direcionado para a tela de login.

Acesse o https://localhost:7080/ para ir para a tela de login.

Em ambiente de desenvolvimento, a documentação da API fica disponível via Scalar em `/scalar/v1`.

## Estrutura de pastas

```
Task_Manager/
├── Database/
│   └── Scripts/
├── Task_Manager.API/
│   ├── Controllers/
│   ├── Middleware/
│   └── Program.cs
├── Task_Manager.Application/
│   ├── DTO/
│   ├── Interfaces/
│   └── Services/
├── Task_Manager.Infrastructure/
│   ├── Data/
│   └── Repositories/
└── Frontend/
    ├── js/
    │   └── apiFetch.js
    ├── login/
    ├── index/
    └── projetos/
```

## Decisões técnicas

**Renovação automática de token**
Em vez de reautenticar o usuário a cada expiração (60 min) ou reemitir um token novo em toda requisição (custo desnecessário), o token só é renovado quando está próximo de expirar (configurável via `Jwt:RenovarToken`). Um middleware verifica essa condição a cada requisição autenticada e, se necessário, retorna um novo token no header `X-New-Token`. O frontend intercepta esse header via um client HTTP central (`apiFetch.js`) e atualiza o token salvo, de forma transparente ao usuário.

Esse mecanismo garante que usuários ativos nunca percam a sessão, enquanto usuários inativos são deslogados naturalmente quando o token expira sem renovação.

**Client HTTP centralizado no frontend**
Toda chamada à API passa por uma função única (`apiFetch`), responsável por anexar o token, capturar renovações automáticas e tratar sessões expiradas (401). Isso evita duplicação de lógica de autenticação em cada arquivo JavaScript do sistema.

**Segredos fora do controle de versão**
A chave de assinatura JWT nunca é versionada. O `appsettings.json` do repositório contém apenas a estrutura de configuração, com valores sensíveis preenchidos localmente via User Secrets ou arquivos ignorados pelo Git.

## Melhorias futuras


- [ ] Cookies `httpOnly` para armazenamento de token, reduzindo exposição a XSS
- [ ] Criação de tela para cadastro de usuário