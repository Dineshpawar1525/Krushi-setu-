import React from 'react';
import AgriculturalCalendar from '../components/AgriculturalCalendar';
import DashboardNav from '../components/DashboardNav';
import '../components/AgriculturalCalendar.css';

const AgriculturalCalendarPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="pt-16">
        <AgriculturalCalendar />
      </div>
    </div>
  );
};

export default AgriculturalCalendarPage;
