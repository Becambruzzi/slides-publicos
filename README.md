# slides-publicos

Slides HTML standalone dos cursos da Aprender Dados, servidos por Cloudflare Pages com proteção Referer.

## Como funciona

```
Aluno na aula MemberKit → iframe carrega slide → Cloudflare Function checa Referer
                                                       ↓
                                          memberkit.com.* ? → renderiza HTML
                                                       ↓
                                          qualquer outro → 403
```

URL direta no navegador (sem Referer da plataforma) → 403. Conteúdo continua privado mesmo sendo repo público.

## Estrutura

```
slides-publicos/
├── functions/
│   └── _middleware.js          ← protege todos os HTMLs via Referer check
├── novo-associate/
│   ├── 01-databricks-intelligence-platform.html
│   └── ... (outros módulos)
├── professional/                ← futuro
├── pyspark-free/                ← futuro
└── README.md
```

## Adicionar novo slide

1. Copiar o `.html` standalone pra `<curso>/<numero>-<slug>.html`
2. `git add . && git commit -m "feat(<curso>): slide M0X" && git push`
3. Deploy automático Cloudflare Pages (~30s)
4. URL viva em `https://<domain>/<curso>/<arquivo>.html`

## Whitelist de Referers

Hardcoded em `functions/_middleware.js` → `ALLOWED_REFERER_HOSTS`:

- `memberkit.com`, `memberkit.com.br`
- `alunos.aprenderdados.com` (futuro)
- `localhost`, `127.0.0.1` (dev/teste)

Pra adicionar nova plataforma (Hotmart, Eduzz, site próprio), editar a lista, commit, push.

## Como embedar no MemberKit

```html
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#170307;">
  <iframe
    src="https://<seu-domain>/novo-associate/01-databricks-intelligence-platform.html"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
    allowfullscreen
    loading="lazy"
    title="Databricks Intelligence Platform">
  </iframe>
</div>
```

Substituir `<seu-domain>` por `<projeto>.pages.dev` ou custom domain (`aulas.aprenderdados.com`).

## Limitação conhecida

Aluno avançado pode forjar Referer via DevTools/curl e baixar o HTML. Isso barra 99% dos casos casuais (compartilhar URL no WhatsApp, postar em fórum). Pra proteção forte: signed URLs com TTL — implementar quando volume justificar.
