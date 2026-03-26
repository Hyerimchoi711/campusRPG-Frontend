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
        
        {/* XP 바 */}
        <div className="xp-section" style={{ width: '100%', padding: '0 20px' }}>
          <div className="xp-label">
            <span>EXP</span>
            <span>1,240 / 2,000</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{width: '62%'}}>
              <div className="xp-shine"></div>
            </div>
          </div>
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
