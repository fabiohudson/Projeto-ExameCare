# ExameCare

**Aplicação para familiares e cuidadores acompanharem idosos**, com gestão completa de exames, consultas, resultados e alertas.

Uma solução prática e intuitiva para quem cuida de idosos, centralizando todas as informações de saúde em um único lugar.

## Tecnologias

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**

### Autenticação
- **JWT** (JSON Web Tokens)

### Frontend
- **PWA** (Progressive Web App) estático
- **HTML, CSS e JavaScript** (Vanilla)

---

## Preparação

### 1. Instale as dependências

```bash
npm install
2. Configure o ambiente
Crie um arquivo .env na raiz do projeto com base no .env.example:
envDATABASE_URL="postgresql://postgres:SENHA@localhost:5432/examecare"
JWT_SECRET="troque-este-segredo"
3. Gere o Prisma Client
Bashnpx prisma generate
4. Aplique as migrações no banco de dados
Bashnpx prisma migrate deploy

Como Executar
API (Backend) - Modo Desenvolvimento
Bashnpm run start:dev
Frontend
Bashnpx serve frontend
Dica: Se preferir abrir diretamente o frontend/index.html no navegador, a API padrão configurada é http://localhost:3000. Para alterar o endereço da API, edite o arquivo frontend/config.js.

Funcionalidades

Cadastro e login com aceite de LGPD
Recuperação de senha (com token salvo no banco)
Cadastro de idosos
Gestão completa de exames: agendamento, realização, cancelamento e remoção
Registro de resultados de exames realizados
Gestão completa de consultas: agendamento, realização, cancelamento e remoção
Dashboard com:
Eventos do dia
Próximos 7 dias
Resultados pendentes

Perfil do usuário com dados pessoais e preferências visuais


Observação sobre Recuperação de Senha
Em produção, conecte o método forgotPassword a um serviço de envio de e-mails (ex: SendGrid, AWS SES, Nodemailer, etc.).
Em desenvolvimento, a API retorna o token de recuperação diretamente no corpo da resposta para facilitar testes manuais.

Validação e Build
Bash# Build do projeto
npm run build

# Executar testes
npm test

Próximos Passos (Sugestões)

Implementação de notificações push
Relatórios em PDF
Integração com calendário (Google Calendar / iCal)
Versão mobile nativa (PWA já está otimizada)
Dashboard para profissionais de saúde
