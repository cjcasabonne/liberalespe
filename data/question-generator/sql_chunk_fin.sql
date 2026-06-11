DO $$
DECLARE v_inserted int; v_dup int; v_batch_id uuid;
BEGIN
  SELECT id INTO v_batch_id FROM generated_topic_batches WHERE batch_code = 'qgen_20260611102416_dd981d87';
  SELECT COUNT(*) INTO v_inserted FROM generated_topic_candidates WHERE batch_id = v_batch_id;
  IF v_inserted <> 80 THEN RAISE EXCEPTION 'conteo_invalido: % esperados 80', v_inserted; END IF;
  SELECT COUNT(*) INTO v_dup FROM (SELECT duplicate_fingerprint FROM generated_topic_candidates WHERE batch_id = v_batch_id GROUP BY duplicate_fingerprint HAVING COUNT(*) > 1) d;
  IF v_dup > 0 THEN RAISE EXCEPTION 'duplicados_detectados: %', v_dup; END IF;
  UPDATE generated_topic_batches SET status = 'loaded', inserted_count = v_inserted, updated_at = now() WHERE id = v_batch_id;
END $$;