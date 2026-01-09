import type { Language, Translations } from '@/lib/types';
import { en } from './en';
import { am } from './am';
import { om } from './om';
import { ti } from './ti';
import { so } from './so';

export const translations: Record<Language, Translations> = {
  en,
  am,
  om,
  ti,
  so,
};

export { en, am, om, ti, so };
