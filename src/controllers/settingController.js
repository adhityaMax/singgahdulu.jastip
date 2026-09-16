import { fetchSettingsFromSupabase, saveSettingsToSupabase } from '../services/settingService';
import { DEFAULT_SETTINGS } from '../data/dummyData';

export async function fetchSettingsController() {
  const remoteSettings = await fetchSettingsFromSupabase();
  if (remoteSettings) {
    localStorage.setItem('singgahdulu_settings', JSON.stringify(remoteSettings));
    return remoteSettings;
  }

  const saved = localStorage.getItem('singgahdulu_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

export async function saveSettingsController(settings) {
  await saveSettingsToSupabase(settings);
  localStorage.setItem('singgahdulu_settings', JSON.stringify(settings));
}
