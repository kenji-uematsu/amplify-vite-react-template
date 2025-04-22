import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VixChart from "./components/VixChart";
import Header from "./components/Header";
import UserSettings from "./components/UserSettings";
import "./App.css";

// メインコンテンツをコンポーネントとして分離
const Home = () => {
  const { user, signOut } = useAuthenticator();
  const [emailStatus, setEmailStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentVIX, setCurrentVIX] = useState<string | null>(null);

  // メール送信処理
  async function sendEmail() {
    setIsLoading(true);
    setEmailStatus("");

    // メールアドレスの存在確認
    const userEmail = user?.signInDetails?.loginId;
    if (!userEmail) {
      setEmailStatus(
        "❌ メールアドレスが取得できません。再度ログインしてください。"
      );
      setIsLoading(false);
      return;
    }

    setEmailStatus("送信中...");
    try {
      const response = await fetch(
        "https://qn6gj3ncw5.execute-api.ap-northeast-1.amazonaws.com/default/scheduledEmailSender",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.vixData) {
          setCurrentVIX(result.vixData.value);
          setEmailStatus(
            `✅ ${userEmail} 宛にメールを送信しました！最新VIX: ${result.vixData.value}`
          );
        } else {
          setEmailStatus(`✅ ${userEmail} 宛にメールを送信しました！`);
        }
        setTimeout(() => setEmailStatus(""), 5000);
      } else {
        setEmailStatus("❌ 送信エラー: " + (await response.text()));
      }
    } catch (error) {
      console.error("エラー:", error);
      setEmailStatus("❌ 接続エラー");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="vix-app">
      <Header userEmail={user?.signInDetails?.loginId} onSignOut={signOut} />

      <section className="vix-actions">
        <button
          onClick={sendEmail}
          className="vix-email-btn"
          disabled={isLoading}
        >
          {isLoading ? "送信中..." : "現在のVIXをメールで受信"}
        </button>
        {emailStatus && (
          <p
            className={`status-message ${
              emailStatus.includes("❌") ? "error" : "success"
            }`}
          >
            {emailStatus}
          </p>
        )}
        {currentVIX && (
          <div className="current-vix">
            現在のVIX: <span>{currentVIX}</span>
          </div>
        )}
      </section>

      <section className="vix-chart-container">
        <VixChart />
      </section>

      <footer>
        <p>データソース: Yahoo Finance - VIX指数(^VIX)</p>
      </footer>
    </main>
  );
};

// メインアプリでルーティングを設定
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<UserSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
