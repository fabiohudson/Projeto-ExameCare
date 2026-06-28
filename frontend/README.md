# ExameCare Frontend

Frontend PWA sem dependencias externas, criado para consumir a API NestJS existente.

## Como executar

1. Inicie a API na raiz do projeto:

```bash
npm run start:dev
```

2. Sirva esta pasta com qualquer servidor estatico. Exemplo com Node:

```bash
npx serve frontend
```

Tambem e possivel abrir `frontend/index.html` diretamente no navegador, mas o Service Worker funciona apenas via `http://localhost` ou HTTPS.

## Publicacao

Para publicar para qualquer usuario, hospede a pasta `frontend` em um servidor publico com HTTPS.

Se a API estiver em outro dominio, configure `frontend/config.js` antes da publicacao:

```js
window.EXAMECARE_CONFIG = {
  apiUrl: 'https://api.seu-dominio.com',
};
```

Quando `apiUrl` fica vazio, o app usa o mesmo dominio onde o site foi publicado.
