-- Seed sports and sport_equipment with default inventory for GympAPPa

INSERT INTO sports (name) VALUES
  ('Badminton'),
  ('Basketball'),
  ('Cricket'),
  ('Football'),
  ('Hockey'),
  ('Netball'),
  ('Rugby'),
  ('Table Tennis'),
  ('Tennis'),
  ('Volleyball'),
  ('Baseball'),
  ('Elle')
ON CONFLICT (name) DO NOTHING;

WITH equipment_rows AS (
  VALUES
    ('Badminton', 'Badminton Racket', 15, 15),
    ('Badminton', 'Shuttlecock (tube)', 20, 20),
    ('Basketball', 'Basketball', 8, 8),
    ('Cricket', 'Cricket Bat', 8, 8),
    ('Cricket', 'Cricket Ball', 10, 10),
    ('Football', 'Football', 10, 10),
    ('Hockey', 'Hockey Stick', 10, 10),
    ('Hockey', 'Hockey Ball', 10, 10),
    ('Netball', 'Netball', 6, 6),
    ('Rugby', 'Rugby Ball', 5, 5),
    ('Table Tennis', 'Table Tennis Bat', 12, 12),
    ('Table Tennis', 'Table Tennis Ball', 30, 30),
    ('Tennis', 'Tennis Racket', 8, 8),
    ('Tennis', 'Tennis Ball', 20, 20),
    ('Volleyball', 'Volleyball', 6, 6),
    ('Baseball', 'Baseball Bat', 4, 4),
    ('Baseball', 'Baseball', 10, 10),
    ('Elle', 'Elle Bat', 6, 6)
)
INSERT INTO sport_equipment (sport_id, display_name, total_quantity, remaining_quantity)
SELECT s.id, e.display_name, e.total_quantity, e.remaining_quantity
FROM equipment_rows AS e(sport_name, display_name, total_quantity, remaining_quantity)
JOIN sports s ON s.name = e.sport_name
WHERE NOT EXISTS (
  SELECT 1
  FROM sport_equipment se
  WHERE se.sport_id = s.id
    AND se.display_name = e.display_name
);
