import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Ziben <noreply@ziben.fr>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ziben.onrender.com";

const footer = `
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e5e5;text-align:center;color:#999;font-size:13px;">
    Ziben &middot; Nice &middot; <a href="${BASE_URL}" style="color:#999;">ziben.onrender.com</a>
  </div>
`;

function wrap(content: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6;">
      ${content}
      ${footer}
    </div>
  `;
}

export async function sendWelcomeOrganizer(to: string, name: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Bienvenue sur Ziben, ${name} \u{1F44B}`,
      html: wrap(`
        <h1 style="font-size:24px;color:#F97066;margin-bottom:8px;">Bienvenue sur Ziben !</h1>
        <p>Salut <strong>${name}</strong>,</p>
        <p>Ton compte organisateur est cr\u00e9\u00e9. Tu peux maintenant publier tes events et toucher les Ni\u00e7ois en direct.</p>
        <a href="${BASE_URL}/organizer" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#F97066;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Acc\u00e9der \u00e0 mon espace
        </a>
        <p>Tu veux publier ton premier event tout de suite ?</p>
        <a href="${BASE_URL}/submit" style="display:inline-block;margin:8px 0 20px;padding:10px 24px;background:#14B8A6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Soumettre un event
        </a>
        <p style="color:#666;">Si tu as des questions, r\u00e9ponds directement \u00e0 cet email.</p>
      `),
    });
  } catch {}
}

export async function sendEventApproved(to: string, event: { title: string; id: string }) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `\u2705 Ton event est en ligne sur Ziben`,
      html: wrap(`
        <h1 style="font-size:24px;color:#14B8A6;margin-bottom:8px;">Event approuv\u00e9 !</h1>
        <p>Bonne nouvelle \u2014 <strong>${event.title}</strong> est maintenant visible sur Ziben.</p>
        <a href="${BASE_URL}/events/${event.id}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#14B8A6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir mon event
        </a>
        <p style="color:#666;">Tu veux plus de visibilit\u00e9 ? Boost ton event pour appara\u00eetre en t\u00eate de liste.</p>
        <a href="${BASE_URL}/events/${event.id}" style="color:#F97066;font-weight:600;text-decoration:none;">
          D\u00e9couvrir le boost &rarr;
        </a>
      `),
    });
  } catch {}
}

export async function sendWeeklyDigest(
  to: string,
  events: Array<{ title: string; date: string; location: string; id: string; category: { icon: string; name: string } }>,
  name?: string
) {
  if (!resend) return;
  const greeting = name ? `Salut <strong>${name}</strong>,` : "Salut,";
  const eventsHtml = events
    .map((e) => {
      const d = new Date(e.date);
      const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return `
        <a href="${BASE_URL}/events/${e.id}" style="display:block;text-decoration:none;color:inherit;margin-bottom:12px;">
          <div style="padding:14px 16px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa;transition:background 0.2s;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:20px;">${e.category.icon}</span>
              <span style="font-weight:600;font-size:15px;color:#1a1a1a;">${e.title}</span>
            </div>
            <div style="font-size:13px;color:#666;margin-left:28px;">
              📅 ${dateStr} à ${timeStr}<br/>
              📍 ${e.location}
            </div>
          </div>
        </a>
      `;
    })
    .join("");

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Ziben \u2014 Les events de la semaine \u00e0 Nice \ud83c\udf89",
      html: wrap(`
        <h1 style="font-size:24px;color:#F97066;margin-bottom:8px;">Les events de la semaine \ud83c\udf89</h1>
        <p>${greeting}</p>
        <p>Voici ce qui se passe \u00e0 Nice cette semaine :</p>
        <div style="margin:24px 0;">
          ${eventsHtml}
        </div>
        <a href="${BASE_URL}" style="display:inline-block;margin:8px 0 20px;padding:12px 28px;background:#14B8A6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir tous les events
        </a>
        <p style="color:#666;font-size:13px;">Tu re\u00e7ois cet email car tu as un compte sur Ziben.</p>
      `),
    });
  } catch {}
}

export async function sendEventReminder(
  to: string,
  event: { title: string; date: string; location: string; id: string }
) {
  if (!resend) return;
  const d = new Date(event.date);
  const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Rappel \u2014 ${event.title} c\u2019est demain !`,
      html: wrap(`
        <h1 style="font-size:24px;color:#F97066;margin-bottom:8px;">C\u2019est demain !</h1>
        <p>Tu as indiqu\u00e9 participer \u00e0 cet event demain. On t\u2019y voit !</p>
        <div style="margin:24px 0;padding:16px 20px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa;">
          <div style="font-weight:600;font-size:16px;color:#1a1a1a;margin-bottom:8px;">${event.title}</div>
          <div style="font-size:14px;color:#666;">
            \ud83d\udcc5 Demain \u00e0 ${timeStr}<br/>
            \ud83d\udccd ${event.location}
          </div>
        </div>
        <a href="${BASE_URL}/events/${event.id}" style="display:inline-block;margin:8px 0 20px;padding:12px 28px;background:#F97066;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir l\u2019event
        </a>
        <p style="color:#666;font-size:13px;">Tu re\u00e7ois cet email car tu as sauvegard\u00e9 cet event sur Ziben.</p>
      `),
    });
  } catch {}
}

export async function sendEventSubmitted(to: string, event: { title: string }) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Event re\u00e7u \u2014 en cours de validation`,
      html: wrap(`
        <h1 style="font-size:24px;color:#F97066;margin-bottom:8px;">Event bien re\u00e7u !</h1>
        <p>On a bien re\u00e7u <strong>${event.title}</strong>. Notre \u00e9quipe le valide en g\u00e9n\u00e9ral en quelques heures.</p>
        <div style="margin:24px 0;padding:16px 20px;background:#FFF7ED;border-left:4px solid #F97066;border-radius:4px;">
          <strong>Prochaine \u00e9tape :</strong> tu recevras un email d\u00e8s que ton event sera en ligne.
        </div>
        <p style="color:#666;">Merci de contribuer \u00e0 la vie locale ni\u00e7oise !</p>
      `),
    });
  } catch {}
}
