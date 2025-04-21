import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import VixChart from "./components/VixChart";
import "./App.css"; // このファイルを作成してください

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [emailStatus, setEmailStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

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
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        setEmailStatus("✅ メールを送信しました！");
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
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
            {todo.content}
          </li>
        ))}
      </ul>

      {/* メール送信セクション */}
      <div className="email-section">
        <h3>メール通知</h3>
        <button
          onClick={sendEmail}
          className="email-button"
          disabled={isLoading}
        >
          {isLoading ? "送信中..." : "メールを送信"}
        </button>
        {emailStatus && <p className="email-status">{emailStatus}</p>}
      </div>

      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
      <VixChart />
    </main>
  );
}

export default App;
