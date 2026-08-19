// src/services/wgerService.js
import axios from 'axios';

const FREE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FREE_DB_IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// Helper: Strip HTML tags from Wger descriptions
const cleanHtmlDescription = (html) => {
  if (!html) return [];
  const text = html.replace(/<[^>]*>?/gm, '').trim();
  return text
    .split('.')
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8);
};

// Helper: Normalize exercise strings for matching
const normalizeQuery = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(walking|standing|seated|dumbbell|barbell|machine)\b/gi, '')
    .trim();
};

let cachedFreeDB = null;

/**
 * Dynamically fetches exercise details and imagery across open APIs
 */
export const getWgerExerciseData = async (exerciseName) => {
  try {
    const rawQuery = exerciseName || '';
    const cleanQ = normalizeQuery(rawQuery);

    let instructions = [];
    let images = [];
    let target = 'General Fitness';

    // -------------------------------------------------------------
    // 1. QUERY WGER API (For Instructions & Secondary Visuals)
    // -------------------------------------------------------------
    try {
      const searchRes = await axios.get(
        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(cleanQ || rawQuery)}`
      );
      const suggestions = searchRes.data?.suggestions || [];

      if (suggestions.length > 0) {
        const exerciseId = suggestions[0].data.id;

        // Fetch Wger exercise details
        const infoRes = await axios.get(
          `https://wger.de/api/v2/exerciseinfo/${exerciseId}/?format=json`
        );
        target = infoRes.data?.category?.name || target;
        instructions = cleanHtmlDescription(infoRes.data?.description);

        // Fetch Wger images
        const imageRes = await axios.get(
          `https://wger.de/api/v2/exerciseimage/?exercise=${exerciseId}&format=json`
        );
        images = (imageRes.data?.results || []).map((img) => img.image);
      }
    } catch (wgerErr) {
      console.warn('Wger lookup missed, switching to dynamic fallback DB...');
    }

    // -------------------------------------------------------------
    // 2. VISUAL FALLBACK: Query free-exercise-db dynamically
    // -------------------------------------------------------------
    if (images.length === 0) {
      if (!cachedFreeDB) {
        const freeDbRes = await fetch(FREE_DB_URL);
        cachedFreeDB = await freeDbRes.json();
      }

      const words = cleanQ.split(' ').filter((w) => w.length > 2);

      // Search DB dynamically by key tokens
      const matched = cachedFreeDB.find((dbItem) => {
        const dbName = dbItem.name.toLowerCase();
        return words.some((word) => dbName.includes(word));
      });

      if (matched && matched.images && matched.images.length > 0) {
        images = matched.images.map((img) => `${FREE_DB_IMG_BASE}${img}`);
        if (instructions.length === 0 && matched.instructions) {
          instructions = matched.instructions;
        }
      }
    }

    return {
      name: rawQuery,
      target: target,
      instructions: instructions,
      images: images
    };
  } catch (error) {
    console.error(`Error fetching visuals for "${exerciseName}":`, error);
    return null;
  }
};