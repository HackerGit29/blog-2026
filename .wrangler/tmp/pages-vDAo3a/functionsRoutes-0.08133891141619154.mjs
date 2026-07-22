import { onRequest as __api_admin_toggle_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\admin\\toggle.ts"
import { onRequest as __api_admin_users_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\admin\\users.ts"
import { onRequest as __api_admin_verify_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\admin\\verify.ts"
import { onRequest as __api_articles_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\articles.ts"
import { onRequest as __api_newsletter_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\newsletter.ts"
import { onRequest as __api_resources_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\resources.ts"
import { onRequest as __sitemap_xml_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\sitemap.xml.ts"

export const routes = [
    {
      routePath: "/api/admin/toggle",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_toggle_ts_onRequest],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_users_ts_onRequest],
    },
  {
      routePath: "/api/admin/verify",
      mountPath: "/api/admin",
      method: "",
      middlewares: [],
      modules: [__api_admin_verify_ts_onRequest],
    },
  {
      routePath: "/api/articles",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_articles_ts_onRequest],
    },
  {
      routePath: "/api/newsletter",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_newsletter_ts_onRequest],
    },
  {
      routePath: "/api/resources",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_resources_ts_onRequest],
    },
  {
      routePath: "/sitemap.xml",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__sitemap_xml_ts_onRequest],
    },
  ]