import React from "react";

interface HeaderProps {
  userEmail: string | undefined;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onSignOut }) => {
  return (
    <header>
      <div className="header-container">
        <h3>VIX指数トラッカー</h3>
        <div className="user-info">
          <span>{userEmail}</span>
          <button onClick={onSignOut} className="sign-out-btn">
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
