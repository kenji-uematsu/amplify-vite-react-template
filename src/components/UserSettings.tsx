import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuthenticator } from "@aws-amplify/ui-react";

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthenticator();

  // ホームに戻る関数
  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="vix-app">
      <Header userEmail={user?.signInDetails?.loginId} onSignOut={signOut} />

      <div className="settings-container">
        <h2>ユーザー設定</h2>
        <p>ここに将来的に設定項目が追加されます</p>

        <button className="back-button" onClick={goHome}>
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
