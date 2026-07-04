import { SiteHeader } from "@/components/SiteHeader";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative z-10">
      <SiteHeader />
      {children}
    </div>
  );
}
