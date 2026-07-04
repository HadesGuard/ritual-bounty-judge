import { SiteHeader } from "@/components/SiteHeader";
import { WrongNetworkBanner } from "@/components/WrongNetworkBanner";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative z-10">
      <SiteHeader />
      <WrongNetworkBanner />
      {children}
    </div>
  );
}
