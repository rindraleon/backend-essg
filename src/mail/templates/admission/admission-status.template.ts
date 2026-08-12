import { AdmissionStatus } from '../../../admissions/entities/admission.entity';
import { renderBaseTemplate, BaseTemplateData } from '../base.template';

export interface AdmissionNotificationData {
  nom: string;
  prenom: string;
  email: string;
  formation: string;
  reference: string;
  statut: AdmissionStatus;
  date: string;
  commentaire?: string;
  siteUrl?: string;
}

const STATUS_META: Record<
  AdmissionStatus,
  { title: string; badge: string; badgeClass: string; message: string; nextSteps: string }
> = {
  [AdmissionStatus.ACCEPTE]: {
    title: 'Admission acceptée',
    badge: 'Acceptée',
    badgeClass: 'status-success',
    message:
      'Nous avons le plaisir de vous informer que votre candidature a été acceptée. Félicitations !',
    nextSteps:
      'Vous recevrez très prochainement les instructions d’inscription administrative et pédagogique par email. Merci de préparer les documents demandés.',
  },
  [AdmissionStatus.REFUSE]: {
    title: 'Candidature refusée',
    badge: 'Refusée',
    badgeClass: 'status-error',
    message:
      'Après étude de votre dossier, nous regrettons de vous informer que votre candidature n’a pas été retenue pour cette formation.',
    nextSteps:
      'Nous vous encourageons à postuler à nouveau lors de la prochaine session de recrutement.',
  },
  [AdmissionStatus.EN_COURS_ETUDE]: {
    title: 'Dossier en cours d’étude',
    badge: 'En cours d’étude',
    badgeClass: 'status-info',
    message:
      'Votre dossier de candidature est actuellement en cours d’étude par notre commission pédagogique.',
    nextSteps: 'Vous serez informé(e) de la décision dès que celle-ci sera finalisée.',
  },
  [AdmissionStatus.EN_ATTENTE]: {
    title: 'Dossier en attente',
    badge: 'En attente',
    badgeClass: 'status-warning',
    message: 'Votre dossier de candidature a bien été enregistré et est en attente de traitement.',
    nextSteps: 'Notre équipe pédagogique va étudier votre dossier dans les plus brefs délais.',
  },
};

export function renderAdmissionStatusTemplate(data: AdmissionNotificationData): string {
  const meta = STATUS_META[data.statut];
  const statutLabel = data.statut === AdmissionStatus.ACCEPTE ? 'accepté(e)' : '';

  const infoItems = [
    ['Référence du dossier', data.reference],
    ['Candidat(e)', `${data.prenom} ${data.nom}`],
    ['Formation concernée', data.formation],
    ['Statut', `${meta.badge}`],
    ['Date', data.date],
  ]
    .map(
      ([label, value]) =>
        `<div class="info-item"><span class="info-label">${label}</span><span class="info-value">${value}</span></div>`,
    )
    .join('');

  const content = `
    <p>Bonjour <strong>${data.prenom} ${data.nom}</strong>,</p>
    <p>${meta.message}</p>
    <div class="info-box">
      ${infoItems}
    </div>
    <p><span class="status ${meta.badgeClass}">${meta.badge}${statutLabel ? ' ' + statutLabel : ''}</span></p>
    ${
      data.commentaire
        ? `<div class="info-box"><span class="info-label">Commentaire :</span> ${data.commentaire}</div>`
        : ''
    }
    <p><strong>Prochaines étapes :</strong></p>
    <p>${meta.nextSteps}</p>
    <p>Pour toute information complémentaire, notre équipe reste à votre disposition.</p>
    ${data.siteUrl ? `<p><a href="${data.siteUrl}" class="button">Visiter notre site</a></p>` : ''}
  `;

  const templateData: BaseTemplateData = {
    title: meta.title,
    subtitle: 'Notification de candidature',
    content,
    preheader: `Décision concernant votre dossier ${data.reference}`,
    siteUrl: data.siteUrl,
  };

  return renderBaseTemplate(templateData);
}
