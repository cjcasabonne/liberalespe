DO $$
DECLARE v_exists int;
BEGIN
  SELECT COUNT(*) INTO v_exists FROM generated_topic_batches WHERE batch_code = 'qgen_20260611102416_dd981d87';
  IF v_exists > 0 THEN RAISE EXCEPTION 'batch_already_exists: qgen_20260611102416_dd981d87'; END IF;
  INSERT INTO generated_topic_batches (batch_code, source, status, expected_count, notes, created_at)
  VALUES ('qgen_20260611102416_dd981d87', 'qgen_v6', 'pending', 80, 'Generado por qgen v6', now());
END $$;