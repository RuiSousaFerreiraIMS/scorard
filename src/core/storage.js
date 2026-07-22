// src/core/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_KEY = 'cardscore:active';

export async function saveActive(session) {
  try { await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(session)); } catch (e) {}
}
export async function loadActive() {
  try { const raw = await AsyncStorage.getItem(ACTIVE_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
export async function clearActive() {
  try { await AsyncStorage.removeItem(ACTIVE_KEY); } catch (e) {}
}
