CREATE TABLE equipment (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  type        VARCHAR(50) NOT NULL,
  location    VARCHAR(50) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'RUNNING'
              CHECK (status IN ('RUNNING','IDLE','ALARM','MAINTENANCE'))
);

CREATE TABLE sensor_log (
  id            BIGSERIAL PRIMARY KEY,
  equipment_id  INT NOT NULL REFERENCES equipment(id),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature   NUMERIC(6,2),
  pressure      NUMERIC(8,4),
  throughput    NUMERIC(6,2)
);

CREATE INDEX idx_sensor_log_equipment_time
  ON sensor_log (equipment_id, recorded_at DESC);
