// server/api/catalog.get.ts

import fs from 'fs';
import path from 'path';
import { normalizeCatalog } from '../../shared/utils/normalize';

export default defineEventHandler(() => {
  try {
    // СТАЛО:
    const filePath = path.resolve('public/catalog.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return normalizeCatalog(data);
  } catch (error) {
    console.error('Ошибка чтения каталога:', error);
    return [];
  }
});
