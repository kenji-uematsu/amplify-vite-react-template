import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import VixChart from "./components/VixChart";
import "./App.css";

function App() {
  const { user, signOut } = useAuthenticator();
  const [emailStatus, setEmailStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentVIX, setCurrentVIX] = useState<string | null>(null);

  // メール送信処理
  async function sendEmail() {
    setIsLoading(true);
    setEmailStatus("送信中...");

    try {
      const response = await fetch(
        "https://qn6gj3ncw5.execute-api.ap-northeast-1.amazonaws.com/default/scheduledEmailSender",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.signInDetails?.loginId,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.vixData) {
          setCurrentVIX(result.vixData.value);
          setEmailStatus(
            `✅ メールを送信しました！最新VIX: ${result.vixData.value}`
          );
        } else {
          setEmailStatus("✅ メールを送信しました！");
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
      <header>
        <h1>VIX指数トラッカー</h1>
        <div className="user-info">
          <span>ログイン: {user?.signInDetails?.loginId}</span>
          <button onClick={signOut} className="sign-out-btn">
            ログアウト
          </button>
        </div>
      </header>

      <section className="vix-actions">
        <h2>VIX通知</h2>
        <p>現在のVIX指数をメールで受け取ることができます。</p>

        <button
          onClick={sendEmail}
          className="vix-email-btn"
          disabled={isLoading}
        >
          {isLoading ? "送信中..." : "最新VIX情報をメールで受信"}
        </button>

        {emailStatus && <p className="status-message">{emailStatus}</p>}
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
}

export default App;
