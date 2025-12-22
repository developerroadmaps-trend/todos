import TodoList from "./components/TodoList";
import AuthGuard from "./components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="flex w-full flex-col items-center justify-center gap-6 py-8 px-4 sm:gap-8 sm:py-12 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-4xl">
            My Todo List
          </h1>
          <TodoList />
        </main>
      </div>
    </AuthGuard>
  );
}
