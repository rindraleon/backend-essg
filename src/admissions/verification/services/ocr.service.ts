import { Injectable, Logger } from '@nestjs/common';

export interface OcrResult {
  text: string;
  confidence: number;
  method: 'ocr';
  error?: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractWithOcr(buffer: Buffer, mimetype: string): Promise<OcrResult> {
    // Pour JPEG/PNG: tentative OCR via tesseract.js
    if (mimetype.includes('image')) {
      return this.performImageOcr(buffer);
    }

    if (mimetype === 'application/pdf') {
      return {
        text: '',
        confidence: 0,
        method: 'ocr',
        error: 'PDF scanné détecté : conversion PDF→image non disponible, texte non extractible sans OCR avancé',
      };
    }

    return { text: '', confidence: 0, method: 'ocr', error: 'Type de fichier non supporté pour OCR' };
  }

  
  private async validateImageSize(buffer: Buffer): Promise<{ width: number; height: number } | null> {
   
    try {
      // @ts-ignore - optional
      const sharpMod = await import('sharp');
      const sharp = (sharpMod as any).default || sharpMod;
      const meta = await sharp(buffer).metadata();
      if (typeof meta.width === 'number' && typeof meta.height === 'number') {
        return { width: meta.width, height: meta.height };
      }
    } catch {
      
    }
    
    try {
      if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        if (width > 0 && height > 0) return { width, height };
      }
      
    } catch {
    }
    return null;
  }

  private async performImageOcr(buffer: Buffer): Promise<OcrResult> {
    // Garde-fou taille buffer ridicule (ex: 2x36 = souvent < 5Ko mais pas toujours fiable)
    if (!buffer || buffer.length < 256) {
      return this.ocrError(`Lecture impossible : image trop petite/corrompue (${buffer?.length ?? 0} octets) — scan illisible`);
    }

    // Validation dimensions avant d'initialiser Tesseract (coûteux ~1-2s/worker)
    const dims = await this.validateImageSize(buffer);
    const dimensionError = this.validateOcrDimensions(dims);
    if (dimensionError) {
      return dimensionError;
    }

    try {
      const createWorker = await this.loadOcrWorkerFactory();
      if (!createWorker) return this.ocrError('OCR non disponible (tesseract.js non installé)');

      const processedBuffer = await this.preprocessImage(buffer);

      const worker = await createWorker('fra+eng', 1, {
        logger: () => {},
      });
      const { data } = await worker.recognize(processedBuffer);
      await worker.terminate();

      const text = (data?.text as string) || '';
      const confidence = typeof data?.confidence === 'number' ? data.confidence / 100 : text.length > 20 ? 0.85 : 0.5;

      // Si Tesseract retourne vide sans erreur, c'est aussi une lecture impossible douce
      if (!text.trim()) {
        return this.ocrError('Lecture impossible : aucun texte détecté dans l’image (scan vide, flou ou manuscrit illisible)');
      }

      return {
        text: text.trim(),
        confidence: Math.min(1, Math.max(0, confidence)),
        method: 'ocr',
      };
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      // Mapping erreur Leptonica en message métier FR
      if (/Image too small to scale/i.test(raw)) {
        const m = raw.match(/(\d+x\d+)\s+vs\s+min\s+width\s+of\s+(\d+)/i);
        const dimsStr = m ? m[1] : '2×36';
        const minStr = m ? m[2] : '3';
        this.logger.warn(`OCR ignoré : ${raw} — image décorative`);
        return {
          text: '',
          confidence: 0,
          method: 'ocr',
          error: `Lecture impossible : image trop petite (${dimsStr} vs minimum ${minStr}px de large) — scan illisible ou fichier décoratif, ignorée`,
        };
      }
      this.logger.warn(`Échec OCR: ${raw}`);
      return {
        text: '',
        confidence: 0,
        method: 'ocr',
        error: `Échec OCR: ${raw}`,
      };
    }
  }

  private ocrError(error: string): OcrResult {
    return { text: '', confidence: 0, method: 'ocr', error };
  }

  private validateOcrDimensions(dims: { width: number; height: number } | null): OcrResult | null {
    if (!dims) return null;
    const { width, height } = dims;
    if (width < 15 || height < 15 || width * height < 800) {
      this.logger.warn(`OCR ignoré : image décorative/trop petite ${width}×${height}, minimum ~15×15`);
      return this.ocrError(`Lecture impossible : image trop petite (${width}×${height}, minimum 15×15) — scan illisible ou fichier décoratif, ignorée`);
    }
    if (width < 3) {
      return this.ocrError(`Lecture impossible : image trop étroite (${width}×${height}, minimum 3px de large) — ${width}×${height} vs min width of 3`);
    }
    return null;
  }

  private async loadOcrWorkerFactory(): Promise<any> {
    try {
      // @ts-ignore - optional dependency
      const tesseract = await import('tesseract.js');
      return (tesseract as any).createWorker || (tesseract as any).default?.createWorker;
    } catch {
      this.logger.warn('tesseract.js non installé, OCR désactivé - utilisation du fallback');
      return null;
    }
  }

  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      // @ts-ignore - optional
      const sharpMod = await import('sharp');
      const sharp = (sharpMod as any).default || sharpMod;
      return await sharp(buffer).rotate().grayscale().normalize().sharpen({ sigma: 1.2 }).toBuffer();
    } catch {
      return buffer;
    }
  }
}
