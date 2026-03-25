const nodemailer = require('nodemailer')

// ─── Transporteur SMTP ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// ─── Template HTML commun ─────────────────────────────────────────────────
const layout = (body) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:'DM Sans',Arial,sans-serif;font-weight:300">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:2rem 1rem">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:#0d0d0d;padding:1.5rem 2rem;text-align:center;border-radius:6px 6px 0 0">
          <p style="font-family:Georgia,serif;font-size:1.8rem;font-weight:300;color:#f5f0e8;letter-spacing:.15em;margin:0">
            CG<span style="color:#c9a84c">.</span>
          </p>
          <p style="color:rgba(245,240,232,.35);font-size:.65rem;letter-spacing:.28em;text-transform:uppercase;margin:.4rem 0 0">
            Cédric Grimere · Photographe
          </p>
        </td></tr>

        <!-- Corps -->
        <tr><td style="background:#ffffff;padding:2rem 2.5rem;border-radius:0 0 6px 6px">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:1.25rem;text-align:center">
          <p style="color:#999;font-size:.72rem;margin:0">
            📍 Marseille &amp; Bouches-du-Rhône &nbsp;·&nbsp;
            <a href="mailto:cedricgrimere@hotmail.com" style="color:#c9a84c;text-decoration:none">cedricgrimere@hotmail.com</a>
            &nbsp;·&nbsp;
            <a href="https://instagram.com/cedric_grimere" style="color:#c9a84c;text-decoration:none">@cedric_grimere</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

// ─── 1. Notification à Cédric : nouveau message reçu ──────────────────────
const sendAdminNotification = async ({ nom, email, prestation, message }) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      process.env.MAIL_USER,
    subject: `📩 Nouveau message de ${nom}${prestation ? ` — ${prestation}` : ''}`,
    html: layout(`
      <h2 style="color:#c9a84c;font-family:Georgia,serif;font-weight:300;font-size:1.5rem;margin:0 0 1.5rem">
        Nouveau message reçu
      </h2>
      <table width="100%" style="border-collapse:collapse">
        <tr style="border-bottom:1px solid #f0ece4">
          <td style="padding:.6rem .5rem;color:#999;font-size:.82rem;width:110px;vertical-align:top">Nom</td>
          <td style="padding:.6rem .5rem;font-size:.88rem;color:#333">${nom}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0ece4">
          <td style="padding:.6rem .5rem;color:#999;font-size:.82rem;vertical-align:top">Email</td>
          <td style="padding:.6rem .5rem;font-size:.88rem">
            <a href="mailto:${email}" style="color:#c9a84c;text-decoration:none">${email}</a>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #f0ece4">
          <td style="padding:.6rem .5rem;color:#999;font-size:.82rem;vertical-align:top">Prestation</td>
          <td style="padding:.6rem .5rem;font-size:.88rem;color:#333">${prestation || 'Non précisée'}</td>
        </tr>
        <tr>
          <td style="padding:.6rem .5rem;color:#999;font-size:.82rem;vertical-align:top">Message</td>
          <td style="padding:.6rem .5rem;font-size:.88rem;color:#333;line-height:1.6">${message}</td>
        </tr>
      </table>
      <div style="margin-top:1.5rem">
        <a href="mailto:${email}?subject=Re: Votre demande - Cédric Grimere Photographe"
          style="display:inline-block;background:#c9a84c;color:#000;padding:.65rem 1.5rem;
          text-decoration:none;font-size:.8rem;font-weight:500;letter-spacing:.05em">
          Répondre à ${nom}
        </a>
      </div>
    `),
  })
}

// ─── 2. Confirmation automatique au client ─────────────────────────────────
const sendClientConfirmation = async ({ nom, email, prestation }) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      email,
    subject: `Votre demande a bien été reçue — Cédric Grimere Photographe`,
    html: layout(`
      <h2 style="color:#c9a84c;font-family:Georgia,serif;font-weight:300;font-size:1.5rem;margin:0 0 1rem">
        Bonjour ${nom},
      </h2>
      <p style="color:#444;line-height:1.8;margin:0 0 1rem">
        Merci pour votre message ! J'ai bien reçu votre demande concernant
        <strong style="color:#333">${prestation || 'votre projet photo'}</strong>.
      </p>
      <p style="color:#444;line-height:1.8;margin:0 0 1.5rem">
        Je vous répondrai dans les <strong style="color:#333">48h</strong> pour discuter
        de votre projet et organiser notre rendez-vous de préparation.
      </p>
      <p style="color:#777;font-size:.85rem;border-top:1px solid #f0ece4;padding-top:1rem;margin:0">
        À très bientôt,<br>
        <strong style="color:#333">Cédric Grimere</strong><br>
        <span style="color:#c9a84c">Photographe · Marseille</span>
      </p>
    `),
  })
}

// ─── 3. Notification : nouvel avis à modérer ──────────────────────────────
const sendAvisNotification = async ({ nom, note, commentaire, prestation }) => {
  const etoiles = '★'.repeat(note) + '☆'.repeat(5 - note)
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      process.env.MAIL_USER,
    subject: `⭐ Nouvel avis à modérer — ${nom} (${note}/5)`,
    html: layout(`
      <h2 style="color:#c9a84c;font-family:Georgia,serif;font-weight:300;font-size:1.5rem;margin:0 0 1.5rem">
        Nouvel avis à modérer
      </h2>
      <p style="margin:0 0 .5rem"><strong>Nom :</strong> ${nom}</p>
      <p style="margin:0 0 .5rem"><strong>Prestation :</strong> ${prestation}</p>
      <p style="margin:0 0 1rem"><strong>Note :</strong>
        <span style="color:#c9a84c;font-size:1.1rem">${etoiles}</span> (${note}/5)
      </p>
      <blockquote style="border-left:3px solid #c9a84c;padding:.75rem 1rem;
        background:#faf8f4;margin:0 0 1.5rem;color:#555;font-style:italic;line-height:1.7">
        « ${commentaire} »
      </blockquote>
      <a href="${process.env.BACKEND_URL}/admin"
        style="display:inline-block;background:#c9a84c;color:#000;padding:.65rem 1.5rem;
        text-decoration:none;font-size:.8rem;font-weight:500">
        Modérer l'avis →
      </a>
    `),
  })
}

module.exports = { sendAdminNotification, sendClientConfirmation, sendAvisNotification }
