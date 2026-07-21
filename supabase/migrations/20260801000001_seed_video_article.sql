-- Insert a demo video article for tenant mopaossi
insert into admin_articles (
  title, slug, summary, content, image_url,
  video_url, media_type, tags, category_id,
  meta_description, reading_time, status,
  is_published, published_at, author_id
) values (
  'Débuter avec PowerShell 7',
  'debuter-avec-powershell-7-v2',
  'Apprenez les bases de PowerShell 7 : cmdlets, pipeline, scripting et automatisation système.',
  '<p>PowerShell 7 est un outil incontournable pour tout administrateur système et développeur sur Windows. Dans ce tutoriel vidéo complet, nous explorons :</p><ul><li>Les cmdlets essentielles à connaître</li><li>Le pipeline objet et son fonctionnement</li><li>L''écriture de vos premiers scripts</li><li>L''automatisation de tâches système</li><li>Les bonnes pratiques de scripting</li></ul><p>Que vous soyez débutant ou que vous cherchiez à structurer vos connaissances, cette vidéo vous donnera les bases solides pour maîtriser PowerShell 7.</p>',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800',
  'https://www.youtube.com/watch?v=ZOo0UZAGhJY',
  'video',
  array['PowerShell', 'Windows', 'Script', 'Automatisation'],
  '11111111-0000-0000-0000-000000000006',
  'Tutoriel PowerShell 7 pour débutants : cmdlets, pipeline et scripts d''automatisation.',
  15,
  'published',
  true,
  now(),
  'b329b877-bff0-47ae-8dac-c6c128000424'
);
