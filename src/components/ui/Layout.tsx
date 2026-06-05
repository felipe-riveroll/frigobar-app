import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, BedDouble, Hotel } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventario", href: "/inventory", icon: Package },
    { name: "Habitaciones", href: "/rooms", icon: BedDouble },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center justify-center border-b">
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-heading font-bold text-primary">
                Grand Gardenia
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.name}
                  >
                    <Link
                      to={item.href}
                      aria-current={
                        location.pathname === item.href ? "page" : undefined
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hotel className="h-3.5 w-3.5" />
              <span>Frigobar Management</span>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex h-14 md:hidden items-center gap-4 border-b bg-muted/30 px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-heading font-bold text-primary">
              Grand Gardenia
            </h1>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
