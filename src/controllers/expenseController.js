import { fetchExpensesFromSupabase, upsertExpenseToSupabase, deleteExpenseFromSupabase } from '../services/expenseService';
import { DEFAULT_EXPENSES } from '../data/dummyData';

export async function fetchExpensesController() {
  const remoteExpenses = await fetchExpensesFromSupabase();
  if (remoteExpenses !== null) {
    localStorage.setItem('singgahdulu_expenses', JSON.stringify(remoteExpenses));
    return remoteExpenses;
  }

  const saved = localStorage.getItem('singgahdulu_expenses');
  return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
}

export async function saveExpensesLocalController(expenses) {
  localStorage.setItem('singgahdulu_expenses', JSON.stringify(expenses));
}

export async function saveExpenseController(expense) {
  await upsertExpenseToSupabase(expense);
}

export async function deleteExpenseController(id) {
  await deleteExpenseFromSupabase(id);
}
