-- ============================================================
-- SEED: 6 catégories + 20 articles publiés
-- À exécuter dans le SQL Editor du Dashboard Supabase
-- ============================================================

-- 1. CATÉGORIES
insert into blog_categories (id, name, slug, description, icon, color)
values
  ('11111111-0000-0000-0000-000000000001', 'Technologie',  'technologie',  'Actualités tech, dev, IA et outils numériques', '💻', '#6366f1'),
  ('11111111-0000-0000-0000-000000000002', 'Design',       'design',       'UI/UX, tendances visuelles et créativité',      '🎨', '#ec4899'),
  ('11111111-0000-0000-0000-000000000003', 'Business',     'business',     'Stratégie, entrepreneuriat et marketing',       '📈', '#f59e0b'),
  ('11111111-0000-0000-0000-000000000004', 'Lifestyle',    'lifestyle',    'Bien-être, voyages et culture',                 '✨', '#10b981'),
  ('11111111-0000-0000-0000-000000000005', 'Science',      'science',      'Recherche, découvertes et innovations',         '🔬', '#3b82f6'),
  ('11111111-0000-0000-0000-000000000006', 'Tutoriels',    'tutoriels',    'Guides pratiques et formations pas à pas',      '📚', '#8b5cf6')
on conflict (slug) do nothing;


-- 2. ARTICLES (20 articles, tous publiés)
insert into admin_articles (
  title, slug, summary, content, image_url,
  media_type, tags, category_id,
  meta_description, reading_time, status,
  is_published, featured_order, published_at
)
values

-- TECHNOLOGIE (4 articles)
(
  'L''essor de l''IA générative en 2026',
  'essor-ia-generative-2026',
  'Comment les modèles de langage transforment le développement logiciel et les métiers créatifs.',
  '<p>En 2026, l''intelligence artificielle générative est devenue un pilier incontournable du développement logiciel. Des outils comme Gemini Code Assist, GitHub Copilot ou Cursor révolutionnent la productivité des développeurs.</p>',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'image',
  array['IA', 'Développement', 'LLM', '2026'],
  '11111111-0000-0000-0000-000000000001',
  'Découvrez comment l''IA générative révolutionne le développement en 2026.',
  6, 'published', true, 1,
  now() - interval '1 day'
),
(
  'React 19 : tout ce qui change',
  'react-19-nouveautes',
  'Server Components, Actions, et le nouveau compilateur React — ce qu''il faut savoir.',
  '<p>React 19 marque une rupture significative. Le nouveau compilateur élimine le besoin de useMemo et useCallback dans la plupart des cas.</p>',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  'image',
  array['React', 'JavaScript', 'Frontend', 'TypeScript'],
  '11111111-0000-0000-0000-000000000001',
  'Guide complet des nouveautés React 19 : compilateur, Server Components et Actions.',
  8, 'published', true, 2,
  now() - interval '3 days'
),
(
  'Cloudflare Workers : le edge computing pour tous',
  'cloudflare-workers-edge-computing',
  'Déployer des APIs ultra-rapides sans serveur avec Cloudflare Workers et D1.',
  '<p>Le edge computing n''est plus réservé aux grandes entreprises. Avec Cloudflare Workers, déployez du code dans 300+ points de présence mondiaux en quelques minutes.</p>',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  'image',
  array['Cloudflare', 'Edge', 'Serverless', 'D1'],
  '11111111-0000-0000-0000-000000000001',
  'Apprenez à déployer des APIs edge avec Cloudflare Workers et D1.',
  7, 'published', true, null,
  now() - interval '5 days'
),
(
  'TypeScript 5.5 : les features qui changent tout',
  'typescript-55-nouveautes',
  'Inferred type predicates, config isolation et les améliorations de performance du compilateur.',
  '<p>TypeScript 5.5 apporte des améliorations majeures. L''inférence des type predicates réduit le code boilerplate de validation tout en améliorant la sécurité des types.</p>',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  'image',
  array['TypeScript', 'JavaScript', 'Dev', 'Outils'],
  '11111111-0000-0000-0000-000000000001',
  'Découvrez les nouveautés TypeScript 5.5 et leur impact sur votre code.',
  5, 'published', true, null,
  now() - interval '7 days'
),

-- DESIGN (3 articles)
(
  'Glassmorphism vs Neumorphism en 2026',
  'glassmorphism-vs-neumorphism-2026',
  'Quelle tendance UI domine en 2026 ? Comparatif, cas d''usage et recommandations.',
  '<p>Après quelques années d''hégémonie, le glassmorphism continue de s''imposer dans les interfaces premium, notamment depuis l''introduction du Liquid Glass dans iOS 26.</p>',
  'https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=800',
  'image',
  array['UI', 'Design', 'Tendances', 'CSS'],
  '11111111-0000-0000-0000-000000000002',
  'Glassmorphism ou neumorphism : quelle tendance UI adopter en 2026 ?',
  4, 'published', true, null,
  now() - interval '2 days'
),
(
  'Construire un design system avec Figma et Tokens Studio',
  'design-system-figma-tokens-studio',
  'Du token au composant : méthodologie complète pour un design system scalable.',
  '<p>Un design system bien structuré est le fondement d''une équipe produit efficace. Tokens Studio pour Figma transforme la gestion des design tokens en workflow automatisé.</p>',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  'image',
  array['Figma', 'Design System', 'Tokens', 'UI'],
  '11111111-0000-0000-0000-000000000002',
  'Guide complet pour créer un design system scalable avec Figma et Tokens Studio.',
  9, 'published', true, null,
  now() - interval '9 days'
),
(
  'L''accessibilité WCAG 3.0 : guide pratique',
  'wcag-3-guide-pratique',
  'Nouveaux critères, APCA et méthodes de test : tout ce que les designers doivent savoir.',
  '<p>WCAG 3.0 introduit un nouveau modèle de conformité plus nuancé. Le contraste est désormais évalué avec l''algorithme APCA, bien plus proche de la perception humaine réelle.</p>',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
  'image',
  array['Accessibilité', 'WCAG', 'UX', 'Design'],
  '11111111-0000-0000-0000-000000000002',
  'Maîtrisez WCAG 3.0 et APCA pour créer des interfaces accessibles à tous.',
  6, 'published', true, null,
  now() - interval '12 days'
),

-- BUSINESS (4 articles)
(
  'Le growth hacking est mort, vive le product-led growth',
  'product-led-growth-vs-growth-hacking',
  'Pourquoi les startups abandonnent les hacks de croissance au profit d''une stratégie produit solide.',
  '<p>Le growth hacking a eu ses heures de gloire, mais en 2026, les entreprises qui performent misent sur le product-led growth. Le produit lui-même devient le principal vecteur d''acquisition.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'image',
  array['Growth', 'PLG', 'Startup', 'Stratégie'],
  '11111111-0000-0000-0000-000000000003',
  'Découvrez pourquoi le product-led growth surpasse le growth hacking en 2026.',
  5, 'published', true, 3,
  now() - interval '4 days'
),
(
  'Comment lever des fonds en 2026 : ce qui a changé',
  'lever-fonds-2026-guide',
  'Traction, narration et nouveaux profils d''investisseurs : le guide actualisé des fondateurs.',
  '<p>L''écosystème de la levée de fonds a profondément évolué. Les investisseurs sont plus exigeants sur la rentabilité, même en early stage. La traction réelle prime sur les projections.</p>',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800',
  'image',
  array['Levée de fonds', 'Startup', 'VC', 'Finance'],
  '11111111-0000-0000-0000-000000000003',
  'Guide complet pour lever des fonds en 2026 : métriques, pitch et nouveaux investisseurs.',
  7, 'published', true, null,
  now() - interval '6 days'
),
(
  'Marketing de contenu vs SEO programmatique',
  'marketing-contenu-vs-seo-programmatique',
  'Deux approches radicalement différentes pour dominer les résultats de recherche.',
  '<p>Le SEO programmatique génère automatiquement des milliers de pages ciblant des requêtes longue traîne. Le marketing de contenu mise sur la profondeur et l''autorité.</p>',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
  'image',
  array['SEO', 'Marketing', 'Contenu', 'Croissance'],
  '11111111-0000-0000-0000-000000000003',
  'Comparatif marketing de contenu vs SEO programmatique : quelle stratégie adopter ?',
  6, 'published', true, null,
  now() - interval '11 days'
),
(
  'L''automatisation no-code qui remplace une équipe entière',
  'automatisation-no-code-equipe',
  'Make, n8n et Zapier : comment une startup de 3 personnes opère à l''échelle d''une PME.',
  '<p>Les outils no-code d''automatisation ont atteint une maturité qui permet à de très petites équipes d''opérer des processus complexes sans développeur dédié.</p>',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800',
  'image',
  array['No-code', 'Automatisation', 'n8n', 'Productivité'],
  '11111111-0000-0000-0000-000000000003',
  'Automatisez votre startup avec n8n, Make et Zapier : guide pratique 2026.',
  8, 'published', true, null,
  now() - interval '14 days'
),

-- LIFESTYLE (3 articles)
(
  'Remote work en 2026 : les nouvelles règles du jeu',
  'remote-work-2026-nouvelles-regles',
  'Asynchrone, retreats et droit à la déconnexion : comment les équipes distribuées fonctionnent vraiment.',
  '<p>Après plusieurs années d''adoption, le travail à distance a trouvé ses codes. Les entreprises qui performent ont développé une culture de l''asynchrone qui respecte les fuseaux horaires.</p>',
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=800',
  'image',
  array['Remote', 'Travail', 'Productivité', 'Lifestyle'],
  '11111111-0000-0000-0000-000000000004',
  'Les meilleures pratiques du travail à distance en 2026 pour les équipes distribuées.',
  5, 'published', true, null,
  now() - interval '8 days'
),
(
  'Minimalisme digital : reprendre le contrôle de son attention',
  'minimalisme-digital-attention',
  'Stratégies concrètes pour vivre avec la technologie sans en être esclave.',
  '<p>À l''heure des notifications infinies et du scroll compulsif, le minimalisme digital n''est plus un luxe mais une nécessité. Il s''agit de choisir la technologie intentionnellement.</p>',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  'image',
  array['Minimalisme', 'Digital', 'Bien-être', 'Focus'],
  '11111111-0000-0000-0000-000000000004',
  'Comment pratiquer le minimalisme digital et reprendre le contrôle de votre attention.',
  4, 'published', true, null,
  now() - interval '15 days'
),
(
  'Tokyo en 10 jours : itinéraire pour les passionnés de tech',
  'tokyo-10-jours-itineraire-tech',
  'Akihabara, Shibuya et musées du futur : le guide Tokyo pour les geeks voyageurs.',
  '<p>Tokyo est la capitale mondiale de la culture tech-lifestyle. Entre les étages entiers de composants électroniques d''Akihabara, les robots serveurs et le musée TeamLab, la ville offre une expérience unique.</p>',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'image',
  array['Tokyo', 'Voyage', 'Tech', 'Culture'],
  '11111111-0000-0000-0000-000000000004',
  'Itinéraire Tokyo 10 jours pour passionnés de tech : Akihabara, TeamLab et plus.',
  7, 'published', true, null,
  now() - interval '20 days'
),

-- SCIENCE (3 articles)
(
  'Fusion nucléaire : où en est-on vraiment ?',
  'fusion-nucleaire-etat-avancement-2026',
  'Bilan des avancées réelles, des délais et des investissements privés dans la fusion.',
  '<p>La fusion nucléaire reste une promesse fascinante mais les récentes annonces méritent une analyse critique. Les progrès sont réels mais l''énergie nette commerciale reste encore éloignée.</p>',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  'image',
  array['Fusion', 'Énergie', 'Science', 'Innovation'],
  '11111111-0000-0000-0000-000000000005',
  'État des lieux de la fusion nucléaire en 2026 : progrès réels et calendrier réaliste.',
  8, 'published', true, null,
  now() - interval '10 days'
),
(
  'Biologie synthétique : quand le code rencontre l''ADN',
  'biologie-synthetique-code-adn',
  'Comment les principes du génie logiciel révolutionnent la conception du vivant.',
  '<p>La biologie synthétique emprunte ses paradigmes à l''informatique : abstraction, modularité, standardisation. Les biobricks sont aux biologistes ce que les composants React sont aux développeurs.</p>',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800',
  'image',
  array['Biotech', 'ADN', 'Science', 'Innovation'],
  '11111111-0000-0000-0000-000000000005',
  'La biologie synthétique expliquée : du code informatique à la conception du vivant.',
  6, 'published', true, null,
  now() - interval '18 days'
),
(
  'Le microbiome : le deuxième cerveau qu''on commence à comprendre',
  'microbiome-deuxieme-cerveau',
  'Axe intestin-cerveau, probiotiques et nouvelles thérapies : ce que la science dit vraiment.',
  '<p>La relation entre microbiome intestinal et santé mentale est désormais solidement étayée. L''axe intestin-cerveau influence l''humeur, la cognition et même la susceptibilité aux maladies neurologiques.</p>',
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
  'image',
  array['Santé', 'Microbiome', 'Nutrition', 'Science'],
  '11111111-0000-0000-0000-000000000005',
  'Comprendre le microbiome et l''axe intestin-cerveau : guide scientifique accessible.',
  5, 'published', true, null,
  now() - interval '22 days'
),

-- TUTORIELS (3 articles)
(
  'Supabase de zéro à héros : auth, RLS et Edge Functions',
  'supabase-zero-heros-auth-rls',
  'Construire une app full-stack sécurisée avec Supabase en moins d''une journée.',
  '<p>Supabase est la plateforme backend qui permet aux développeurs frontend de construire des applications complètes sans gérer d''infrastructure. Ce tutoriel couvre l''authentification, la sécurité RLS et les Edge Functions.</p>',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800',
  'image',
  array['Supabase', 'Tutorial', 'Auth', 'Backend'],
  '11111111-0000-0000-0000-000000000006',
  'Tutoriel complet Supabase : authentification, RLS et Edge Functions de A à Z.',
  12, 'published', true, null,
  now() - interval '13 days'
),
(
  'Animations GSAP avancées dans React',
  'gsap-animations-react-avancees',
  'ScrollTrigger, timeline et morphing SVG : maîtrisez GSAP dans vos projets React.',
  '<p>GSAP reste la référence pour les animations web performantes. Son intégration dans React demande quelques patterns spécifiques pour éviter les memory leaks et les problèmes de cycle de vie des composants.</p>',
  'https://images.unsplash.com/photo-1550063873-ab792950096b?w=800',
  'image',
  array['GSAP', 'React', 'Animation', 'Frontend'],
  '11111111-0000-0000-0000-000000000006',
  'Maîtrisez les animations GSAP dans React : ScrollTrigger, timeline et SVG morphing.',
  10, 'published', true, null,
  now() - interval '16 days'
),
(
  'Déployer avec GitHub Actions + Cloudflare Pages',
  'deployer-github-actions-cloudflare-pages',
  'CI/CD complet de zéro : build, tests, preview et production en 30 minutes.',
  '<p>GitHub Actions et Cloudflare Pages forment le duo parfait pour un CI/CD moderne sans infrastructure à gérer. Ce tutoriel guide de la configuration initiale jusqu''au déploiement automatique en production.</p>',
  'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
  'image',
  array['CI/CD', 'GitHub Actions', 'Cloudflare', 'DevOps'],
  '11111111-0000-0000-0000-000000000006',
  'Tutoriel CI/CD complet avec GitHub Actions et Cloudflare Pages : de zéro à la production.',
  11, 'published', true, null,
  now() - interval '25 days'
);

-- Vérification finale
select
  c.name as categorie,
  count(a.id) as nb_articles
from blog_categories c
left join admin_articles a on a.category_id = c.id
group by c.name
order by c.name;
