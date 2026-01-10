import type { Route } from "./+types/_index";
import TodoList from "../components/TodoList";
import AuthGuard from "../components/AuthGuard";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Todo App" },
        { name: "description", content: "A modern todo app powered by Supabase" },
    ];
}

export default function Home() {
    return (
        <AuthGuard>
            <TodoList />
        </AuthGuard>
    );
}
