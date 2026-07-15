insert into user_roles (user_id, role) values ('b329b877-bff0-47ae-8dac-c6c128000424', 'admin') on conflict (user_id) do update set role = 'admin';
