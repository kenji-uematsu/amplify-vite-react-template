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
  const [thresholdValue, setThresholdValue] = useState(20);
  const [settingId, setSettingId] = useState<string | null>(null);

  // 設定を読み込む
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // ユーザーの既存設定を取得
        const response = await client.models.VixNotification.list({
          filter: { owner: { eq: user.username } },
        });

        if (response.data.length > 0) {
          // 既存設定がある場合は読み込む
          const settings = response.data[0];
          setSettingId(settings.id);

          // 各フィールドから設定を読み込む
          setDailyEnabled(settings.dailyEnabled || false);
          setDailyTime(settings.dailyTime || "08:00");
          setThresholdEnabled(settings.thresholdEnabled || false);
          setThresholdValue(settings.thresholdValue || 20);
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

      if (settingId) {
        // 既存設定を更新
        await client.models.VixNotification.update({
          id: settingId,
          dailyEnabled,
          dailyTime,
          thresholdEnabled,
          thresholdValue,
          isEnabled,
        });
      } else {
        // 新規設定を作成
        const newSetting = await client.models.VixNotification.create({
          email: user.signInDetails?.loginId || "",
          dailyEnabled,
          dailyTime,
          thresholdEnabled,
          thresholdValue,
          isEnabled,
        });
        setSettingId(newSetting.data?.id || null);
      }

      setSaveStatus("✅ 設定を保存しました");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("設定の保存に失敗しました", error);
      setSaveStatus("❌ 保存に失敗しました");
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
                onChange={(e) => setThresholdValue(Number(e.target.value))}
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
          {saveStatus && <p className="save-status">{saveStatus}</p>}
          <button className="save-button" onClick={saveSettings}>
            設定を保存
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
