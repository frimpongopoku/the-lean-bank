import { AuthProvider } from "@/app/auth/context/AuthContext";
import { PotsProvider } from "@/app/hooks/contexts/usePots";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { ToastProvider } from "@/app/components/ToastProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import SettingsView from "./SettingsView";

async function SettingsPage({ searchParams }) {
  const sp = await searchParams;
  const userId = sp?.c;
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <PotsProvider>
            <TransactionProvider>
              <BorrowProvider>
                <SettingsView userId={userId} />
              </BorrowProvider>
            </TransactionProvider>
          </PotsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default SettingsPage;
