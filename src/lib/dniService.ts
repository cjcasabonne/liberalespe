type BuscarDniOk = {
  ok: true;
  nombreCompleto: string;
};

type BuscarDniFail = {
  ok: false;
  reason: 'timeout' | 'rate_limit' | 'error' | 'degraded';
};

type BuscarDniResult = BuscarDniOk | BuscarDniFail;
type InternalBuscarDniResult = BuscarDniResult & {
  retryable?: boolean;
};

const dniServiceUrl = import.meta.env.VITE_DNI_SERVICE_URL ?? 'https://busqueda-dni.onrender.com';
const defaultTimeoutMs = 12000;
const warmupDelayMs = 13000;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readNombreCompleto(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;
  const source = typeof record.result === 'object' && record.result ? (record.result as Record<string, unknown>) : record;
  const directName = source.nombreCompleto ?? source.nombres_completos ?? source.nombre_completo;

  if (typeof directName === 'string' && directName.trim()) {
    return directName.trim();
  }

  const parts = [source.nombres, source.apellidoPaterno, source.apellidoMaterno, source.apellido_paterno, source.apellido_materno]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  return parts.join(' ').trim();
}

async function requestDni(dni: string, timeoutMs: number): Promise<InternalBuscarDniResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${dniServiceUrl.replace(/\/$/, '')}/api/buscar-dni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dni }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      return { ok: false, reason: 'rate_limit' };
    }

    if (!response.ok) {
      return { ok: false, reason: 'error', retryable: response.status >= 500 };
    }

    const payload: unknown = await response.json();
    const nombreCompleto = readNombreCompleto(payload);

    if (!nombreCompleto) {
      return { ok: false, reason: 'degraded' };
    }

    return { ok: true, nombreCompleto };
  } catch (requestError) {
    if (requestError instanceof DOMException && requestError.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }

    return { ok: false, reason: 'error', retryable: true };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function buscarDni(dni: string, timeoutMs = defaultTimeoutMs): Promise<BuscarDniResult> {
  const warmupResult = await requestDni(dni, timeoutMs);

  if (!warmupResult.ok && warmupResult.reason === 'rate_limit') {
    return warmupResult;
  }

  await wait(warmupDelayMs);

  return requestDni(dni, timeoutMs);
}
