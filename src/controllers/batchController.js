import { fetchBatchesFromSupabase, upsertBatchToSupabase, deleteBatchFromSupabase } from '../services/batchService';
import { DEFAULT_BATCHES } from '../data/dummyData';

export async function fetchBatchesController() {
  const remoteBatches = await fetchBatchesFromSupabase();
  if (remoteBatches !== null) {
    localStorage.setItem('singgahdulu_batches', JSON.stringify(remoteBatches));
    return remoteBatches;
  }

  const saved = localStorage.getItem('singgahdulu_batches');
  return saved ? JSON.parse(saved) : DEFAULT_BATCHES;
}

export async function saveBatchesLocalController(batches) {
  localStorage.setItem('singgahdulu_batches', JSON.stringify(batches));
}

export async function saveBatchController(batch) {
  await upsertBatchToSupabase(batch);
}

export async function deleteBatchController(batchId) {
  await deleteBatchFromSupabase(batchId);
}
