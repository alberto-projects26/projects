-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE missions;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
ALTER PUBLICATION supabase_realtime ADD TABLE action_plans;

-- Optional: Enable for all tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE ALL TABLES;
