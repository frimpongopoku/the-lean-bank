"use client";
import { usePots } from "./contexts/usePots";
import { generateUniqueId, useTransactions } from "./contexts/useTransactions";
import { useBorrow } from "./contexts/useBorrow";
import { useToast } from "@/app/components/ToastProvider";
import { formatAmount } from "@/app/components/ui/money";

/*
 * Every money movement in one place, each with an Undo that reverses exactly
 * what it did (records and balances).
 */
export default function useMoneyActions() {
  const pots = usePots();
  const tx = useTransactions() || {};
  const loans = useBorrow() || {};
  const toast = useToast();

  const findPot = (potId) => (pots.potData?.pots || []).find((p) => p.id === potId);

  const record = (potId, { mode, amount, partId, toPartId, description, date }) => {
    const pot = findPot(potId);
    const part = pot?.parts?.find((p) => p.id === partId);
    if (!pot || !part) return;
    const cur = pot.currency ? `${pot.currency} ` : "";
    const amt = `${cur}${formatAmount(amount)}`;
    const base = { amount, pot_id: potId, date: date || new Date() };

    if (mode === "add") {
      const id = generateUniqueId("dep_");
      tx.addDeposit({ ...base, id, description, source: part.name, part_id: part.id });
      pots.updatePotWithDeposit(potId, part.id, amount);
      toast.success(`Added ${amt} to ${part.name}`, {
        undo: () => {
          tx.removeTransaction(id);
          pots.updatePotWithWithdrawal(potId, part.id, amount);
        },
      });
    }

    if (mode === "spend") {
      const id = generateUniqueId("wit_");
      tx.addWithdrawal({ ...base, id, description, source: part.name, part_id: part.id });
      pots.updatePotWithWithdrawal(potId, part.id, amount);
      toast.success(`Spent ${amt} from ${part.name}`, {
        undo: () => {
          tx.removeTransaction(id);
          pots.updatePotWithDeposit(potId, part.id, amount);
        },
      });
    }

    if (mode === "lend") {
      const id = generateUniqueId("wit_");
      const loanId = generateUniqueId("bor_");
      loans.addBorrow({
        ...base,
        id: loanId,
        description: description || "Loan",
        source: part.name,
        source_id: part.id,
        part_id: part.id,
        paid: false,
        paid_amount: 0,
      });
      tx.addWithdrawal({ ...base, id, kind: "loan", loan_id: loanId, description: description || "Loan", source: part.name, part_id: part.id });
      pots.updatePotWithWithdrawal(potId, part.id, amount);
      toast.success(`Lent ${amt} from ${part.name}`, {
        undo: () => {
          tx.removeTransaction(id);
          loans.deleteBorrow(loanId);
          pots.updatePotWithDeposit(potId, part.id, amount);
        },
      });
    }

    if (mode === "move") {
      const to = pot.parts.find((p) => p.id === toPartId);
      if (!to || to.id === part.id) return;
      const outId = generateUniqueId("wit_");
      const inId = generateUniqueId("dep_");
      const note = description ? `: ${description}` : "";
      pots.transferBetweenPartitions(potId, part.id, to.id, amount);
      tx.addWithdrawal({ ...base, id: outId, kind: "move", description: `Transfer → ${to.name}${note}`, source: part.name, part_id: part.id });
      tx.addDeposit({ ...base, id: inId, kind: "move", description: `Transfer ← ${part.name}${note}`, source: to.name, part_id: to.id });
      toast.success(`Moved ${amt} from ${part.name} to ${to.name}`, {
        undo: () => {
          tx.removeTransaction(outId);
          tx.removeTransaction(inId);
          pots.transferBetweenPartitions(potId, to.id, part.id, amount);
        },
      });
    }
  };

  const repay = (potId, loan, { amount, toEnvelope }) => {
    const pot = findPot(potId);
    const part = pot?.parts?.find((p) => p.id === (loan.source_id || loan.part_id));
    loans.recordRepayment(loan.id, amount);
    let depId = null;
    if (toEnvelope && part) {
      depId = generateUniqueId("dep_");
      tx.addDeposit({
        id: depId,
        kind: "repay",
        loan_id: loan.id,
        amount,
        description: `Loan repaid: ${loan.description || "loan"}`,
        source: part.name,
        part_id: part.id,
        pot_id: potId,
        date: new Date(),
      });
      pots.updatePotWithDeposit(potId, part.id, amount);
    }
    const cur = pot?.currency ? `${pot.currency} ` : "";
    toast.success(
      toEnvelope && part ? `${cur}${formatAmount(amount)} back in ${part.name}` : `Loan settled: ${cur}${formatAmount(amount)}`,
      {
        undo: () => {
          loans.updateBorrow(loan.id, { paid: !!loan.paid, paid_amount: Number(loan.paid_amount || 0) });
          if (depId) {
            tx.removeTransaction(depId);
            pots.updatePotWithWithdrawal(potId, part.id, amount);
          }
        },
      }
    );
  };

  const assign = (potId, { partId, amount }) => {
    const pot = findPot(potId);
    const part = pot?.parts?.find((p) => p.id === partId);
    if (!part) return;
    pots.updatePartInPot(potId, { ...part, balance: Number(part.balance) + amount });
    toast.success(`Assigned ${pot.currency ? pot.currency + " " : ""}${formatAmount(amount)} to ${part.name}`, {
      undo: () => pots.updatePartInPot(potId, { ...part, balance: Number(part.balance) }),
    });
  };

  return { record, repay, assign };
}
