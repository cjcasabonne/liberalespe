import { buildMailtoLink, buildWhatsAppLink } from './lib/contact';

type ContactActionsProps = {
  email?: string | null;
  phone?: string | null;
};

export function ContactActions({ email, phone }: ContactActionsProps) {
  if (!email && !phone) {
    return null;
  }

  return (
    <div className="contact-actions">
      {email ? (
        <a className="contact-action" href={buildMailtoLink(email)} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">@</span>
          Correo
        </a>
      ) : null}
      {phone ? (
        <a className="contact-action contact-action-whatsapp" href={buildWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">WA</span>
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
