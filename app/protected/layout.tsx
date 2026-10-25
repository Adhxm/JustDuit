
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      <Sidebar />

      <div className="min-w-0 md:pl-64">
        <Suspense
          fallback={
            <div className="h-16 animate-pulse border-b border-slate-200 bg-white" />
          }
        >
          <Header />
        </Suspense>

        <main className="min-w-0 p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
