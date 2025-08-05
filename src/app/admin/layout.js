import RouteController from '@/components/ui/routeController'
import AdminChecker from '@/lib/adminChecker'

export default function AdminLayout({ children }) {
    return (
        <>
            <AdminChecker/>
            <div className="flex flex-col pt-20">
                {children}
            </div>
        </>
    )
}