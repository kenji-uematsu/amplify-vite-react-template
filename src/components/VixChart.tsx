import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  value: number;
}

const VixChart: React.FC = () => {
  const [vixData, setVixData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVixData = async () => {
      try {
        setLoading(true);

        // Lambda関数からチャートデータを取得
        const response = await fetch(
          "https://qn6gj3ncw5.execute-api.ap-northeast-1.amazonaws.com/default/scheduledEmailSender",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "getVixHistory", // 履歴データ取得のアクション指定
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.chartData && Array.isArray(result.chartData)) {
          setVixData(result.chartData);
        } else {
          throw new Error("チャートデータの形式が不正です");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(
          `チャートデータの取得に失敗しました: ${
            err instanceof Error ? err.message : "不明なエラー"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVixData();
  }, []);

  // 日付のフォーマット関数
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 値のフォーマット関数
  const formatValue = (value: number) => {
    return `${value.toFixed(2)}`;
  };

  if (loading) return <div>チャートデータを読み込み中...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (vixData.length === 0) return <div>表示するデータがありません</div>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={vixData}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={["dataMin - 5", "dataMax + 5"]}
            tickCount={6}
            tickFormatter={(value: number) => `${Math.round(value)}`}
          />
          <Tooltip
            labelFormatter={(date: string) => formatDate(date)}
            formatter={(value: number) => formatValue(value)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            dot={false}
            activeDot={{ r: 4 }}
            name="VIX"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VixChart;
