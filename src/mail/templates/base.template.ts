export interface BaseTemplateData {
  title: string;
  subtitle?: string;
  content: string;
  preheader?: string;
  siteUrl?: string;
  logoUrl?: string;
}

export function renderBaseTemplate(data: BaseTemplateData): string {
  const {
    title,
    subtitle = '',
    content,
    preheader = '',
    siteUrl = 'https://essg.sn',
    logoUrl = '',
  } = data;

  const brandHtml = logoUrl
    ? `<img src="${logoUrl}" alt="ESSG" class="logo" />`
    : `<div class="brand">ESSG</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06); }
    .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; padding: 32px 28px; text-align: center; }
    .logo { max-height: 56px; margin-bottom: 12px; }
    .brand { font-size: 26px; font-weight: bold; letter-spacing: 0.5px; }
    .header h1 { font-size: 22px; margin-top: 8px; font-weight: 600; }
    .header p { font-size: 14px; opacity: 0.92; margin-top: 6px; }
    .content { padding: 28px; color: #334155; font-size: 15px; line-height: 1.65; }
    .content p { margin-bottom: 14px; }
    .content strong { color: #1e293b; }
    .info-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px; margin: 18px 0; }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
    .info-item:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { color: #1e293b; font-weight: 600; }
    .status { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold; }
    .status-success { background: #dcfce7; color: #166534; }
    .status-error { background: #fee2e2; color: #991b1b; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-info { background: #dbeafe; color: #1e40af; }
    .button { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 8px 0; }
    .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .credential-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .credential-value { font-family: 'Courier New', monospace; color: #1d4ed8; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 4px; margin: 16px 0; }
    .footer { background: #f8fafc; padding: 22px 28px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.7; }
    .footer a { color: #2563eb; text-decoration: none; }
    @media (max-width: 480px) {
      .content, .footer { padding: 20px; }
      .header { padding: 24px 18px; }
      .info-item, .credential-row { flex-direction: column; gap: 2px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ''}
    <div class="card">
      <div class="header">
        ${brandHtml}
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="content">${content}</div>
      <div class="footer">
        <p><strong>ESSG</strong> &mdash; École Supérieure de Gestion</p>
        <p>${siteUrl} &middot; contact@essg.sn &middot; +221 33 000 00 00</p>
        <p>&copy; ${new Date().getFullYear()} ESSG &mdash; Tous droits réservés</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
