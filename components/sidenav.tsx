import NavLinks from '@/components/ui/dashboard/nav-links';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col py-4 bg-black px-4 sm:px-6 lg:px-8">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
      </div>
    </div>
  );
}
