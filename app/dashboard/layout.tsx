export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col max-w-7xl mx-auto px-8 py-16">
      <div className="flex-1">{children}</div>
    </div>
  )
}