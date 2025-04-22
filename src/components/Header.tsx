import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userEmail: string | undefined;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onSignOut }) => {
  const navigate = useNavigate();

  // ユーザー設定ページへ遷移
  const goToUserSettings = () => {
    navigate("/settings");
  };

  return (
    <header>
      <div className="header-container">
        <h3 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          VIX指数トラッカー
        </h3>
        <div className="user-info">
          <span
            onClick={goToUserSettings}
            className="user-email"
            title="設定ページを開く"
          >
            {userEmail}
          </span>
          <button onClick={onSignOut} className="sign-out-btn">
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
