import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BulletinBoard from '../components/BulletinBoard';

const EventsPage = () => (
  <div className="screen active" id="screenEvents">
    <TopBar />
    <div className="bulletin-page__scroll">
      <BulletinBoard boardKey="events" heading="이벤트" emoji="🎁" />
    </div>
    <BottomNav />
  </div>
);

export default EventsPage;
