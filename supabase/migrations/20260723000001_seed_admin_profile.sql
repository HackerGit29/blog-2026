-- Seed admin profile with username 'mopaossi'
-- This ensures the tenant resources are linked to a valid user_id with a matching username

insert into user_profiles (user_id, name, title, location, username, followers, following, likes)
values (
  'b329b877-bff0-47ae-8dac-c6c128000424',
  'Mopaossi',
  'Software Developer & Microsoft Community Contributor',
  'Based on Earth, connected to the cloud.',
  'mopaossi',
  '0',
  '0',
  '0'
)
on conflict (user_id) do update set
  name = 'Mopaossi',
  title = 'Software Developer & Microsoft Community Contributor',
  location = 'Based on Earth, connected to the cloud.',
  username = 'mopaossi';
