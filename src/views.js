function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function publicPage(config, flash) {
  const brand = escapeHtml(config.siteName);
  const headline = escapeHtml(config.headline);
  const support = escapeHtml(config.support);
  const cta = escapeHtml(config.cta);
  const accent = escapeHtml(config.accent);
  const flashHtml = flash
    ? `<p class="flash ${flash.type === "error" ? "flash-error" : "flash-ok"}" role="status">${escapeHtml(flash.message)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${brand}</title>
  <meta name="description" content="${support}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <style>:root { --accent: ${accent}; }</style>
</head>
<body class="public">
  <div class="atmosphere" aria-hidden="true">
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="grain"></div>
  </div>
  <main class="hero">
    <h1 class="brand reveal">${brand}</h1>
    <p class="headline reveal delay-1">${headline}</p>
    <p class="support reveal delay-2">${support}</p>
    <form class="join reveal delay-3" method="post" action="/join" autocomplete="on">
      <label class="sr-only" for="email">Email</label>
      <input id="email" name="email" type="email" required maxlength="254" placeholder="you@company.com" inputmode="email" />
      <button type="submit">${cta}</button>
    </form>
    ${flashHtml}
  </main>
  <script>
    document.querySelectorAll(".reveal").forEach((el, i) => {
      requestAnimationFrame(() => {
        setTimeout(() => el.classList.add("in"), 80 + i * 90);
      });
    });
  </script>
</body>
</html>`;
}

export function adminLoginPage(config, error) {
  const brand = escapeHtml(config.siteName);
  const err = error
    ? `<p class="flash flash-error" role="alert">${escapeHtml(error)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin · ${brand}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <style>:root { --accent: ${escapeHtml(config.accent)}; }</style>
</head>
<body class="admin-shell">
  <div class="atmosphere" aria-hidden="true">
    <div class="orb orb-a"></div>
    <div class="grain"></div>
  </div>
  <main class="admin-panel">
    <p class="brand">${brand}</p>
    <h1 class="admin-title">Signups</h1>
    <p class="support">Enter the admin password from your Railway variables.</p>
    <form class="join" method="post" action="/admin/login">
      <label class="sr-only" for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Admin password" />
      <button type="submit">Open admin</button>
    </form>
    ${err}
  </main>
</body>
</html>`;
}

export function adminPage(config, signups, total) {
  const brand = escapeHtml(config.siteName);
  const rows =
    signups.length === 0
      ? `<tr><td colspan="2" class="empty">No signups yet. Share your public URL.</td></tr>`
      : signups
          .map(
            (s) => `<tr>
              <td>${escapeHtml(s.email)}</td>
              <td>${escapeHtml(s.created_at)}</td>
            </tr>`
          )
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin · ${brand}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <style>:root { --accent: ${escapeHtml(config.accent)}; }</style>
</head>
<body class="admin-shell">
  <div class="atmosphere" aria-hidden="true">
    <div class="orb orb-a"></div>
    <div class="grain"></div>
  </div>
  <main class="admin-panel wide">
    <header class="admin-head">
      <div>
        <p class="brand">${brand}</p>
        <h1 class="admin-title">${total} signup${total === 1 ? "" : "s"}</h1>
      </div>
      <div class="admin-actions">
        <a class="ghost" href="/admin/export.csv">Export CSV</a>
        <form method="post" action="/admin/logout"><button type="submit" class="ghost-btn">Log out</button></form>
      </div>
    </header>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Email</th><th>Joined</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </main>
</body>
</html>`;
}
