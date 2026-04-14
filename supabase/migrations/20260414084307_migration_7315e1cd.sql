ALTER TABLE foods ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO foods (name, unit, kcal, fiber, sugar, carbs, fats, protein, salt, is_favorite, user_id) VALUES
  ('Ryža biela varená', 'g', 130, 0.4, 0.1, 28, 0.3, 2.7, 0.01, false, NULL),
  ('Kurča pečené', 'g', 165, 0, 0, 0, 3.6, 31, 0.09, false, NULL),
  ('Brokolica varená', 'g', 35, 2.6, 1.4, 7, 0.4, 2.4, 0.03, false, NULL),
  ('Mrkva surová', 'g', 41, 2.8, 4.7, 10, 0.2, 0.9, 0.07, false, NULL),
  ('Jablko', 'g', 52, 2.4, 10, 14, 0.2, 0.3, 0.01, false, NULL),
  ('Banán', 'g', 89, 2.6, 12, 23, 0.3, 1.1, 0.01, false, NULL),
  ('Jogurt biely', 'ml', 61, 0, 4.7, 4.7, 3.3, 3.5, 0.05, false, NULL),
  ('Mlieko 2.8%', 'ml', 50, 0, 4.8, 4.8, 2.8, 3.4, 0.04, false, NULL),
  ('Chléb celozrnný', 'g', 247, 7, 4.3, 41, 3.4, 13, 1.3, false, NULL),
  ('Vajce varené', 'g', 155, 0, 1.1, 1.1, 11, 13, 0.14, false, NULL),
  ('Šunka údená', 'g', 145, 0, 1, 1.5, 6, 21, 2.3, false, NULL),
  ('Syr Eidam', 'g', 334, 0, 0.5, 1.3, 26, 26, 1.8, false, NULL),
  ('Paradajka', 'g', 18, 1.2, 2.6, 3.9, 0.2, 0.9, 0.01, false, NULL),
  ('Uhorka', 'g', 15, 0.5, 1.7, 3.6, 0.1, 0.7, 0.01, false, NULL),
  ('Olivový olej', 'ml', 884, 0, 0, 0, 100, 0, 0.01, false, NULL),
  ('Cukor biely', 'g', 387, 0, 100, 100, 0, 0, 0, false, NULL),
  ('Med', 'g', 304, 0.2, 82, 82, 0, 0.3, 0.01, false, NULL),
  ('Ovsené vločky', 'g', 389, 10, 1, 66, 7, 17, 0.02, false, NULL),
  ('Káva čierna', 'ml', 2, 0, 0, 0, 0, 0.3, 0, false, NULL),
  ('Čaj zelený', 'ml', 1, 0, 0, 0, 0, 0, 0, false, NULL)
ON CONFLICT DO NOTHING;