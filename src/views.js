function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeCssUrl(value) {
  return String(value || "")
    .replace(/\\/g, "")
    .replace(/["'\n\r\f]/g, "")
    .trim();
}

function head(config, title) {
  const brand = escapeHtml(config.siteName);
  const accent = escapeHtml(config.accent);
  const pageTitle = title ? `${escapeHtml(title)} · ${brand}` : brand;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle}</title>
  <meta name="description" content="${escapeHtml(config.support)}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <style>:root { --accent: ${accent}; }</style>
  <script src="/theme.js"></script>
</head>`;
}

function themeToggle() {
  return `<button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">
    <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
    </svg>
    <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/>
      <path d="M12 2.5v1.8M12 19.7v1.8M4.5 12H2.7M21.3 12h-1.8M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M18.4 5.6l-1.3 1.3M6.9 17.1l-1.3 1.3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    </svg>
  </button>`;
}

function formatJoinedAt(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(isoJoinedAt(raw));
  if (Number.isNaN(date.getTime())) return escapeHtml(raw);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return escapeHtml(
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  }
  const opts = { month: "short", day: "numeric" };
  if (date.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return escapeHtml(date.toLocaleDateString("en-US", opts));
}

function isoJoinedAt(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /T/.test(raw) ? raw : `${raw.replace(" ", "T")}Z`;
}

function adminNav(active) {
  const items = [
    { href: "/admin", id: "signups", label: "Signups" },
    { href: "/admin/settings", id: "settings", label: "Settings" },
    { href: "/admin/customize", id: "customize", label: "Layout" },
  ];
  return `<nav class="admin-nav" aria-label="Admin">
    ${items
      .map(
        (item) =>
          `<a class="admin-nav-link${active === item.id ? " is-active" : ""}" href="${item.href}">${item.label}</a>`
      )
      .join("")}
  </nav>`;
}

function adminBar(config, active) {
  const brand = escapeHtml(config.siteName);
  return `<header class="admin-bar">
    <a class="admin-mark" href="/admin">${brand}</a>
    ${adminNav(active)}
    <div class="admin-tools">
      ${themeToggle()}
      <a class="admin-text" href="/" target="_blank" rel="noopener">Site</a>
      <form method="post" action="/admin/logout">
        <button type="submit" class="admin-text">Log out</button>
      </form>
    </div>
  </header>`;
}

function adminFlash(status, savedMessage) {
  if (status.saved) {
    return `<p class="admin-flash is-ok" role="status">${escapeHtml(savedMessage)}</p>`;
  }
  if (status.error) {
    return `<p class="admin-flash is-bad" role="alert">${escapeHtml(status.error)}</p>`;
  }
  return "";
}

function adminShell(config, title, active, inner, script = "") {
  const scriptHtml = script
    ? `\n  <script>\n${script}\n  </script>`
    : "";
  return `${head(config, title)}
<body class="page admin-shell">
  ${adminBar(config, active)}
  <main class="admin-stage">
    ${inner}
  </main>${scriptHtml}
</body>
</html>`;
}

function signupBlock(config, flash) {
  const brand = escapeHtml(config.siteName);
  const headline = escapeHtml(config.headline);
  const support = escapeHtml(config.support);
  const cta = escapeHtml(config.cta);
  const flashHtml = flash
    ? `<p class="flash ${flash.type === "error" ? "flash-error" : "flash-ok"}" role="status">${escapeHtml(flash.message)}</p>`
    : "";

  return `<h1 class="brand">${brand}</h1>
    <p class="headline">${headline}</p>
    <p class="support">${support}</p>
    <form class="join" method="post" action="/join" autocomplete="on">
      <label class="sr-only" for="email">Email</label>
      <input id="email" name="email" type="email" required maxlength="254" placeholder="you@company.com" inputmode="email" autocomplete="email" />
      <button type="submit">${cta}</button>
    </form>
    ${flashHtml}`;
}

export function publicPage(config, flash) {
  const layout = config.layout === "split" ? "split" : "centered";
  const useBg =
    layout === "centered" && config.bgEnabled && Boolean(config.bgImage);
  const bgUrl = escapeCssUrl(config.bgImage);
  const panelUrl = escapeCssUrl(config.panelImage);
  const bodyClass = [
    "page",
    "public",
    `layout-${layout}`,
    useBg ? "has-bg" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (layout === "split") {
    const panelStyle = panelUrl
      ? ` style="--panel-image: url(&quot;${escapeHtml(panelUrl)}&quot;)"`
      : "";
    const panelClass = panelUrl ? "split-card has-image" : "split-card";

    return `${head(config)}
<body class="${bodyClass}">
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="split">
    <section class="split-copy">
      ${signupBlock(config, flash)}
    </section>
    <aside class="split-visual" aria-hidden="true">
      <div class="${panelClass}"${panelStyle}></div>
    </aside>
  </main>
</body>
</html>`;
  }

  const bgLayer = useBg
    ? `<div class="hero-bg" style="--hero-image: url(&quot;${escapeHtml(bgUrl)}&quot;)" aria-hidden="true"></div>`
    : "";

  return `${head(config)}
<body class="${bodyClass}">
  ${bgLayer}
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="hero">
    ${signupBlock(config, flash)}
  </main>
</body>
</html>`;
}

export function adminLoginPage(config, error) {
  const brand = escapeHtml(config.siteName);
  const err = error
    ? `<p class="login-error" role="alert">${escapeHtml(error)}</p>`
    : "";

  return `${head(config, "Admin")}
<body class="page login-page">
  <header class="login-bar">
    ${themeToggle()}
  </header>
  <main class="login">
    <p class="login-brand">${brand}</p>
    <h1 class="login-title">Admin</h1>
    <form class="login-form" method="post" action="/admin/login" autocomplete="on">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" />
      ${err}
      <button type="submit">Continue</button>
    </form>
    <a class="login-back" href="/">Back to site</a>
  </main>
</body>
</html>`;
}

export function adminPage(config, signups, total) {
  const list =
    signups.length === 0
      ? `<p class="signup-empty">No one has joined.</p>`
      : `<ul class="signup-list">
          ${signups
            .map(
              (s) => `<li>
                <span class="signup-email">${escapeHtml(s.email)}</span>
                <time class="signup-when" datetime="${escapeHtml(isoJoinedAt(s.created_at))}">${formatJoinedAt(s.created_at)}</time>
              </li>`
            )
            .join("")}
        </ul>`;

  return adminShell(
    config,
    "Signups",
    "signups",
    `<div class="admin-hero">
      <div>
        <h1 class="admin-stat">${total}</h1>
        <p class="admin-stat-kicker">${total === 1 ? "person waiting" : "people waiting"}</p>
      </div>
      <a class="admin-export" href="/admin/export.csv">Export</a>
    </div>
    ${list}`
  );
}

export function adminSettingsPage(config, status = {}) {
  const flash = adminFlash(status, "Saved.");
  const inner = `${flash}
    <h1 class="admin-page-title">Settings</h1>
    <form class="settings-form" method="post" action="/admin/settings">
      <div class="field">
        <label for="site_name">Brand</label>
        <input id="site_name" name="site_name" type="text" required maxlength="80" value="${escapeHtml(config.siteName)}" />
      </div>
      <div class="field">
        <label for="headline">Headline</label>
        <input id="headline" name="headline" type="text" required maxlength="160" value="${escapeHtml(config.headline)}" />
      </div>
      <div class="field">
        <label for="support_text">Support</label>
        <textarea id="support_text" name="support_text" required maxlength="280" rows="3">${escapeHtml(config.support)}</textarea>
      </div>
      <div class="field">
        <label for="cta_text">Button</label>
        <input id="cta_text" name="cta_text" type="text" required maxlength="48" value="${escapeHtml(config.cta)}" />
      </div>
      <div class="field">
        <label for="accent_color">Accent</label>
        <div class="color-row">
          <input id="accent_color" name="accent_color" type="text" required maxlength="32" value="${escapeHtml(config.accent)}" />
          <input class="color-swatch" type="color" value="${escapeHtml(/^#[0-9a-fA-F]{6}$/.test(config.accent) ? config.accent : "#1F6F5B")}" data-accent-picker aria-label="Pick accent color" />
        </div>
      </div>
      <button type="submit">Save</button>
    </form>`;
  const script = `    const text = document.getElementById("accent_color");
    const picker = document.querySelector("[data-accent-picker]");
    if (text && picker) {
      picker.addEventListener("input", () => { text.value = picker.value; });
      text.addEventListener("input", () => {
        if (/^#[0-9a-fA-F]{6}$/.test(text.value)) picker.value = text.value;
      });
    }`;
  return adminShell(config, "Settings", "settings", inner, script);
}

export function adminCustomizePage(config, status = {}) {
  const flash = adminFlash(status, "Saved.");
  const layout = config.layout === "split" ? "split" : "centered";
  const bgChecked = config.bgEnabled ? " checked" : "";
  const inner = `${flash}
    <h1 class="admin-page-title">Layout</h1>
    <form class="settings-form customize-form" method="post" action="/admin/customize" data-customize>
      <fieldset class="look-field">
        <legend class="sr-only">Layout</legend>
        <div class="look-grid" role="radiogroup" aria-label="Layout">
          <label class="look-card">
            <input type="radio" name="layout" value="centered"${layout === "centered" ? " checked" : ""} />
            <span class="look-art look-art-center" aria-hidden="true">
              <span class="look-art-stack">
                <span class="look-art-line"></span>
                <span class="look-art-line"></span>
                <span class="look-art-line look-art-cta"></span>
              </span>
            </span>
            <span class="look-name">Centered</span>
          </label>
          <label class="look-card">
            <input type="radio" name="layout" value="split"${layout === "split" ? " checked" : ""} />
            <span class="look-art look-art-split" aria-hidden="true">
              <span class="look-art-stack">
                <span class="look-art-line"></span>
                <span class="look-art-line"></span>
                <span class="look-art-line look-art-cta"></span>
              </span>
              <span class="look-art-pane"></span>
            </span>
            <span class="look-name">Split</span>
          </label>
        </div>
      </fieldset>

      <div class="customize-panel" data-panel="centered">
        <label class="switch-row" for="bg_enabled">
          <span>Background</span>
          <input id="bg_enabled" name="bg_enabled" type="checkbox" value="1" class="switch"${bgChecked} />
        </label>
        <div class="field" data-bg-url>
          <label for="bg_image">Image</label>
          <input id="bg_image" name="bg_image" type="url" maxlength="500" placeholder="Paste an image link" value="${escapeHtml(config.bgImage || "")}" />
        </div>
      </div>

      <div class="customize-panel" data-panel="split">
        <div class="field">
          <label for="panel_image">Side image</label>
          <input id="panel_image" name="panel_image" type="url" maxlength="500" placeholder="Paste an image link" value="${escapeHtml(config.panelImage || "")}" />
        </div>
      </div>

      <button type="submit">Save</button>
    </form>`;
  const script = `    (function () {
      const form = document.querySelector("[data-customize]");
      if (!form) return;
      const panels = form.querySelectorAll("[data-panel]");
      const bgUrl = form.querySelector("[data-bg-url]");
      const bgToggle = form.querySelector("#bg_enabled");

      function sync() {
        const layout = form.querySelector('input[name="layout"]:checked')?.value || "centered";
        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute("data-panel") !== layout;
        });
        if (bgUrl) bgUrl.hidden = !(layout === "centered" && bgToggle?.checked);
      }

      form.addEventListener("change", sync);
      sync();
    })();`;
  return adminShell(config, "Layout", "customize", inner, script);
}
