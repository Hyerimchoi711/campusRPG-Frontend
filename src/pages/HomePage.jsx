import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="screen active" id="screenHome">
      <TopBar />
      
      <div className="home-container" >
        <div className="home-level-box">
          Lv. 0
        </div>
        
        <img 
          src="/images/animals/egg.png" 
          alt="알" 
          className="home-character-img"
        />
        
        <div className="home-info-box">
          <div className="home-info-nickname">부화중인 알</div>
          <div className="home-info-title">키워주세요</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
