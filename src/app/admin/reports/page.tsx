import React from 'react';
import ReportsClient from '@/app/reports/ReportsClient';

export const metadata = {
  title: 'Reports — BS Admin',
};

export default function AdminReportsPage() {
  return (
    <div className="p-6 md:p-8">
      <ReportsClient />
    </div>
  );
}
