import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const HomePage = () => {
  return (
    <div className="screen active" id="screenHome">
      <TopBar />
      
      <div className="home-container" >
        <div className="home-level-box">
          Lv. 100
        </div>
        
        <img 
          src="/images/characters/character1_male.jpg" 
          alt="캐릭터" 
          className="home-character-img"
        />
        
        <div className="home-info-box">
          <div className="home-info-nickname">닉네임</div>
          <div className="home-info-title">칭호: 전설의 대학생</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
