import TodoList from "./components/TodoList";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center justify-center gap-8 py-12 px-6">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          My Todo List
        </h1>
        <TodoList />
      </main>
    </div>
  );
}
