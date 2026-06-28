# ExameCare

Aplicação para familiares cuidadores acompanharem idosos, exames, consultas, resultados e alertas.

## Tecnologias

- **Backend**: NestJS, Prisma e PostgreSQL
- **Autenticação**: JWT
- **Frontend**: PWA estático em HTML, CSS e JavaScript

## Preparação

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo .env na raiz usando .env.example como base:

```bash
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/examecare"
JWT_SECRET="troque-este-segredo"
```

3. Gere o Prisma Client:

```bash
npx prisma generate
```

4. Aplique as migrações no banco:

```bash
npx prisma migrate deploy
```

## Executar
API em desenvolvimento:

```bash
npm run start:dev
```

Frontend:

```bash
npx serve frontend
```

Se abrir frontend/index.html direto no navegador, a API padrão será http://localhost:3000. Para outro endereço, edite frontend/config.js.

## Funcionalidades

Cadastro e login com aceite de LGPD
Recuperação de senha com token salvo no banco
Cadastro de idosos
Agendamento, realização, cancelamento e remoção de exames
Registro de resultado para exames realizados
Agendamento, realização, cancelamento e remoção de consultas
Dashboard com eventos do dia, próximos 7 dias e resultados pendentes
Perfil com dados pessoais e preferências visuais

## Observação sobre recuperação de senha
Em produção, conecte o método forgotPassword a um provedor de e-mail. Em desenvolvimento, a API retorna o token no corpo da resposta para facilitar testes manuais.
Validação

```bash
npm run build
npm test
``` 
Bashnpm run build
npm test
