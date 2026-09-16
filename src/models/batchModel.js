/**
 * Batch Model & Mapper
 */
export function formatBatchFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    route: row.route,
    cutoffDate: row.cutoff_date || '',
    arrivalDate: row.arrival_date || '',
    status: row.status || 'ACTIVE',
    notes: row.notes || '',
  };
}

export function formatBatchToDb(batch) {
  return {
    id: batch.id,
    name: batch.name,
    route: batch.route,
    cutoff_date: batch.cutoffDate || null,
    arrival_date: batch.arrivalDate || null,
    status: batch.status || 'ACTIVE',
    notes: batch.notes || '',
  };
}
