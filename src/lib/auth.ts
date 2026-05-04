export function normalizeDni(dni: string) {
  return dni.replace(/\D/g, '').slice(0, 8);
}

export function maskDni(dni: string | null | undefined) {
  const normalized = normalizeDni(dni ?? '');

  if (normalized.length !== 8) {
    return 'DNI no disponible';
  }

  return `****${normalized.slice(-4)}`;
}

export function isValidDni(dni: string) {
  return /^[0-9]{8}$/.test(dni);
}

export function dniToAuthEmail(dni: string) {
  return `dni-${dni}@liberalespe.example.com`;
}

export function legacyDniToAuthEmail(dni: string) {
  return `dni-${dni}@auth.local`;
}
