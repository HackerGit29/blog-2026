var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/admin/toggle.ts
var JSON_HEADERS = { "Content-Type": "application/json" };
function getUrl(env) {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
}
__name(getUrl, "getUrl");
function getAnonKey(env) {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
}
__name(getAnonKey, "getAnonKey");
function getServiceKey(env) {
  return env.SUPABASE_SERVICE_ROLE_KEY || "";
}
__name(getServiceKey, "getServiceKey");
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
__name(decodeJwtPayload, "decodeJwtPayload");
async function supabaseFetch(url, env, jwt, init) {
  const serviceKey = getServiceKey(env);
  const authHeader = serviceKey ? `Bearer ${serviceKey}` : `Bearer ${jwt}`;
  const apiKey = serviceKey ? serviceKey : getAnonKey(env);
  return fetch(url, {
    ...init,
    headers: { apikey: apiKey, Authorization: authHeader, Accept: "application/json", ...init?.headers }
  });
}
__name(supabaseFetch, "supabaseFetch");
async function isAdmin(token, env) {
  const payload = decodeJwtPayload(token);
  const userId = payload?.sub;
  if (!userId) return false;
  const base = getUrl(env);
  try {
    const [profileRes, roleRes] = await Promise.all([
      supabaseFetch(
        `${base}/rest/v1/user_profiles?select=can_access_admin&user_id=eq.${userId}&limit=1`,
        env,
        token
      ),
      supabaseFetch(
        `${base}/rest/v1/user_roles?select=role&user_id=eq.${userId}&limit=1`,
        env,
        token
      )
    ]);
    const profile = await profileRes.json();
    const roleData = await roleRes.json();
    const canAccessAdmin = profile?.length > 0 && !!profile[0]?.can_access_admin;
    const role = roleData?.length > 0 ? roleData[0]?.role : null;
    return canAccessAdmin || role === "superadmin" || role === "admin";
  } catch {
    return false;
  }
}
__name(isAdmin, "isAdmin");
var onRequest = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: JSON_HEADERS });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: JSON_HEADERS });
  }
  const token = authHeader.slice(7);
  const payload = decodeJwtPayload(token);
  const requesterId = payload?.sub;
  if (!await isAdmin(token, env)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: JSON_HEADERS });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: JSON_HEADERS });
  }
  if (!body.user_id || !body.action) {
    return new Response(JSON.stringify({ error: "Missing user_id or action" }), { status: 400, headers: JSON_HEADERS });
  }
  if (body.user_id === requesterId) {
    return new Response(JSON.stringify({ error: "Cannot toggle your own access" }), { status: 400, headers: JSON_HEADERS });
  }
  const base = getUrl(env);
  if (!base) {
    return new Response(JSON.stringify({ error: "SUPABASE_URL not configured" }), { status: 500, headers: JSON_HEADERS });
  }
  try {
    const actions = [];
    switch (body.action) {
      case "set_admin":
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ can_access_admin: true })
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ role: "admin" })
            }
          )
        );
        break;
      case "set_superadmin":
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ can_access_admin: true })
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ role: "superadmin" })
            }
          )
        );
        break;
      case "remove_admin":
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ can_access_admin: false })
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env,
            token,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Prefer: "return=representation" },
              body: JSON.stringify({ role: "user" })
            }
          )
        );
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: JSON_HEADERS });
    }
    const results = await Promise.all(actions);
    for (const res of results) {
      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Failed to update" }), { status: 502, headers: JSON_HEADERS });
      }
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: JSON_HEADERS });
  }
}, "onRequest");

// api/admin/users.ts
var JSON_HEADERS2 = { "Content-Type": "application/json" };
function getUrl2(env) {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
}
__name(getUrl2, "getUrl");
function getAnonKey2(env) {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
}
__name(getAnonKey2, "getAnonKey");
function getServiceKey2(env) {
  return env.SUPABASE_SERVICE_ROLE_KEY || "";
}
__name(getServiceKey2, "getServiceKey");
function decodeJwtPayload2(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
__name(decodeJwtPayload2, "decodeJwtPayload");
async function supabaseFetch2(url, env, jwt) {
  const serviceKey = getServiceKey2(env);
  const authHeader = serviceKey ? `Bearer ${serviceKey}` : `Bearer ${jwt}`;
  const apiKey = serviceKey ? serviceKey : getAnonKey2(env);
  return fetch(url, {
    headers: { apikey: apiKey, Authorization: authHeader, Accept: "application/json" }
  });
}
__name(supabaseFetch2, "supabaseFetch");
async function isAdmin2(token, env) {
  const payload = decodeJwtPayload2(token);
  const userId = payload?.sub;
  if (!userId) return false;
  const base = getUrl2(env);
  try {
    const [profileRes, roleRes] = await Promise.all([
      supabaseFetch2(
        `${base}/rest/v1/user_profiles?select=can_access_admin&user_id=eq.${userId}&limit=1`,
        env,
        token
      ),
      supabaseFetch2(
        `${base}/rest/v1/user_roles?select=role&user_id=eq.${userId}&limit=1`,
        env,
        token
      )
    ]);
    const profile = await profileRes.json();
    const roleData = await roleRes.json();
    const canAccessAdmin = profile?.length > 0 && !!profile[0]?.can_access_admin;
    const role = roleData?.length > 0 ? roleData[0]?.role : null;
    return canAccessAdmin || role === "superadmin" || role === "admin";
  } catch {
    return false;
  }
}
__name(isAdmin2, "isAdmin");
var onRequest2 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: JSON_HEADERS2 });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: JSON_HEADERS2 });
  }
  const token = authHeader.slice(7);
  if (!await isAdmin2(token, env)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: JSON_HEADERS2 });
  }
  const base = getUrl2(env);
  if (!base) {
    return new Response(JSON.stringify({ error: "SUPABASE_URL not configured" }), { status: 500, headers: JSON_HEADERS2 });
  }
  try {
    const res = await supabaseFetch2(
      `${base}/rest/v1/user_profiles?select=id,user_id,username,name,can_access_admin,created_at&order=created_at.asc`,
      env,
      token
    );
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 502, headers: JSON_HEADERS2 });
    }
    const profiles = await res.json();
    const withRoles = await Promise.all(
      (profiles || []).map(async (p) => {
        try {
          const roleRes = await supabaseFetch2(
            `${base}/rest/v1/user_roles?select=role&user_id=eq.${p.user_id}&limit=1`,
            env,
            token
          );
          const roleData = await roleRes.json();
          return { ...p, role: roleData?.length > 0 ? roleData[0]?.role : null };
        } catch {
          return { ...p, role: null };
        }
      })
    );
    return new Response(JSON.stringify(withRoles), { status: 200, headers: JSON_HEADERS2 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: JSON_HEADERS2 });
  }
}, "onRequest");

// api/admin/verify.ts
var JSON_HEADERS3 = { "Content-Type": "application/json" };
function decodeJwtPayload3(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
__name(decodeJwtPayload3, "decodeJwtPayload");
var onRequest3 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: JSON_HEADERS3 });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS3 });
  }
  const token = authHeader.slice(7);
  const payload = decodeJwtPayload3(token);
  const userId = payload?.sub;
  if (!userId) {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS3 });
  }
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_profiles?select=can_access_admin&user_id=eq.${userId}&limit=1`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: authHeader, Accept: "application/json" } }
    );
    const profiles = await res.json();
    const canAccessAdmin = profiles?.length > 0 ? !!profiles[0]?.can_access_admin : false;
    return new Response(JSON.stringify({ canAccessAdmin }), { status: 200, headers: JSON_HEADERS3 });
  } catch {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS3 });
  }
}, "onRequest");

// api/articles.ts
var HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=60",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};
var onRequest4 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: HEADERS });
  }
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const per_page = Math.min(50, Math.max(1, parseInt(url.searchParams.get("per_page") || "9")));
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("category_id") || "";
    const mediaType = url.searchParams.get("media_type") || "all";
    const username = url.searchParams.get("username") || "";
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    let apiUrl = `${env.SUPABASE_URL}/rest/v1/article_list?select=*&order=published_at.desc`;
    if (username) {
      const esc = username.replace(/'/g, "''");
      apiUrl += `&author->>username=eq.${esc}`;
    }
    if (search) {
      const esc = search.replace(/'/g, "''");
      apiUrl += `&or=(title.ilike.*${esc}*,summary.ilike.*${esc}*)`;
    }
    if (categoryId) {
      apiUrl += `&category_id=eq.${categoryId}`;
    }
    if (mediaType === "video") {
      apiUrl += `&media_type=eq.video`;
    } else if (mediaType === "image") {
      apiUrl += `&or=(media_type.eq.image,media_type.is.null)`;
    }
    const reqHeaders = {
      "apikey": env.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
      "Range": `${from}-${to}`,
      "Prefer": "count=exact"
    };
    const res = await fetch(apiUrl, { headers: reqHeaders });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Supabase error", details: await res.text() }), { status: 502, headers: HEADERS });
    }
    const cr = res.headers.get("content-range");
    const total = cr ? parseInt(cr.split("/")[1] || "0") : 0;
    const data = await res.json();
    const catBaseUrl = `${env.SUPABASE_URL}/rest/v1/article_list?select=category_id`;
    const catFilter = username ? `&author->>username=eq.${username.replace(/'/g, "''")}` : "";
    const catUrl = `${catBaseUrl}${catFilter}`;
    const catRes = await fetch(catUrl, {
      headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}` }
    });
    const catRows = catRes.ok ? await catRes.json() : [];
    const category_counts = {};
    for (const r of catRows) {
      if (r.category_id) category_counts[r.category_id] = (category_counts[r.category_id] || 0) + 1;
    }
    const totalAll = Object.values(category_counts).reduce((a, b) => a + b, 0);
    return new Response(JSON.stringify({
      data,
      total,
      total_all: totalAll,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
      category_counts
    }), { headers: HEADERS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: HEADERS });
  }
}, "onRequest");

// api/newsletter.ts
var rateLimit = /* @__PURE__ */ new Map();
var RATE_LIMIT_MAX = 5;
var RATE_LIMIT_WINDOW = 6e4;
var SECURITY_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};
var onRequest5 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && now < entry.reset) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ error: "Trop de tentatives. R\xE9essayez plus tard." }), {
        status: 429,
        headers: { ...SECURITY_HEADERS, "Retry-After": `${Math.ceil((entry.reset - now) / 1e3)}` }
      });
    }
    entry.count++;
  } else {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: SECURITY_HEADERS
    });
  }
  try {
    const { email, turnstileToken } = await request.json();
    if (!email || !turnstileToken) {
      return new Response(JSON.stringify({ error: "Email et token requis" }), {
        status: 400,
        headers: SECURITY_HEADERS
      });
    }
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET)}&response=${encodeURIComponent(turnstileToken)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    const verifyResult = await verify.json();
    if (!verifyResult.success) {
      return new Response(JSON.stringify({ error: "V\xE9rification anti-bot \xE9chou\xE9e" }), {
        status: 403,
        headers: SECURITY_HEADERS
      });
    }
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ email, source: "blog" })
    });
    if (res.status === 409) {
      return new Response(JSON.stringify({ error: "Vous \xEAtes d\xE9j\xE0 inscrit \xE0 la newsletter." }), {
        status: 409,
        headers: SECURITY_HEADERS
      });
    }
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Erreur lors de l'inscription" }), {
        status: 500,
        headers: SECURITY_HEADERS
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: SECURITY_HEADERS
    });
  } catch {
    return new Response(JSON.stringify({ error: "Requ\xEAte invalide" }), {
      status: 400,
      headers: SECURITY_HEADERS
    });
  }
}, "onRequest");

// api/resources.ts
var JSON_HEADERS4 = { "Content-Type": "application/json" };
function getUrl3(env) {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
}
__name(getUrl3, "getUrl");
function getKey(env) {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
}
__name(getKey, "getKey");
var onRequest6 = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  if (!username) {
    return new Response(JSON.stringify({ error: "username required" }), { status: 400, headers: JSON_HEADERS4 });
  }
  const base = getUrl3(env);
  const anonKey = getKey(env);
  const anonHeaders = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Accept": "application/json"
  };
  try {
    const profileRes = await fetch(
      `${base}/rest/v1/user_profiles?select=user_id&username=eq.${encodeURIComponent(username.toLowerCase())}&limit=1`,
      { headers: anonHeaders }
    );
    if (!profileRes.ok) {
      console.error(`[resources API] Profile lookup failed for username: ${username}, status: ${profileRes.status}`);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 502, headers: JSON_HEADERS4 });
    }
    const profiles = await profileRes.json();
    const userId = profiles[0]?.user_id;
    if (!userId) {
      return new Response(JSON.stringify([]), { status: 200, headers: JSON_HEADERS4 });
    }
    const bundleRes = await fetch(
      `${base}/rest/v1/tenant_resources_bundle?select=resources&user_id=eq.${userId}&limit=1`,
      { headers: anonHeaders }
    );
    if (!bundleRes.ok) {
      console.error(`[resources API] Bundle lookup failed for user_id: ${userId}, status: ${bundleRes.status}`);
      return new Response(JSON.stringify([]), { status: 200, headers: JSON_HEADERS4 });
    }
    const bundle = await bundleRes.json();
    const resources = bundle?.[0]?.resources || [];
    return new Response(JSON.stringify(resources), {
      status: 200,
      headers: { ...JSON_HEADERS4, "Cache-Control": "public, max-age=300" }
    });
  } catch (error) {
    console.error("[resources API] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: JSON_HEADERS4 });
  }
}, "onRequest");

// sitemap.xml.ts
var onRequest7 = /* @__PURE__ */ __name(async (context) => {
  const { env } = context;
  const BASE = "https://benji-aka-dev.site";
  try {
    const url = `${env.SUPABASE_URL}/rest/v1/admin_articles?select=slug,published_at,created_at&status=eq.published&order=published_at.desc`;
    const res = await fetch(url, {
      headers: {
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
      }
    });
    const articles = res.ok ? await res.json() : [];
    const urls = [
      { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: "" },
      { loc: "/blog", priority: "1.0", changefreq: "weekly", lastmod: "" },
      { loc: "/blog/videos", priority: "0.9", changefreq: "weekly", lastmod: "" },
      { loc: "/ressources", priority: "0.8", changefreq: "weekly", lastmod: "" },
      { loc: "/admin", priority: "0.3", changefreq: "monthly", lastmod: "" },
      ...articles.map((a) => ({
        loc: `/blog/${a.slug}`,
        priority: "0.9",
        changefreq: "monthly",
        lastmod: a.published_at || a.created_at || ""
      }))
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
  </url>`).join("\n")}
</urlset>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" }
    });
  } catch (e) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${e.message}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" }
    });
  }
}, "onRequest");

// ../.wrangler/tmp/pages-vDAo3a/functionsRoutes-0.08133891141619154.mjs
var routes = [
  {
    routePath: "/api/admin/toggle",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/admin/users",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/admin/verify",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/articles",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/newsletter",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/resources",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/sitemap.xml",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  }
];

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
