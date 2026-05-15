# Conexte — Site Institucional

Site institucional da Conexte Tecnologia. HTML/CSS/JS vanilla com GSAP, formulário de contato via PHP + PHPMailer, deploy na Vercel (site estático) e HostGator (com PHP para envio de e-mail).

---

## Stack

- HTML + CSS + JS vanilla
- GSAP 3.12 (animações)
- PHP 8.2 + PHPMailer 6.x (formulário de contato)
- Docker (ambiente local com PHP)

---

## Estrutura

```
Conexte/
├── conexte/            ← arquivos do site (webroot)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── contact.php     ← backend do formulário
│   ├── logo.png / logo-white.png
│   ├── robo.mp4
│   ├── logos/          ← SVGs dos fabricantes parceiros
│   └── *.html          ← subpáginas de soluções
├── vendor/             ← PHPMailer (gerado pelo Composer, não commitado)
├── composer.json
├── Dockerfile
├── docker-compose.yml
├── .env.example        ← template das variáveis de ambiente
└── local-server.js     ← servidor Node.js só para frontend (sem PHP)
```

---

## Desenvolvimento local

### Só frontend (sem PHP)

```bash
node local-server.js
# Acesse http://127.0.0.1:3000
```

### Stack completa com PHP (formulário funcional)

```bash
# 1. Crie o arquivo de credenciais
cp .env.example .env
# Edite .env com a senha real do SMTP

# 2. Suba o Docker
docker compose up -d --build
# Acesse http://localhost:8080
```

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `SMTP_HOST` | Servidor de e-mail | `mail.conexte.com.br` |
| `SMTP_USER` | E-mail remetente | `faleconosco@conexte.com.br` |
| `SMTP_PASS` | Senha do e-mail | _(obrigatório)_ |
| `SMTP_PORT` | Porta SMTP | `465` |
| `SMTP_SECURE` | Protocolo (`ssl` ou `tls`) | `ssl` |
| `MAIL_TO` | E-mail destinatário | `faleconosco@conexte.com.br` |

---

## Deploy — HostGator

1. Faça upload do conteúdo de `conexte/` para `public_html/`
2. Faça upload da pasta `vendor/` para **um nível acima** de `public_html/` (ex: `~/vendor/`) — fica fora do webroot por segurança
3. No `contact.php`, as credenciais SMTP são lidas via `getenv()`. Para configurar no HostGator, edite as linhas de fallback diretamente no arquivo:

```php
$smtpPass = getenv('SMTP_PASS') ?: 'sua_senha_aqui';
```

Ou adicione ao `.htaccess` da `public_html/`:

```apache
SetEnv SMTP_PASS sua_senha_aqui
```

---

## Deploy — Vercel

O site estático (sem PHP) já está configurado via `vercel.json`. O formulário **não funciona** na Vercel — use o HostGator para o formulário funcionar.

---

## Contato da Conexte

- WhatsApp: (13) 99684-7503
- E-mail: contato@conexte.com.br
