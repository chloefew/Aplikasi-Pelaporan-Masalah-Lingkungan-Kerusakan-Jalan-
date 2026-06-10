-- Postgres + PostGIS schema suggestion

CREATE EXTENSION IF NOT EXISTS postgis;

-- reports table
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  place VARCHAR(255),
  photo_url TEXT,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_reports_geom ON reports USING GIST (geom);

-- groups (aggregated reports)
CREATE TABLE report_groups (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  count INT DEFAULT 0,
  last_report_at TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'low'
);
CREATE INDEX idx_groups_geom ON report_groups USING GIST (geom);

-- mapping reports -> groups
CREATE TABLE group_reports (
  group_id BIGINT REFERENCES report_groups(id) ON DELETE CASCADE,
  report_id BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, report_id)
);

-- Example query: find groups within 50m
-- SELECT * FROM report_groups WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(lon, lat),4326)::geography, 50);
