/**
 * Helper formatting function for Indonesian Rupiah
 * @param {number|string} val
 * @returns {string} Formatted rupiah string e.g. "Rp 45.000"
 */
export const formatRp = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');
