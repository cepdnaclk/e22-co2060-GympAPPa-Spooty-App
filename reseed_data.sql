-- Clear existing seed data
DELETE FROM sport_equipment;
DELETE FROM equipment;
DELETE FROM sports;

-- Insert correct seed data (in correct order: sports first, then equipment, then sport_equipment)
INSERT INTO sports (name) VALUES ('Badminton'), ('Baseball'), ('Basketball'), ('Boxing'), ('Chess'), ('Cricket'), ('Elle'), ('Football'), ('Hockey'), ('Rugby'), ('Table Tennis'), ('Tennis'), ('Track & Field'), ('Volleyball');

INSERT INTO equipment (name) VALUES ('Bat'), ('Ball'), ('Racket'), ('Shuttlecock'), ('Gloves'), ('Shoes'), ('Uniform'), ('Pad'), ('Helmet'), ('Javelin'), ('Shot Put'), ('Clock');

INSERT INTO sport_equipment (sport_id, equipment_id, display_name, total_quantity, remaining_quantity)
SELECT s.id, e.id, se.display_name, se.total_quantity, se.remaining_quantity
FROM (VALUES
  ('Cricket', 'Bat', 'Cricket Bat', 6, 6),
  ('Cricket', 'Ball', 'Cricket Ball', 10, 10),
  ('Baseball', 'Bat', 'Baseball Bat', 6, 6),
  ('Baseball', 'Ball', 'Baseball', 10, 10),
  ('Basketball', 'Ball', 'Basketball', 6, 6),
  ('Tennis', 'Racket', 'Tennis Racket', 8, 8),
  ('Tennis', 'Ball', 'Tennis Ball', 20, 20),
  ('Table Tennis', 'Racket', 'Table Tennis Racket', 10, 10),
  ('Table Tennis', 'Ball', 'Table Tennis Ball', 20, 20),
  ('Badminton', 'Racket', 'Badminton Racket', 10, 10),
  ('Badminton', 'Shuttlecock', 'Shuttlecock', 20, 20),
  ('Volleyball', 'Ball', 'Volleyball', 6, 6),
  ('Football', 'Ball', 'Football', 6, 6),
  ('Rugby', 'Ball', 'Rugby Ball', 4, 4),
  ('Hockey', 'Ball', 'Hockey Ball', 10, 10),
  ('Elle', 'Ball', 'Elle Ball', 6, 6),
  ('Chess', 'Pad', 'Chess Board', 5, 5),
  ('Elle', 'Bat', 'Elle Bat', 10, 10),
  ('Hockey', 'Bat', 'Hockey Bat', 10, 10),
  ('Boxing', 'Gloves', 'Boxing Gloves', 10, 10),
  ('Track & Field', 'Javelin', 'Javelin', 10, 10),
  ('Track & Field', 'Shot Put', 'Shot Put', 10, 10),
  ('Chess', 'Clock', 'Chess Clock', 10, 10)
) AS se(sport_name, equipment_name, display_name, total_quantity, remaining_quantity)
JOIN sports s ON s.name = se.sport_name
JOIN equipment e ON e.name = se.equipment_name;