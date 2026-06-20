// Cloudflare Pages Function middleware.
// Protege todos os HTMLs deste repo: só renderiza se o Referer vier de plataformas
// autorizadas (MemberKit). Acesso direto pela URL no navegador → 403.
//
// Hack conhecido: aluno pode forjar Referer via DevTools/curl. Isso barra 99%
// dos casos casuais (compartilhar URL no WhatsApp, postar em fórum, etc).
// Pra proteção mais forte: signed URLs com TTL (feito em Phase 2 se necessário).

const ALLOWED_REFERER_HOSTS = [
  "memberkit.com",
  "memberkit.com.br",
  "alunos.aprenderdados.com",  // se um dia migrar pra plataforma própria
  "localhost",                  // dev/teste local
  "127.0.0.1",
];

// Paths que NÃO requerem referer check (favicon, raiz, etc).
const PUBLIC_PATHS = ["/", "/favicon.ico", "/robots.txt"];

function refererAllowed(referer) {
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return ALLOWED_REFERER_HOSTS.some(host => url.hostname === host || url.hostname.endsWith("." + host));
  } catch {
    return false;
  }
}

function forbidden(reason) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>403</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#170307;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
.card{max-width:520px;padding:48px 36px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px}
h1{font-size:1.6em;margin:0 0 12px;color:#FF3621}
p{margin:6px 0;opacity:.85;line-height:1.55}
code{background:rgba(255,255,255,.08);padding:2px 8px;border-radius:4px;font-size:.85em}</style>
<div class="card">
<h1>403 — Acesso restrito</h1>
<p>Este conteúdo é parte do curso da Aprender Dados e só está disponível dentro da plataforma de alunos.</p>
<p style="margin-top:18px;font-size:.85em;opacity:.6">${reason}</p>
</div>`,
    {
      status: 403,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Liberar paths públicos (raiz, favicon, etc.)
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Liberar assets sem Referer check (CSS/JS/IMG carregados pelo próprio HTML embedded
  // chegam com Referer = nossa própria URL, que NÃO está na whitelist).
  // Permitir Referer = nosso próprio domínio.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname === url.hostname) {
        return next();
      }
    } catch {}
  }

  if (!refererAllowed(referer)) {
    return forbidden(referer ? `Referer não autorizado.` : `Nenhum Referer detectado.`);
  }

  return next();
}
