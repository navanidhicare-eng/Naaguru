import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

export default function CollegeAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background text-on-surface antialiased overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto page-view pt-4 pb-16 px-8">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
