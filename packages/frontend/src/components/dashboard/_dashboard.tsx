import { Outlet } from '@tanstack/react-router'
import { DashboardSidebar } from '../shared/dashboard-sidebar'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="p-6 w-full">
        <section className="mx-auto w-full">
          <div className="mb-4 ">
            <SidebarTrigger />
          </div>
          <Outlet />
        </section>
      </main>
    </SidebarProvider>
  )
}
