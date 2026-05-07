import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BulletinBoard from '../components/BulletinBoard';

const AnnouncementsPage = () => (
  <div className="screen active" id="screenAnnouncements">
    <TopBar />
    <div className="bulletin-page__scroll">
      <BulletinBoard boardKey="announcements" heading="공지사항" emoji="📢" />
    </div>
    <BottomNav />
  </div>
);

export default AnnouncementsPage;
