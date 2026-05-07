-- Add 'archivado' state to temas and controlled RPC to archive topics.

ALTER TYPE estado_tema ADD VALUE IF NOT EXISTS 'archivado';

CREATE OR REPLACE FUNCTION archivar_tema_controlado(p_tema_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_actor_id uuid;
  v_actor    perfiles%ROWTYPE;
  v_tema     temas%ROWTYPE;
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  SELECT * INTO v_actor FROM perfiles WHERE user_id = v_actor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil no encontrado.';
  END IF;

  IF v_actor.rol_sistema NOT IN ('administrador', 'fundador') THEN
    RAISE EXCEPTION 'Solo administradores o fundadores pueden archivar temas.';
  END IF;

  IF v_actor.estado <> 'activo' OR v_actor.tipo_miembro <> 'afiliado' THEN
    RAISE EXCEPTION 'Perfil no activo o no afiliado.';
  END IF;

  SELECT * INTO v_tema FROM temas WHERE id = p_tema_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tema no encontrado.';
  END IF;

  IF v_tema.estado NOT IN ('cerrado', 'anulado') THEN
    RAISE EXCEPTION 'Solo se pueden archivar temas cerrados o anulados.';
  END IF;

  UPDATE temas
  SET estado = 'archivado', actualizado_en = now()
  WHERE id = p_tema_id;

  INSERT INTO audit_log (actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  VALUES (
    v_actor.id,
    NULL,
    'archivar_tema',
    'temas',
    p_tema_id,
    jsonb_build_object('estado', v_tema.estado),
    jsonb_build_object('estado', 'archivado')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION archivar_tema_controlado(uuid) TO authenticated;
