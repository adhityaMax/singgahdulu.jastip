import { calculateMetrics } from '../utils/metrics';

export function getMetricsController(orders, expenses) {
  return calculateMetrics(orders, expenses);
}
