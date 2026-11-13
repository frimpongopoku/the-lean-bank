"use client";
import { useEffect, useState } from "react";
import { getUserCollection, initUserCollection } from "@/app/auth/utils/firestore-utils";
import { usePots } from "./contexts/usePots";
import { useTransactions } from "./contexts/useTransactions";
import { useBorrow } from "./contexts/useBorrow";

/*
 * Loads pots, transactions and loans for a user into the providers,
 * initialising the collection on first use. Returns "loading" | "ready" | "error".
 */
export default function useUserData(uid) {
  const { setPotData } = usePots();
  const { setTransactions } = useTransactions() || {};
  const { setBorrows } = useBorrow() || {};
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        let data = await getUserCollection(uid);
        if (!data?.POTS) {
          await initUserCollection(uid);
          data = await getUserCollection(uid);
        }
        if (cancelled) return;
        const pots = data?.POTS || { key: uid, pots: [] };
        setPotData({ key: pots.key || uid, pots: pots.pots || [] });
        const tx = data?.TRANSACTIONS;
        setTransactions && setTransactions({ key: tx?.key || uid, transactions: tx?.transactions || [] });
        const b = data?.BORROWED;
        setBorrows && setBorrows({ key: b?.key || uid, borrows: b?.borrows || b?.borrowed || [] });
        setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return status;
}
