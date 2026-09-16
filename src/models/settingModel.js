/**
 * Setting Model & Mapper
 */
export function formatSettingFromDb(dbRow) {
  if (!dbRow) return null;
  return {
    storeName: dbRow.store_name || 'singgahdulu.jastip',
    ig: dbRow.ig || '@singgahdulu.jastip',
    wa: dbRow.wa || '',
    address: dbRow.address || '',
    logoUrl: dbRow.logo_url || '',
  };
}

export function formatSettingToDb(setting) {
  return {
    id: 1,
    store_name: setting.storeName,
    ig: setting.ig,
    wa: setting.wa,
    address: setting.address,
    logo_url: setting.logoUrl || '',
    updated_at: new Date().toISOString(),
  };
}
