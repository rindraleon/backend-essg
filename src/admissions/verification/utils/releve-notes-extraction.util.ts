import { normalizeText } from './normalization.util';

export interface Matiere {
  matiere: string;
  note: number | null;
  noteRaw: string | null;
  coefficient: number | null;
  coefficientRaw: string | null;
  observation: string | null;
  // Pour affichage
  originalLine: string;
}

export interface ReleveExtractionResult {
  matieres: Matiere[];
  moyenneCalculee: number | null;
  moyenneExtraite: string | null;
  moyenneExtraiteNum: number | null;
  mention: string | null;
  session: string | null;
  totalMatieres: number;
  cleanedText: string;
  confidence: number;
  estimatedPages: number;
  warnings: string[];
}

const MATIERE_LABELS = [
  'malagasy',
  'français',
  'francais',
  'anglais',
  'philosophie',
  'histoire',
  'géographie',
  'geographie',
  'mathématiques',
  'mathematiques',
  'maths',
  'physique',
  'chimie',
  'svt',
  'science',
  'eps',
  'éducation',
  'education',
  'informatique',
  'economie',
  'économie',
  'comptabilité',
  'comptabilite',
  'gestion',
  'droit',
  // Ajouts L3
  'algorithmique',
  'base de données',
  'base de donnees',
  'réseaux',
  'reseaux',
  'système',
  'systeme',
  'programmation',
  'projet',
  'stage',
];

function buildMatiereRegex(): RegExp {
  const alt = MATIERE_LABELS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  
  return new RegExp(String.raw`\b(${alt})[^\d]{0,10}(\d{1,2}(?:[\.,]\d{1,2})?)(?:[ \t]*\/[ \t]*\d{1,2})?(?:[ \t]*coeff(?:icient)?[ \t]*[:]?[ \t]*(\d{1,2})|[ \t]+(\d{1,2}))?[ \t]*([A-Za-zéèêàù ]{0,20})?`, 'gi');
}

/**
 * Détecte et extrait toutes les lignes de notes depuis le texte
 */
export function extractReleveNotes(text: string): ReleveExtractionResult {
  if (!text || text.trim().length < 10) {
    return {
      matieres: [],
      moyenneCalculee: null,
      moyenneExtraite: null,
      moyenneExtraiteNum: null,
      mention: null,
      session: null,
      totalMatieres: 0,
      cleanedText: '',
      confidence: 0,
      estimatedPages: 0,
      warnings: ['Document vide ou illisible (aucun texte extrait).'],
    };
  }

  const cleanedText = text.replace(/\r/g, '\n').replace(/\u00A0/g, ' ');

  // Estimation pages : compter occurrences de mots-clés en-tête
  const headerCount = (cleanedText.match(/relevé|releve|bulletin|notes/gi) || []).length;
  const estimatedPages = Math.max(1, Math.min(10, headerCount || Math.ceil(cleanedText.length / 3000)));

  const warnings: string[] = [];
  const matieres: Matiere[] = [];

  const hasTableHeader = /Matières\s*\|\s*Coeff/i.test(cleanedText) || /RELEVE\s+DES\s+NOTES/i.test(cleanedText);
  if (hasTableHeader) {
    const tableLines = cleanedText.split(/\n/);
    let inTable = false;
    for (const rawLine of tableLines) {
      const line = rawLine.trim();
      if (!inTable) {
        if (/Matières/i.test(line) && /Coeff/i.test(line)) {
          inTable = true;
        }
        continue;
      }
      if (/TOTAL|MOYENNE|Décision du Jury|Fait à/i.test(line)) break;
      if (!line || line.length < 3) continue;
      
      const tableMatch = line.match(/^(.+?)\s{2,}(\S+)\s+(\d+[,\.]\d+|\d+)\s+(\d+[,\.]?\d*)\s*$/);
      if (tableMatch) {
        const rawMatiere = tableMatch[1].trim().replace(/\s{2,}/g, ' ');
        // Filtrer si matière ne contient pas au moins une matière connue ou si c'est un total
        const isMatiereLike = MATIERE_LABELS.some((lbl) => normalizeText(rawMatiere).includes(normalizeText(lbl).split(' ')[0])) || rawMatiere.length > 5;
        if (!isMatiereLike) continue;
        const rawCoeff = tableMatch[2].trim();
        const rawNote = tableMatch[3].trim();
        const rawMax = tableMatch[4].trim();
        const coeffVal = rawCoeff.toUpperCase() === 'BONI' ? null : parseFloat(rawCoeff.replace(',', '.'));
        const noteVal = parseNote(rawNote);
        if (noteVal === null || noteVal < 0 || noteVal > 100) continue;
        const coeffNum = Number.isFinite(coeffVal) ? coeffVal as number : null;
        // Éviter doublon matière
        const key = `${rawMatiere}|${rawNote}|${rawCoeff}`.toLowerCase();
        if (matieres.some((m) => normalizeText(m.matiere) === normalizeText(rawMatiere))) continue;
        matieres.push({
          matiere: capitalizeMatiere(rawMatiere),
          note: noteVal,
          noteRaw: `${rawNote}/${rawMax}`,
          coefficient: coeffNum,
          coefficientRaw: rawCoeff,
          observation: null,
          originalLine: line.slice(0, 120),
        });
        continue;
      }
      // Fallback : parsing plus souple si colonnes séparées par espace simple (gère parenthèses pour Anglais (Facultative))
      const looseMatch = line.match(/^(.+?)\s+(\S+)\s+(\d+[,\.]\d+|\d+)\s+(\d+)\s*$/);
      if (looseMatch) {
        const rawMatiere = looseMatch[1].trim();
        const rawCoeff = looseMatch[2].trim();
        const rawNote = looseMatch[3].trim();
        const rawMax = looseMatch[4].trim();
        if (/TOTAL|MOYENNE/i.test(rawMatiere) || rawMatiere.length < 3) continue;
        // Vérifier que c'est bien une matière (évite de parser TOTAL etc.)
        const isMatiereLoose = MATIERE_LABELS.some((lbl) => normalizeText(rawMatiere).includes(normalizeText(lbl).split(' ')[0])) || /Anglais|Facultative/i.test(rawMatiere);
        if (!isMatiereLoose) continue;
        const coeffVal = rawCoeff.toUpperCase() === 'BONI' ? null : Number.parseFloat(rawCoeff.replace(',', '.'));
        const noteVal = parseNote(rawNote);
        const maxVal = Number.parseFloat(rawMax.replace(',', '.'));
        if (noteVal === null || noteVal > 100 || !Number.isFinite(maxVal) || maxVal <= 0) continue;
        matieres.push({
          matiere: capitalizeMatiere(rawMatiere.replace(/\s*\(.*\)\s*/, '').trim() || rawMatiere),
          note: noteVal,
          noteRaw: `${rawNote}/${rawMax}`,
          coefficient: Number.isFinite(coeffVal) ? coeffVal as number : null,
          coefficientRaw: rawCoeff,
          observation: null,
          originalLine: line.slice(0, 120),
        });
      }
    }
  }
  const matiereRegex = buildMatiereRegex();
  const shouldRunApproche1 = matieres.length < 5;
  let match: RegExpExecArray | null;
  const seenLines = new Set<string>();

  if (shouldRunApproche1) {
    while ((match = matiereRegex.exec(cleanedText)) !== null) {
      const rawMatiere = match[1].trim();
      const rawNote = match[2].trim();
      const rawCoeff = (match[3] || match[4] || null)?.trim() || null;
      const rawObs = match[5]?.trim() || null;

      const key = `${rawMatiere}|${rawNote}|${rawCoeff}`.toLowerCase();
      if (seenLines.has(key)) continue;
      seenLines.add(key);

      const note = parseNote(rawNote);
      const coeff = rawCoeff ? Number.parseFloat(rawCoeff.replace(',', '.')) : null;

      // Filtrer les faux positifs : note 0-100 (relevé BAC gère 50/100, 54/60 etc.), on garde 0-100
      if (note !== null && (note < 0 || note > 100)) continue;

      matieres.push({
        matiere: capitalizeMatiere(rawMatiere),
        note,
        noteRaw: rawNote,
        coefficient: Number.isFinite(coeff) ? coeff : null,
        coefficientRaw: rawCoeff,
        observation: rawObs ? rawObs.trim() : null,
        originalLine: match[0].trim().slice(0, 120),
      });
    }
  }

  // Approche 2 : détection tabulaire générique (lignes contenant chiffres)
  // Si peu de matières trouvées, chercher pattern générique "<texte> <note> <coeff>"
  if (matieres.length < 3) {
    const lines = cleanedText.split(/\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 5 || trimmed.length > 120) continue;
      // Doit contenir au moins un nombre avec décimal potentiel
      if (!/\d{1,2}[\.,]\d{1,2}|\b\d{1,2}\b/.test(trimmed)) continue;
      // Éviter lignes qui sont des dates ou montants
      if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(trimmed)) continue;
      // Pattern générique : texte + note + coeff
      // Ex: "Informatique 15,5 3" ou "Anglais 12 2"
      const genericMatch = trimmed.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-']{2,40}?)\s+(\d{1,2}[\.,]?\d{0,2})\s*(?:\/\s*20)?\s+(\d{1,2})\s*(.*)?$/);
      if (genericMatch) {
        const rawMatiere = genericMatch[1].trim();
        // Éviter mots-clés non-matière
        if (/moyenne|total|coefficient|matière|matiere|session|centre|numéro|numero/i.test(rawMatiere)) continue;
        const rawNote = genericMatch[2];
        const rawCoeff = genericMatch[3];
        const key = `${rawMatiere}|${rawNote}|${rawCoeff}`.toLowerCase();
        if (seenLines.has(key)) continue;
        seenLines.add(key);
        const note = parseNote(rawNote);
        const coeff = Number.parseFloat(rawCoeff.replace(',', '.'));
        if (note !== null && note >= 0 && note <= 20 && coeff >= 1 && coeff <= 10) {
          matieres.push({
            matiere: capitalizeMatiere(rawMatiere),
            note,
            noteRaw: rawNote,
            coefficient: coeff,
            coefficientRaw: rawCoeff,
            observation: genericMatch[4]?.trim() || null,
            originalLine: trimmed.slice(0, 120),
          });
        }
      }
    }
  }

  // Déduplication finale par nom de matière (garder première occurrence)
  const deduped = new Map<string, Matiere>();
  for (const m of matieres) {
    const key = normalizeText(m.matiere).toLowerCase();
    if (!deduped.has(key)) deduped.set(key, m);
  }
  const finalMatieres = [...deduped.values()];

  // Extraction moyenne
  const moyenneExtraite = extractMoyenne(cleanedText);
  const moyenneExtraiteNum = moyenneExtraite ? parseNote(moyenneExtraite) : null;

  // Extraction mention
  const mention = extractMention(cleanedText);
  const session = extractSession(cleanedText);

  // Calcul moyenne : gère 2 régimes
  // - Tableau BAC (Matières | Coeff | Notes déf | NotesMax) : moyenne = sum(Notes déf) / sum(Coeff) (BONI inclus dans total mais pas dans coeff)
  // - Format générique (Matière Note Coeff) : moyenne pondérée sum(note*coeff)/sum(coeff)
  let moyenneCalculee: number | null = null;
  const hasTableWithMax = finalMatieres.some((m) => m.noteRaw && m.noteRaw.includes('/'));
  const withCoeffs = finalMatieres.filter((m) => m.note !== null && m.coefficient !== null && m.coefficient > 0);
  if (hasTableWithMax) {
    // Régime tableau
    const totalNotesAll = finalMatieres.filter((m) => m.note !== null).reduce((s, m) => s + (m.note as number), 0);
    const totalCoeff = withCoeffs.reduce((sum, m) => sum + (m.coefficient as number), 0);
    if (totalCoeff > 0) moyenneCalculee = Math.round((totalNotesAll / totalCoeff) * 100) / 100;
    else if (finalMatieres.length >= 2) {
      const notes = finalMatieres.map((m) => m.note).filter((n): n is number => n !== null);
      if (notes.length > 0) moyenneCalculee = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 100) / 100;
    }
  } else if (withCoeffs.length >= 2) {
    const totalCoeff = withCoeffs.reduce((sum, m) => sum + (m.coefficient as number), 0);
    const totalPoints = withCoeffs.reduce((sum, m) => sum + (m.note as number) * (m.coefficient as number), 0);
    if (totalCoeff > 0) moyenneCalculee = Math.round((totalPoints / totalCoeff) * 100) / 100;
  } else if (finalMatieres.length >= 2) {
    // Moyenne simple si pas de coeffs
    const notes = finalMatieres.map((m) => m.note).filter((n): n is number => n !== null);
    if (notes.length > 0) moyenneCalculee = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 100) / 100;
  }

  // Warnings
  if (finalMatieres.length === 0) {
    warnings.push('Aucune matière détectée — relevé illisible, scan de mauvaise qualité ou document non reconnu.');
  } else if (finalMatieres.length < 3) {
    warnings.push(`Peu de matières détectées (${finalMatieres.length}) — document peut être incomplet ou multi-pages mal fusionnées.`);
  }
  if (moyenneExtraiteNum !== null && moyenneCalculee !== null && Math.abs(moyenneExtraiteNum - moyenneCalculee) > 0.5) {
    warnings.push(`Écart entre moyenne extraite (${moyenneExtraiteNum}) et moyenne calculée (${moyenneCalculee}) — vérifier les coefficients.`);
  }

  // Confiance
  let confidence = 0;
  if (finalMatieres.length === 0) confidence = 0.1;
  else if (finalMatieres.length < 3) confidence = 0.4;
  else if (finalMatieres.length < 6) confidence = 0.7;
  else confidence = 0.85;
  if (withCoeffs.length >= 3) confidence = Math.min(0.95, confidence + 0.1);
  if (moyenneExtraite) confidence = Math.min(0.95, confidence + 0.05);

  return {
    matieres: finalMatieres,
    moyenneCalculee,
    moyenneExtraite,
    moyenneExtraiteNum,
    mention,
    session,
    totalMatieres: finalMatieres.length,
    cleanedText,
    confidence,
    estimatedPages,
    warnings,
  };
}

function parseNote(raw: string): number | null {
  if (!raw) return null;
  let cleaned = raw.trim().replace(',', '.').replace(/\s+/g, '');
  // Gérer "08/20" -> 08
  if (cleaned.includes('/')) cleaned = cleaned.split('/')[0];
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}

function extractMoyenne(text: string): string | null {
  const patterns = [
    /moyenne\s*(?:générale|generale)?\s*[:\-]?\s*(\d{1,2}[\.,]\d{1,2})/i,
    /moy\.\s*[:\-]?\s*(\d{1,2}[\.,]\d{1,2})/i,
    /total[^:]*:\s*\d+.*moyenne\s*(\d{1,2}[\.,]\d{1,2})/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return m[1];
  }
  return null;
}

function extractMention(text: string): string | null {
  const m = /\b(passable|assez\s*bien|bien|très\s*bien|tres\s*bien|excellent|ajourné|ajourne|admis|admissible)\b/i.exec(text);
  return m ? m[0] : null;
}

function extractSession(text: string): string | null {
  const m = /\b(session|année|annee)\s*[:\-]?\s*(\d{4})\b/i.exec(text);
  return m ? m[0] : null;
}

function capitalizeMatiere(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(/[\s\-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
