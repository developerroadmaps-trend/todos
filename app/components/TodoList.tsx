'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      // If no data from Supabase, use default todos
      if (data && data.length > 0) {
        setTodos(data);
      } else {
        const defaultTodos: Todo[] = [
          { id: 1, text: 'Set up Next.js project', completed: true },
          { id: 2, text: 'Configure TypeScript', completed: true },
          { id: 3, text: 'Create page components', completed: false },
          { id: 4, text: 'Set up API routes', completed: false },
          { id: 5, text: 'Implement routing', completed: false },
          { id: 6, text: 'Add styling with Tailwind CSS', completed: false },
          { id: 7, text: 'Deploy to Vercel', completed: false },
        ];
        setTodos(defaultTodos);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Using default todos.');
      // Fallback to default todos on error
      const defaultTodos: Todo[] = [
        { id: 1, text: 'Set up Next.js project', completed: true },
        { id: 2, text: 'Configure TypeScript', completed: true },
        { id: 3, text: 'Create page components', completed: false },
        { id: 4, text: 'Set up API routes', completed: false },
        { id: 5, text: 'Implement routing', completed: false },
        { id: 6, text: 'Add styling with Tailwind CSS', completed: false },
        { id: 7, text: 'Deploy to Vercel', completed: false },
      ];
      setTodos(defaultTodos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (input.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: input,
        completed: false,
      };

      // Update local state first for immediate UI feedback
      setTodos([...todos, newTodo]);
      setInput('');

      // Try to insert into Supabase
      try {
        const { error } = await supabase
          .from('todos')
          .insert([{ id: newTodo.id, text: newTodo.text, completed: newTodo.completed }]);

        if (error) {
          console.error('Error inserting todo:', error);
          setError('Failed to save todo. It may only exist locally.');
        }
      } catch (err) {
        console.error('Error inserting todo:', err);
        setError('Failed to save todo. It may only exist locally.');
      }
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, completed: !todo.completed };

    // Update local state first
    setTodos(
      todos.map((t) =>
        t.id === id ? updatedTodo : t
      )
    );

    // Try to update in Supabase
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: updatedTodo.completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating todo:', error);
        setError('Failed to update todo. Changes may be local only.');
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Changes may be local only.');
    }
  };

  const deleteTodo = async (id: number) => {
    // Update local state first
    setTodos(todos.filter((todo) => todo.id !== id));

    // Try to delete from Supabase
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        setError('Failed to delete todo. It may still exist on server.');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. It may still exist on server.');
    }
  };

  return (
    <div className="w-full max-w-md">
      {loading && <p className="text-center text-gray-500 mb-4">Loading todos...</p>}
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5 text-blue-500 rounded cursor-pointer"
            />
            <span
              className={`flex-1 ${
                todo.completed
                  ? 'line-through text-gray-400'
                  : 'text-gray-800'
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {todos.filter((t) => !t.completed).length} of {todos.length} tasks
          remaining
        </p>
      </div>
    </div>
  );
}
