-- Seed default Microsoft resources for the admin tenant
-- These are the curated learning paths and tools every student needs

do $$
declare
  admin_uid uuid := 'b329b877-bff0-47ae-8dac-c6c128000424';
  sort int := 1;
begin

-- ── Plans Microsoft Learn ──────────────────────────────────────
insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'AI Skills Navigator', 'Parcours personnalisé pour maîtriser l''IA avec Microsoft. Découvrez votre niveau et progressez à votre rythme.', 'https://aiskillsnavigator.microsoft.com/', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — IA Fondamentale', 'Plan officiel pour comprendre les bases de l''IA générative, des modèles de langage et du Machine Learning.', 'https://learn.microsoft.com/en-gb/training/paths/get-started-ai-fundamentals/?wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Copilot Studio', 'Apprenez à créer des agents conversationnels personnalisés sans code avec Microsoft Copilot Studio.', 'https://learn.microsoft.com/en-gb/training/paths/build-copilot-studio/?wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Azure Basics', 'Les fondamentaux du cloud Azure : computing, stockage, réseau et sécurité.', 'https://learn.microsoft.com/en-gb/training/paths/microsoft-azure-fundamentals/?wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Power Platform', 'Automatisez vos processus avec Power Automate, Power Apps et Power BI.', 'https://learn.microsoft.com/en-gb/training/paths/create-power-automate/?wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — DevOps & GitHub', 'Maîtrisez CI/CD, GitHub Actions et l''intégration continue avec Azure DevOps.', 'https://learn.microsoft.com/en-gb/training/paths/build-first-workflow-github-actions/?wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

-- ── Plans avec SharingId (liens contributeur) ──────────────────
insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Foundry — Débutant', 'Découvrez Microsoft Foundry, la plateforme unifiée pour créer et gérer des applications d''IA générative.', 'https://learn.microsoft.com/en-gb/plans/yj18hetdg5qj1w?tab=tab-challenges&sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'flask', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Foundry — Intermédiaire', 'Approfondissez vos compétences Foundry : fine-tuning, RAG, et déploiement de modèles personnalisés.', 'https://learn.microsoft.com/en-gb/plans/w4odiztn5y2m28?sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'flask', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Foundry — Avancé', 'Plans avancés : évaluation de modèles, gestion des coûts et architecture d''entreprise avec Foundry.', 'https://learn.microsoft.com/en-gb/plans/gw4ei3t1kx8nj0?sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'flask', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Azure AI Engineer', 'Parcours certifiant pour devenir Azure AI Engineer Associate (AI-102).', 'https://learn.microsoft.com/en-gb/plans/8xz2cztqz2w5wr?sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Data & IA', 'Plans complets pour le data engineering et l''IA avec Azure Databricks, Synapse et Fabric.', 'https://learn.microsoft.com/en-gb/plans/m2w7i7tnr57qy?sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'graduation-cap', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn — Sécurité & Conformité', 'Protégez vos applications et données avec Azure Security, Defender et Purview.', 'https://learn.microsoft.com/en-gb/plans/1207iotdjg3j3?sharingId=D2BFCB8C6DBBED27&wt.mc_id=studentamb_516195', 'learn', 'shield', sort); sort := sort + 1;

-- ── Plateformes et outils ──────────────────────────────────────
insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Azure for Students', 'Crédit gratuit de 100$ + services Azure gratuits, sans carte bancaire. Inclus avec un compte étudiant.', 'https://azure.microsoft.com/fr-fr/free/students/?wt.mc_id=studentamb_516195', 'platform', 'cloud', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Azure for Students — Démarrer', 'Guide pas à pas pour activer votre abonnement Azure for Students et déployer votre première ressource.', 'https://learn.microsoft.com/fr-fr/azure/education-hub/azure-dev-tools-teaching/program-faq?wt.mc_id=studentamb_516195', 'platform', 'cloud', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft 365 Copilot', 'Votre assistant IA au quotidien dans Word, Excel, PowerPoint, Teams et Outlook.', 'https://www.microsoft.com/fr-fr/microsoft-365/copilot?wt.mc_id=studentamb_516195', 'tool', 'sparkles', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'GitHub Student Developer Pack', 'Accès gratuit aux meilleurs outils de développement : GitHub Copilot, Azure, JetBrains et plus.', 'https://education.github.com/pack?wt.mc_id=studentamb_516195', 'tool', 'github', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Fabric', 'La plateforme unifiée d''analytique pour ingénierie des données, BI et data science.', 'https://www.microsoft.com/fr-fr/microsoft-fabric?wt.mc_id=studentamb_516195', 'platform', 'bar-chart', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Visual Studio Enterprise', 'IDE complet pour le développement .NET, C#, Python et web. Gratuit pour les étudiants.', 'https://visualstudio.microsoft.com/fr/vs/enterprise/?wt.mc_id=studentamb_516195', 'tool', 'code', sort); sort := sort + 1;

-- ── Communauté et carrière ─────────────────────────────────────
insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Student Ambassadors', 'Rejoignez la communauté mondiale des étudiants ambassadeurs Microsoft. Build skills, host events, lead.', 'https://mvp.microsoft.com/studentambassadors?wt.mc_id=studentamb_516195', 'community', 'users', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Imagine Cup', 'Le plus grand concours startup étudiant au monde. Présentez votre projet et gagnez des prix.', 'https://imaginecup.microsoft.com/?wt.mc_id=studentamb_516195', 'community', 'trophy', sort); sort := sort + 1;

insert into tenant_resources (user_id, title, description, url, category, icon, sort_order) values
(admin_uid, 'Microsoft Learn Student Hub', 'Le point d''entrée unique pour tous les parcours d''apprentissage étudiants Microsoft.', 'https://learn.microsoft.com/fr-fr/training/student-hub/?wt.mc_id=studentamb_516195', 'community', 'graduation-cap', sort); sort := sort + 1;

end $$;
