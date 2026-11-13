import { AuthProvider } from "@/app/auth/context/AuthContext";
import { PotsProvider } from "@/app/hooks/contexts/usePots";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { ToastProvider } from "@/app/components/ToastProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import SettingsView from "./SettingsView";
import AuthGuard from "@/app/auth/AuthGuard";

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
                <AuthGuard>
                  <SettingsView userId={userId} />
                </AuthGuard>
              </BorrowProvider>
            </TransactionProvider>
          </PotsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default SettingsPage;
