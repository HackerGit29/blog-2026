import { onRequest as __api_articles_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\articles.ts"
import { onRequest as __api_newsletter_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\api\\newsletter.ts"
import { onRequest as __sitemap_xml_ts_onRequest } from "C:\\Users\\paoss\\Desktop\\blog\\functions\\sitemap.xml.ts"

export const routes = [
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
      routePath: "/sitemap.xml",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__sitemap_xml_ts_onRequest],
    },
  ]