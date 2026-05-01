export function normalizeDni(dni: string) {
  return dni.replace(/\D/g, '').slice(0, 8);
}

export function isValidDni(dni: string) {
  return /^[0-9]{8}$/.test(dni);
}

export function dniToAuthEmail(dni: string) {
  return `dni-${dni}@liberalespe.example.com`;
}
