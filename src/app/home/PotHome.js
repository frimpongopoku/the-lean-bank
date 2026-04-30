"use client";
import {
  faEdit,
  faPlus,
  faTrash,
  faArrowRight,
  faWallet,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { useModal } from "../pot/[id]/components/EBModal";
import CreateOrEditPotForm from "./CreateOrEditPotForm";
import { usePots } from "../hooks/contexts/usePots";
import ConfirmPotDeletion from "./ConfirmPotDeletion";
import AuthGuard from "../auth/AuthGuard";
import { UNDEFINED, useAuth } from "../auth/context/AuthContext";
import {
  getAllPots,
  NOT_FOUND,
  initUserCollection,
} from "../auth/utils/firestore-utils";
import { generateUniqueId } from "../hooks/contexts/useTransactions";
import { makeDate } from "../lib/utils";
import Loading from "../components/Loading";
import MaskNumber from "../components/MaskNumber";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";

const PotHome = () => {
  const { Modal, openModal, closeModal } = useModal();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { potData, addPot, editPot, removePot, setPotData } = usePots();
  const pots = potData?.pots || [];

  // --- Summary stats grouped by currency (hoisted before early returns) ---
  const currencyTotals = useMemo(() => {
    const map = {};
    pots.forEach((p) => {
      const cur = p.currency || "—";
      if (!map[cur]) map[cur] = { balance: 0, allocated: 0 };
      map[cur].balance += Number(p.balance) || 0;
      const partSum = (p.parts || []).reduce(
        (acc, pt) => acc + (Number(pt.balance) || 0),
        0
      );
      map[cur].allocated += partSum;
    });
    return Object.entries(map);
  }, [pots]);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getAllPots(user?.uid).then(async (response) => {
      setLoading(false);
      if (response === NOT_FOUND) {
        // UX-08: auto-init instead of routing to /init
        await initUserCollection(user?.uid);
        setPotData({ key: user?.uid, pots: [] });
        return;
      }
      setPotData(response);
    });
  }, [user?.uid]);

  if (potData?.key === UNDEFINED) return <Loading full message="Loading your pots…" />;

  const noPots = !pots.length;

  const createOrEditPot = (pot) => {
    openModal(
      <CreateOrEditPotForm
        isEdit={pot?.id}
        data={pot}
        onSubmit={(content) => {
          closeModal();
          if (pot) {
            editPot({ ...pot, ...content });
            toast.success(`"${content.name || pot.name}" updated`);
          } else {
            addPot({
              ...content,
              id: generateUniqueId("pot_"),
              createdAt: makeDate(),
              user_id: user?.uid,
            });
            toast.success(`"${content.name}" created`);
          }
        }}
      />
    );
  };

  const handleDelete = (pot) => {
    openModal(
      <ConfirmPotDeletion
        onConfirm={() => {
          closeModal();
          removePot(pot?.id);
          // MF-09: undo within 5 seconds
          toast.success(`"${pot.name}" deleted`, {
            duration: 5000,
            undo: () => {
              addPot(pot);
              toast.info(`"${pot.name}" restored`);
            },
          });
        }}
        pot={pot}
        onCancel={closeModal}
      />
    );
  };

  const navigateToPot = (id) => {
    router.push(`/pot/${id}?c=${user?.uid}`);
  };

  return (
    <AuthGuard signout>
      <Modal />
      <div className="min-h-screen px-4 sm:px-6 py-8 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-1">
              The Lean Bank
            </p>
            <h1 className="text-2xl font-bold text-white">
              Hey, {user?.displayName?.split(" ")[0] || "there"} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/settings?c=${user?.uid}`)}
              aria-label="Settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-brand-violet transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <FontAwesomeIcon icon={faGear} className="text-sm" />
            </button>
            <button onClick={() => createOrEditPot()} className="btn-primary text-sm">
              <FontAwesomeIcon icon={faPlus} />
              New Pot
            </button>
          </div>
        </header>

        {/* ── Currency summary bar ── */}
        {!noPots && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {currencyTotals.map(([currency, { balance, allocated }]) => {
              const pct = balance > 0 ? Math.min((allocated / balance) * 100, 100) : 0;
              const free = balance - allocated;
              return (
                <div key={currency} className="glass-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-pill text-white/55">{currency}</span>
                    <span className="text-xs text-white/35">{pct.toFixed(0)}% allocated</span>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <MaskNumber
                      number={balance.toLocaleString()}
                      className="text-xl text-white font-bold"
                    />
                    <span className={`text-sm font-semibold ${free >= 0 ? "text-brand-cyan" : "text-brand-rose"}`}>
                      {free >= 0 ? "+" : ""}{free.toLocaleString()} free
                    </span>
                  </div>
                  <div className="alloc-bar-track">
                    <div
                      className="alloc-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct > 95
                            ? "linear-gradient(90deg,#f43f5e,#fb7185)"
                            : "linear-gradient(90deg,#10b981,#22d3ee)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty state ── */}
        {noPots && (
          <div className="glass text-center py-16 px-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faWallet} className="text-brand-emerald text-2xl" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">No pots yet</h2>
            <p className="text-white/45 text-sm max-w-xs mx-auto mb-6">
              A pot represents a bank account or money pool. Create your first
              one to start organising your finances.
            </p>
            <button onClick={() => createOrEditPot()} className="btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              Create your first pot
            </button>
          </div>
        )}

        {/* ── Pot grid ── */}
        {!noPots && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pots.map((pot) => (
              <PotCard
                key={pot.id}
                pot={pot}
                onManage={() => navigateToPot(pot.id)}
                onEdit={() => createOrEditPot(pot)}
                onDelete={() => handleDelete(pot)}
              />
            ))}
            <button
              onClick={() => createOrEditPot()}
              className="glass-card flex flex-col items-center justify-center gap-3 py-12 text-white/25 hover:text-brand-emerald min-h-[180px] transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </div>
              <span className="text-xs font-medium">Add Pot</span>
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

const PotCard = ({ pot, onManage, onEdit, onDelete }) => {
  const partSum = (pot.parts || []).reduce(
    (acc, p) => acc + (Number(p.balance) || 0),
    0
  );
  const pct = pot.balance > 0 ? Math.min((partSum / Number(pot.balance)) * 100, 100) : 0;
  const free = Number(pot.balance) - partSum;
  const isOverAllocated = free < 0;

  return (
    <div
      className="glass-card p-5 flex flex-col gap-4 cursor-pointer"
      onClick={onManage}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-emerald/12 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faWallet} className="text-brand-emerald text-xs" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{pot.name}</p>
            {pot.currency && (
              <span className="stat-pill text-white/35 mt-0.5 inline-block">{pot.currency}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            aria-label="Edit pot"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-brand-cyan transition-colors hover:bg-brand-cyan/10"
          >
            <FontAwesomeIcon icon={faEdit} className="text-xs" />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete pot"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-brand-rose transition-colors hover:bg-brand-rose/10"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-white/40 text-xs mb-1">Balance</p>
        <MaskNumber
          number={Number(pot.balance).toLocaleString()}
          className="text-2xl font-bold text-white"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/35">{pct.toFixed(0)}% allocated</span>
          <span className={isOverAllocated ? "text-brand-rose" : "text-brand-cyan/70"}>
            {isOverAllocated ? "Over-allocated" : `${free.toLocaleString()} free`}
          </span>
        </div>
        <div className="alloc-bar-track">
          <div
            className="alloc-bar-fill"
            style={{
              width: `${pct}%`,
              background: isOverAllocated
                ? "linear-gradient(90deg,#f43f5e,#fb7185)"
                : pct > 85
                ? "linear-gradient(90deg,#f59e0b,#fcd34d)"
                : "linear-gradient(90deg,#10b981,#22d3ee)",
            }}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-white/30 text-xs">
          {(pot.parts || []).length} partition{(pot.parts || []).length !== 1 ? "s" : ""}
        </span>
        <span className="text-brand-emerald text-xs font-semibold flex items-center gap-1.5">
          Manage <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </span>
      </div>
    </div>
  );
};

export default PotHome;
