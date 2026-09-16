/**
 * Expense Model & Mapper
 */
export function formatExpenseFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    batchId: row.batch_id,
    date: row.date,
    category: row.category,
    amount: Number(row.amount || 0),
    note: row.note || '',
    paidBy: row.paid_by || 'Adhit',
  };
}

export function formatExpenseToDb(expense) {
  return {
    id: expense.id,
    batch_id: expense.batchId,
    date: expense.date,
    category: expense.category,
    amount: expense.amount,
    note: expense.note || '',
    paid_by: expense.paidBy || 'Adhit',
  };
}
