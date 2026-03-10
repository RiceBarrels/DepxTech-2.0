import AdminChecker from '@/lib/adminChecker'
import { AdminSidebar, AdminMobileHeader } from '@/components/admin/AdminSidebar'

export const metadata = {
    robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
    return (
        <>
            <AdminChecker />
            <div className="flex h-screen overflow-y-scroll">
                <AdminSidebar />
                <div className="flex-1 flex flex-col lg:ml-64">
                    <AdminMobileHeader />
                    <main className="flex-1" style={{ viewTransitionName: 'admin-content' }}>
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}
