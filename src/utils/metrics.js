/**
 * Calculates financial metrics for orders and expenses.
 * @param {Array} orders List of order objects
 * @param {Array} expenses List of expense objects
 * @returns {Object} Calculated metrics
 */
export function calculateMetrics(orders, expenses) {
  let totalOmset = 0;
  let totalModal = 0;
  let totalGrossFee = 0;
  let totalCollectedDp = 0;
  let totalRemainingUnpaid = 0;

  orders.forEach((o) => {
    const itemSubtotal = (o.price + o.fee) * o.qty;
    const itemModal = o.price * o.qty;
    const itemFee = o.fee * o.qty;

    totalOmset += itemSubtotal;
    totalModal += itemModal;
    totalGrossFee += itemFee;

    let paid = 0;
    if (o.payStatus === 'LUNAS') {
      paid = itemSubtotal;
    } else if (o.payStatus === 'DP') {
      paid = Number(o.dpAmount || 0);
    } else {
      paid = 0;
    }

    totalCollectedDp += paid;
    totalRemainingUnpaid += Math.max(0, itemSubtotal - paid);
  });

  const totalOpsExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalGrossFee - totalOpsExpense;

  // Out-of-pocket & Buyer Breakdown ("Uang Siapa")
  let spentByUmay = 0;
  let spentByAdhit = 0;
  let spentByKas = 0;

  orders.forEach((o) => {
    if (o.itemStatus === 'DIBELI') {
      const itemModal = o.price * o.qty;
      if (o.buyer === 'Umay') spentByUmay += itemModal;
      else if (o.buyer === 'Adhit') spentByAdhit += itemModal;
      else spentByKas += itemModal;
    }
  });

  let expByUmay = 0;
  let expByAdhit = 0;
  let expByKas = 0;

  expenses.forEach((e) => {
    const amt = Number(e.amount || 0);
    if (e.paidBy === 'Umay') expByUmay += amt;
    else if (e.paidBy === 'Adhit') expByAdhit += amt;
    else expByKas += amt;
  });

  return {
    totalOmset,
    totalModal,
    totalGrossFee,
    totalCollectedDp,
    totalRemainingUnpaid,
    totalOpsExpense,
    netProfit,
    halfProfit: Math.max(0, netProfit / 2),
    partnerBreakdown: {
      umayTotalSpent: spentByUmay + expByUmay,
      adhitTotalSpent: spentByAdhit + expByAdhit,
      kasTotalSpent: spentByKas + expByKas,
      umayModal: spentByUmay,
      adhitModal: spentByAdhit,
      umayExp: expByUmay,
      adhitExp: expByAdhit,
    },
  };
}
