// app/home/page.jsx

import UsersPanel from '@/app/components/layout/panel/UsersPanel';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <UsersPanel />
    </div>
  );
}
