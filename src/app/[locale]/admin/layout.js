import AdminChecker from '@/lib/adminChecker'
import { AdminSidebar, AdminMobileHeader } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
    return (
        <>
            <AdminChecker />
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 flex flex-col lg:ml-64">
                    <AdminMobileHeader />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}
