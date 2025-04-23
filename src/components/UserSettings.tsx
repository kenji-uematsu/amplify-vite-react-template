import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Header from "./Header";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthenticator();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // 設定状態
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState("08:00");
  const [thresholdEnabled, setThresholdEnabled] = useState(false);
  const [thresholdValue, setThresholdValue] = useState<string | number>("20");
  const [settingId, setSettingId] = useState<string | null>(null);

  // 設定を読み込む
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // デバッグ情報を追加
        console.log("認証情報:", {
          username: user.username,
          userId: user.userId,
          signInDetails: user.signInDetails,
        });

        // ユーザーの既存設定を取得 - クエリを変更
        const response = await client.models.VixNotification.list();

        // 全レスポンスを確認
        console.log("全設定取得結果:", response);

        if (response.data.length > 0) {
          // 自分の設定を見つける
          const mySettings = response.data.find(
            (item) =>
              // 明示的にownerフィールドを確認
              item.owner === user.username ||
              // メールアドレスでも確認
              item.email === user.signInDetails?.loginId
          );

          console.log("自分の設定:", mySettings);

          if (mySettings) {
            setSettingId(mySettings.id);

            // 設定値を読み込み
            if (
              mySettings.dailyEnabled !== null &&
              mySettings.dailyEnabled !== undefined
            ) {
              setDailyEnabled(mySettings.dailyEnabled);
            }

            if (mySettings.dailyTime) {
              setDailyTime(mySettings.dailyTime);
            }

            if (
              mySettings.thresholdEnabled !== null &&
              mySettings.thresholdEnabled !== undefined
            ) {
              setThresholdEnabled(mySettings.thresholdEnabled);
            }

            if (
              mySettings.thresholdValue !== null &&
              mySettings.thresholdValue !== undefined
            ) {
              setThresholdValue(mySettings.thresholdValue);
            }
          }
        }
      } catch (error) {
        console.error("設定の読み込みに失敗しました", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  // 設定を保存
  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaveStatus("保存中...");

      // どちらかの通知が有効な場合はisEnabledをtrueに
      const isEnabled = dailyEnabled || thresholdEnabled;

      // デバッグ情報
      console.log("保存するユーザー情報:", {
        username: user.username,
        email: user.signInDetails?.loginId,
      });

      if (settingId) {
        // 既存設定を更新
        const result = await client.models.VixNotification.update({
          id: settingId,
          dailyEnabled,
          dailyTime,
          thresholdEnabled,
          thresholdValue: thresholdValue === "" ? 0 : Number(thresholdValue),
          isEnabled,
        });

        console.log("更新結果:", result);
      } else {
        // 新規設定を作成
        const result = await client.models.VixNotification.create({
          email: user.signInDetails?.loginId || "",
          dailyEnabled,
          dailyTime,
          thresholdEnabled,
          thresholdValue: thresholdValue === "" ? 0 : Number(thresholdValue),
          isEnabled,
        });

        console.log("作成結果:", JSON.stringify(result));

        // resultsの構造を確認し、正しいidの取得方法を使用
        if (result.data?.id) {
          // 通常のケース
          setSettingId(result.data.id);
        } else {
          console.error(
            "作成されたレコードからIDを取得できませんでした:",
            result
          );
        }
      }

      setSaveStatus("設定を保存しました");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("設定の保存に失敗しました", error);
      setSaveStatus(
        `❌ 保存に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  };

  // ホームに戻る
  const goHome = () => navigate("/");

  if (loading)
    return (
      <div className="vix-app">
        <Header userEmail={user?.signInDetails?.loginId} onSignOut={signOut} />
        <div className="settings-container">
          <p>設定を読み込み中...</p>
        </div>
      </div>
    );

  return (
    <div className="vix-app">
      <Header userEmail={user?.signInDetails?.loginId} onSignOut={signOut} />

      <h2>通知設定</h2>
      <div className="settings-container">
        {/* 日時通知設定 */}
        <div className="setting-section">
          <h3>定時通知</h3>
          <div className="setting-option">
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dailyEnabled}
                  onChange={(e) => setDailyEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">毎日指定時間にメール通知</span>
            </div>
          </div>

          <div className="setting-detail">
            <label>
              通知時間:
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="time-input"
                disabled={!dailyEnabled}
              />
            </label>
          </div>
        </div>

        {/* 閾値通知設定 */}
        <div className="setting-section">
          <h3>閾値通知</h3>
          <div className="setting-option">
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={thresholdEnabled}
                  onChange={(e) => setThresholdEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">
                VIX指数が閾値を超えたらメール通知
              </span>
            </div>
          </div>

          <div className="setting-detail">
            <label>
              閾値:
              <input
                type="number"
                min="1"
                max="100"
                value={thresholdValue}
                onChange={(e) => {
                  // 全角数字を半角に変換し、その他の全角文字を除外
                  const inputVal = e.target.value;
                  const convertedVal = inputVal
                    .split("")
                    .map((char) => {
                      const code = char.charCodeAt(0);
                      // 全角数字(0xFF10-0xFF19)を半角に変換
                      if (code >= 65296 && code <= 65305) {
                        return String.fromCharCode(code - 65248);
                      }
                      // 半角数字のみ許可
                      return /\d/.test(char) ? char : "";
                    })
                    .join("");

                  setThresholdValue(
                    convertedVal === "" ? "" : Number(convertedVal)
                  );
                }}
                className="number-input"
                disabled={!thresholdEnabled}
              />
            </label>
            <p className="setting-help">
              VIX指数が設定値を下から上に超えた場合に通知されます
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="settings-actions">
          <button className="save-button" onClick={saveSettings}>
            {saveStatus || "設定を保存"}
          </button>
          <button className="back-button" onClick={goHome}>
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
