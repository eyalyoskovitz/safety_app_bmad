-- Add sample plant locations for testing
-- These are realistic Hebrew plant area names

INSERT INTO plant_locations (name, name_he, is_active) VALUES
  ('Production Line 1', 'פס ייצור 1', true),
  ('Production Line 2', 'פס ייצור 2', true),
  ('Raw Materials Warehouse', 'מחסן חומרי גלם', true),
  ('Finished Goods Warehouse', 'מחסן מוצרים מוגמרים', true),
  ('Packaging Area', 'אזור אריזה', true),
  ('Maintenance Workshop', 'בית מלאכה תחזוקה', true),
  ('Loading Dock', 'רציף הטענה', true),
  ('Office Area', 'אזור משרדים', true),
  ('Cafeteria', 'קפיטריה', true),
  ('Parking Lot', 'חניה', true)
ON CONFLICT DO NOTHING;
