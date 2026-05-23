import React from 'react';
import AnalyticsClient from '@/app/analytics/AnalyticsClient';

export const metadata = {
  title: 'Analytics — BS Admin',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 md:p-8">
      <AnalyticsClient />
    </div>
  );
}
