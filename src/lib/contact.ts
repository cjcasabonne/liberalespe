const contactMessage = `Hola,

Te escribimos desde Liberales PE para darte la bienvenida y continuar tu proceso dentro del partido.

Quedamos atentos a cualquier consulta.

Saludos,
Equipo Liberales PE`;

export function buildMailtoLink(email: string, subject = 'Bienvenida a Liberales PE', message = contactMessage): string {

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function buildWhatsAppLink(phone: string, message = contactMessage): string {
  const digits = phone.replace(/\D/g, '');
  const peruvianPhone = digits.startsWith('51') ? digits : `51${digits}`;

  return `https://wa.me/${peruvianPhone}?text=${encodeURIComponent(message)}`;
}
