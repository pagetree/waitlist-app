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

function adminNav(active) {
  const items = [
    { href: "/admin", id: "signups", label: "Signups" },
    { href: "/admin/settings", id: "settings", label: "Settings" },
    { href: "/admin/customize", id: "customize", label: "Customize" },
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
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="login">
    <p class="login-brand">${brand}</p>
    <h1 class="login-title">Sign in</h1>
    <p class="login-lead">Admin access for this waitlist.</p>
    <form class="login-form" method="post" action="/admin/login" autocomplete="on">
      <label class="sr-only" for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Password" />
      ${err}
      <button type="submit">Continue</button>
    </form>
    <a class="login-back" href="/">Back to site</a>
  </main>
</body>
</html>`;
}

export function adminPage(config, signups, total) {
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

  return `${head(config, "Signups")}
<body class="page admin-shell">
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="admin-layout">
    <header class="admin-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h1 class="admin-title">${total} signup${total === 1 ? "" : "s"}</h1>
      </div>
      <div class="admin-actions">
        <a class="btn-ghost" href="/admin/export.csv">Export CSV</a>
        <form method="post" action="/admin/logout"><button type="submit" class="btn-ghost">Log out</button></form>
      </div>
    </header>
    ${adminNav("signups")}
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

export function adminSettingsPage(config, status = {}) {
  const flash = status.saved
    ? `<p class="flash flash-ok" role="status">Settings saved. Public page is updated.</p>`
    : status.error
      ? `<p class="flash flash-error" role="alert">${escapeHtml(status.error)}</p>`
      : "";

  return `${head(config, "Settings")}
<body class="page admin-shell">
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="admin-layout">
    <header class="admin-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h1 class="admin-title">Settings</h1>
      </div>
      <div class="admin-actions">
        <a class="btn-ghost" href="/" target="_blank" rel="noopener">View site</a>
        <form method="post" action="/admin/logout"><button type="submit" class="btn-ghost">Log out</button></form>
      </div>
    </header>
    ${adminNav("settings")}
    ${flash}
    <form class="settings-form" method="post" action="/admin/settings">
      <div class="field">
        <label for="site_name">Brand name</label>
        <p class="hint">Hero title on the public page.</p>
        <input id="site_name" name="site_name" type="text" required maxlength="80" value="${escapeHtml(config.siteName)}" />
      </div>
      <div class="field">
        <label for="headline">Headline</label>
        <p class="hint">One short line under the brand.</p>
        <input id="headline" name="headline" type="text" required maxlength="160" value="${escapeHtml(config.headline)}" />
      </div>
      <div class="field">
        <label for="support_text">Support text</label>
        <p class="hint">Supporting sentence under the headline.</p>
        <textarea id="support_text" name="support_text" required maxlength="280" rows="3">${escapeHtml(config.support)}</textarea>
      </div>
      <div class="field">
        <label for="cta_text">Button label</label>
        <p class="hint">Submit button on the signup form.</p>
        <input id="cta_text" name="cta_text" type="text" required maxlength="48" value="${escapeHtml(config.cta)}" />
      </div>
      <div class="field">
        <label for="accent_color">Accent color</label>
        <p class="hint">CSS color for the primary button (hex preferred).</p>
        <div class="color-row">
          <input id="accent_color" name="accent_color" type="text" required maxlength="32" value="${escapeHtml(config.accent)}" />
          <input class="color-swatch" type="color" value="${escapeHtml(/^#[0-9a-fA-F]{6}$/.test(config.accent) ? config.accent : "#1F6F5B")}" data-accent-picker aria-label="Pick accent color" />
        </div>
      </div>
      <button type="submit">Save settings</button>
    </form>
  </main>
  <script>
    const text = document.getElementById("accent_color");
    const picker = document.querySelector("[data-accent-picker]");
    if (text && picker) {
      picker.addEventListener("input", () => { text.value = picker.value; });
      text.addEventListener("input", () => {
        if (/^#[0-9a-fA-F]{6}$/.test(text.value)) picker.value = text.value;
      });
    }
  </script>
</body>
</html>`;
}

export function adminCustomizePage(config, status = {}) {
  const flash = status.saved
    ? `<p class="flash flash-ok" role="status">Customize saved. Public page is updated.</p>`
    : status.error
      ? `<p class="flash flash-error" role="alert">${escapeHtml(status.error)}</p>`
      : "";
  const layout = config.layout === "split" ? "split" : "centered";
  const bgChecked = config.bgEnabled ? " checked" : "";

  return `${head(config, "Customize")}
<body class="page admin-shell">
  <header class="topbar">
    ${themeToggle()}
  </header>
  <main class="admin-layout">
    <header class="admin-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h1 class="admin-title">Customize</h1>
      </div>
      <div class="admin-actions">
        <a class="btn-ghost" href="/" target="_blank" rel="noopener">View site</a>
        <form method="post" action="/admin/logout"><button type="submit" class="btn-ghost">Log out</button></form>
      </div>
    </header>
    ${adminNav("customize")}
    ${flash}
    <form class="settings-form customize-form" method="post" action="/admin/customize" data-customize>
      <fieldset class="field layout-field">
        <legend>Layout</legend>
        <p class="hint">Pick how the public waitlist is composed.</p>
        <div class="layout-choices" role="radiogroup" aria-label="Layout">
          <label class="layout-choice">
            <input type="radio" name="layout" value="centered"${layout === "centered" ? " checked" : ""} />
            <span class="layout-choice-card">
              <span class="layout-choice-preview layout-preview-centered" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
              <span class="layout-choice-title">Centered</span>
              <span class="layout-choice-copy">Brand and form in one focused column.</span>
            </span>
          </label>
          <label class="layout-choice">
            <input type="radio" name="layout" value="split"${layout === "split" ? " checked" : ""} />
            <span class="layout-choice-card">
              <span class="layout-choice-preview layout-preview-split" aria-hidden="true">
                <span></span><span></span>
              </span>
              <span class="layout-choice-title">Two column</span>
              <span class="layout-choice-copy">Form on one side, image card on the other.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div class="customize-panel" data-panel="centered">
        <div class="field">
          <label class="check-row" for="bg_enabled">
            <input id="bg_enabled" name="bg_enabled" type="checkbox" value="1"${bgChecked} />
            <span>Use a background image</span>
          </label>
          <p class="hint">Full bleed photo behind the centered content.</p>
        </div>
        <div class="field" data-bg-url>
          <label for="bg_image">Background image URL</label>
          <p class="hint">Paste a direct https image link.</p>
          <input id="bg_image" name="bg_image" type="url" maxlength="500" placeholder="https://…" value="${escapeHtml(config.bgImage || "")}" />
        </div>
      </div>

      <div class="customize-panel" data-panel="split">
        <div class="field">
          <label for="panel_image">Image card URL</label>
          <p class="hint">Shown in the rounded panel beside the form.</p>
          <input id="panel_image" name="panel_image" type="url" maxlength="500" placeholder="https://…" value="${escapeHtml(config.panelImage || "")}" />
        </div>
      </div>

      <button type="submit">Save</button>
    </form>
  </main>
  <script>
    (function () {
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
    })();
  </script>
</body>
</html>`;
}
