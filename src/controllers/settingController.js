import { fetchSettingsFromSupabase, saveSettingsToSupabase, uploadLogoToSupabase, validateLogoFile } from '../services/settingService';
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

export async function saveSettingsController(settings, logoFile) {
  let saved = settings;
  if (logoFile) {
    validateLogoFile(logoFile);
    const uploadedUrl = await uploadLogoToSupabase(logoFile);
    const logoUrl = uploadedUrl || await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file logo.'));
      reader.readAsDataURL(logoFile);
    });
    saved = { ...settings, logoUrl };
  }
  await saveSettingsToSupabase(saved);
  localStorage.setItem('singgahdulu_settings', JSON.stringify(saved));
  return saved;
}
