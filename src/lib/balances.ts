export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface BalanceResult {
  netBalances: Record<string, number>;
  simplifiedTransactions: Transaction[];
  perPersonTotal: Record<string, { totalPaid: number; totalOwed: number; net: number }>;
  groupTotal: number;
}

export function calculateBalances(
  expenses: Array<{
    amount: number;
    paidById: string;
    splits: Array<{ userId: string; amount: number }>;
  }>,
  settlements: Array<{
    amount: number;
    payerId: string;
    receiverId: string;
    status: string;
  }> = []
): BalanceResult {
  const netBalances: Record<string, number> = {};
  const perPersonTotal: Record<string, { totalPaid: number; totalOwed: number; net: number }> = {};
  let groupTotal = 0;

  // Initialize all users
  const allUserIds = new Set<string>();
  expenses.forEach((e) => {
    allUserIds.add(e.paidById);
    e.splits.forEach((s) => allUserIds.add(s.userId));
  });
  settlements.forEach((s) => {
    allUserIds.add(s.payerId);
    allUserIds.add(s.receiverId);
  });

  allUserIds.forEach((id) => {
    netBalances[id] = 0;
    perPersonTotal[id] = { totalPaid: 0, totalOwed: 0, net: 0 };
  });

  // Process expenses
  for (const expense of expenses) {
    groupTotal += expense.amount;

    // Payer gets credit
    netBalances[expense.paidById] += expense.amount;
    perPersonTotal[expense.paidById].totalPaid += expense.amount;

    // Each splitter gets debit
    for (const split of expense.splits) {
      netBalances[split.userId] -= split.amount;
      perPersonTotal[split.userId].totalOwed += split.amount;
    }
  }

  // Process confirmed settlements
  for (const settlement of settlements) {
    if (settlement.status === "CONFIRMED") {
      netBalances[settlement.payerId] += settlement.amount;
      netBalances[settlement.receiverId] -= settlement.amount;
      perPersonTotal[settlement.payerId].totalPaid += settlement.amount;
      perPersonTotal[settlement.receiverId].totalOwed += settlement.amount;
    }
  }

  // Calculate per-person net
  for (const userId of allUserIds) {
    perPersonTotal[userId].net =
      perPersonTotal[userId].totalPaid - perPersonTotal[userId].totalOwed;
  }

  // Simplify debts
  const simplifiedTransactions = simplifyDebts(netBalances);

  return {
    netBalances,
    simplifiedTransactions,
    perPersonTotal,
    groupTotal,
  };
}

function simplifyDebts(balances: Record<string, number>): Transaction[] {
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > 0.01) creditors.push({ id: userId, amount: balance });
    if (balance < -0.01) debtors.push({ id: userId, amount: Math.abs(balance) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];

  while (creditors.length && debtors.length) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const amount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount * 100) / 100,
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) creditors.shift();
    if (debtor.amount < 0.01) debtors.shift();
  }

  return transactions;
}
