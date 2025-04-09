import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface VixData {
  date: string;
  value: number;
}

interface ChartData {
  date: string;
  value: number;
  timestamp: number;
}

interface SortedData {
  date: string;
  value: number;
}

const VixChart: React.FC = () => {
  const [vixData, setVixData] = useState<VixData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVixData = async () => {
      try {
        const response = await axios.get(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            "https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=1d&range=1y"
          )}`
        );

        if (!response.data.chart?.result?.[0]) {
          throw new Error("データ形式が不正です");
        }

        const result = response.data.chart.result[0];
        console.log("result", result);
        const timeSeries = result.indicators.quote[0];
        const timestamps = result.timestamp;

        const formattedData = timestamps
          .map((timestamp: number, index: number) => ({
            date: new Date(timestamp * 1000).toISOString().split("T")[0],
            value: timeSeries.close[index],
            timestamp: timestamp,
          }))
          .filter((item: ChartData) => item.value !== null)
          .sort((a: ChartData, b: ChartData) => a.timestamp - b.timestamp)
          .slice(-365) // 最新の1年間分のデータを取得
          .map(({ date, value }: ChartData): SortedData => ({ date, value }));

        setVixData(formattedData);
        setLoading(false);
        console.log("vixData", vixData);
      } catch (err) {
        console.error("API Error:", err);
        setError(
          `データの取得に失敗しました: ${
            err instanceof Error ? err.message : "不明なエラー"
          }`
        );
        setLoading(false);
      }
    };
    fetchVixData();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  const formatDate = (date: string): string => {
    const [, month, day] = date.split("-");
    return `${month}/${day}`;
  };

  const formatValue = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <div style={{ width: "1200px", height: 400 }}>
      <h2>VIX（恐怖指数）チャート</h2>
      <ResponsiveContainer>
        <LineChart
          data={vixData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
            domain={["dataMin - 10", "dataMax + 10"]}
            tickCount={6}
            tickFormatter={(value: number) => `${Math.round(value / 10) * 10}`}
          />
          <Tooltip
            labelFormatter={(date: string) => formatDate(date)}
            formatter={(value: number) => formatValue(value)}
          />
          <Legend />
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
