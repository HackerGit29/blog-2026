-- Add video_metadata jsonb column for storing tutorial metadata (objectives, chapters, resources, etc.)
alter table admin_articles add column if not exists video_metadata jsonb default null;

-- Recreate article_list view to include video_metadata
drop view if exists article_list;
create view article_list as
select
  a.id,
  a.title,
  a.slug,
  a.summary,
  a.content,
  a.image_url,
  a.video_url,
  a.media_type,
  a.tags,
  a.category_id,
  a.reading_time,
  a.featured_order,
  a.published_at,
  a.created_at,
  a.author_id,
  a.video_metadata,
  to_jsonb(c.*) as category,
  jsonb_build_object(
    'user_id', p.user_id,
    'username', p.username,
    'name', p.name,
    'avatar_url', p.avatar_url
  ) as author
from admin_articles a
left join blog_categories c on c.id = a.category_id
left join user_profiles p on p.user_id = a.author_id
where a.is_published = true;

-- Seed video_metadata for existing PowerShell video article
update admin_articles
set video_metadata = '{
  "level": "Débutant",
  "durationText": "15:00",
  "objectives": [
    "Comprendre ce qu''est PowerShell 7 et son rôle dans l''administration système",
    "Maîtriser les cmdlets essentielles et le pipeline objet",
    "Écrire vos premiers scripts d''automatisation",
    "Appliquer les bonnes pratiques de scripting PowerShell"
  ],
  "prerequisites": [
    "Un ordinateur sous Windows 10/11",
    "Des droits administrateur pour installer PowerShell 7",
    "Aucune connaissance prérequise en scripting"
  ],
  "expectedResult": "Capacité à écrire et exécuter des scripts PowerShell pour automatiser des tâches système courantes.",
  "tools": ["PowerShell 7", "VS Code", "PowerShell ISE"],
  "steps": [
    {"id": "1", "title": "Installation de PowerShell 7", "description": "Téléchargez et installez PowerShell 7 depuis GitHub ou le Microsoft Store. Vérifiez l''installation avec la commande $PSVersionTable.", "duration": "3 min"},
    {"id": "2", "title": "Premiers pas avec les cmdlets", "description": "Découvrez les cmdlets essentielles : Get-Command, Get-Help, Get-Process, Get-Service. Apprenez à naviguer dans le système de fichiers avec Set-Location, Get-ChildItem.", "duration": "4 min"},
    {"id": "3", "title": "Maîtriser le pipeline", "description": "Comprenez comment chaîner les cmdlets avec le pipeline (|). Filtrez, triez et formatez la sortie des commandes avec Where-Object, Sort-Object, Select-Object, Format-Table.", "duration": "4 min"},
    {"id": "4", "title": "Écrire votre premier script", "description": "Créez un script .ps1 pour automatiser une tâche : sauvegarde de fichiers, analyse de logs, ou rapport système. Utilisez variables, boucles et conditions.", "duration": "4 min"}
  ],
  "codeSnippets": [
    {"id": "ps-version", "title": "Vérifier la version PowerShell", "language": "powershell", "filename": "check-version.ps1", "code": "$PSVersionTable\n\nGet-Host | Select-Object Version"},
    {"id": "process-list", "title": "Lister les processus par mémoire", "language": "powershell", "filename": "top-processes.ps1", "code": "Get-Process |\n  Where-Object { $_.WorkingSet -gt 100MB } |\n  Sort-Object WorkingSet -Descending |\n  Select-Object Name, Id, @{N=''Memory_MB'';E={[math]::Round($_.WorkingSet/1MB,1)}}"}
  ],
  "resources": [
    {"label": "Documentation officielle PowerShell", "url": "https://learn.microsoft.com/powershell/", "type": "docs"},
    {"label": "Microsoft Learn - PowerShell", "url": "https://learn.microsoft.com/training/paths/powershell/", "type": "learn"},
    {"label": "Code source des exemples", "url": "https://github.com/PowerShell/PowerShell", "type": "github"},
    {"label": "Fiche de référence PowerShell (.pdf)", "url": "#", "type": "file"}
  ],
  "chapters": [
    {"id": "ch-1", "label": "Introduction à PowerShell 7", "time": 0},
    {"id": "ch-2", "label": "Installation et configuration", "time": 60},
    {"id": "ch-3", "label": "Cmdlets et pipeline", "time": 300},
    {"id": "ch-4", "label": "Scripts et automatisation", "time": 540},
    {"id": "ch-5", "label": "Conclusion et prochaines étapes", "time": 800}
  ]
}'::jsonb
where slug = 'debuter-avec-powershell-7-v2' or slug = 'debuter-avec-powershell-7';
