INSERT INTO equipment (name, type, location, status) VALUES
  ('EQ-001', 'CVD',         'Bay-A', 'RUNNING'),
  ('EQ-002', 'Etcher',      'Bay-A', 'RUNNING'),
  ('EQ-003', 'CMP',         'Bay-A', 'IDLE'),
  ('EQ-004', 'CVD',         'Bay-B', 'ALARM'),
  ('EQ-005', 'Lithography', 'Bay-B', 'RUNNING'),
  ('EQ-006', 'Etcher',      'Bay-B', 'MAINTENANCE'),
  ('EQ-007', 'CMP',         'Bay-C', 'RUNNING'),
  ('EQ-008', 'CVD',         'Bay-C', 'RUNNING'),
  ('EQ-009', 'Diffusion',   'Bay-C', 'IDLE'),
  ('EQ-010', 'Inspection',  'Bay-C', 'RUNNING'),
  ('EQ-011', 'CVD',         'Bay-D', 'RUNNING'),
  ('EQ-012', 'Etcher',      'Bay-D', 'ALARM'),
  ('EQ-013', 'CMP',         'Bay-D', 'RUNNING'),
  ('EQ-014', 'Lithography', 'Bay-D', 'RUNNING'),
  ('EQ-015', 'Diffusion',   'Bay-E', 'MAINTENANCE'),
  ('EQ-016', 'Inspection',  'Bay-E', 'RUNNING'),
  ('EQ-017', 'CVD',         'Bay-E', 'RUNNING'),
  ('EQ-018', 'Etcher',      'Bay-E', 'IDLE'),
  ('EQ-019', 'CMP',         'Bay-F', 'RUNNING'),
  ('EQ-020', 'Lithography', 'Bay-F', 'RUNNING');

DO $$
DECLARE
  eq_id INT;
  i     INT;
  base_temp   NUMERIC;
  base_press  NUMERIC;
  base_thru   NUMERIC;
BEGIN
  FOR eq_id IN 1..20 LOOP
    base_temp  := 200 + (eq_id * 7.3);
    base_press := 1.0 + (eq_id * 0.05);
    base_thru  := 10 + (eq_id * 1.2);
    FOR i IN 1..25000 LOOP
      INSERT INTO sensor_log (equipment_id, recorded_at, temperature, pressure, throughput)
      VALUES (
        eq_id,
        NOW() - (INTERVAL '90 days' * random()),
        ROUND(CAST(base_temp  + (random() * 10 - 5)  AS NUMERIC), 2),
        ROUND(CAST(base_press + (random() * 0.2 - 0.1) AS NUMERIC), 4),
        ROUND(CAST(base_thru  + (random() * 4 - 2)   AS NUMERIC), 2)
      );
    END LOOP;
  END LOOP;
END $$;
