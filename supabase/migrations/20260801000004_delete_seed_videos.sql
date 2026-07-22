-- Delete the seeded demo video articles (cleaning up before fresh start)
delete from admin_articles where slug in ('debuter-avec-powershell-7', 'debuter-avec-powershell-7-v2');
