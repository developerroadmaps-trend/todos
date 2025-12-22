'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

interface Todo {
  id: number;
  user_id?: string;
  task: string;
  is_complete: boolean;
}

export default function TodoList() {
  const { user, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      // If no data from Supabase, use default todos
      if (data && data.length > 0) {
        setTodos(data);
      } else {
        const defaultTodos: Todo[] = [
          { id: 1, task: 'Set up Next.js project', is_complete: true },
          { id: 2, task: 'Configure TypeScript', is_complete: true },
          { id: 3, task: 'Create page components', is_complete: false },
          { id: 4, task: 'Set up API routes', is_complete: false },
          { id: 5, task: 'Implement routing', is_complete: false },
          { id: 6, task: 'Add styling with Tailwind CSS', is_complete: false },
          { id: 7, task: 'Deploy to Vercel', is_complete: false },
        ];
        setTodos(defaultTodos);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Using default todos.');
      // Fallback to default todos on error
      const defaultTodos: Todo[] = [
        { id: 1, task: 'Set up Next.js project', is_complete: true },
        { id: 2, task: 'Configure TypeScript', is_complete: true },
        { id: 3, task: 'Create page components', is_complete: false },
        { id: 4, task: 'Set up API routes', is_complete: false },
        { id: 5, task: 'Implement routing', is_complete: false },
        { id: 6, task: 'Add styling with Tailwind CSS', is_complete: false },
        { id: 7, task: 'Deploy to Vercel', is_complete: false },
      ];
      setTodos(defaultTodos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const addTodo = async () => {
    if (input.trim().length <= 3) {
      setError('Task must be more than 3 characters');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    const newTodo: Todo = {
      id: Date.now(),
      user_id: user.id,
      task: input,
      is_complete: false,
    };

    // Update local state first for immediate UI feedback
    setTodos([...todos, newTodo]);
    setInput('');

    // Try to insert into Supabase
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ task: newTodo.task, is_complete: newTodo.is_complete, user_id: user.id }]);

      if (error) {
        console.error('Error inserting todo:', error);
        setError('Failed to save todo. It may only exist locally.');
      }
    } catch (err) {
      console.error('Error inserting todo:', err);
      setError('Failed to save todo. It may only exist locally.');
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, is_complete: !todo.is_complete };

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
        .update({ is_complete: updatedTodo.is_complete })
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

  const startEditing = (id: number, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const saveEdit = async (id: number) => {
    if (editingText.trim().length <= 3) {
      setError('Task must be more than 3 characters');
      return;
    }

    // Update local state
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, task: editingText } : t
      )
    );
    setEditingId(null);

    // Try to update in Supabase
    try {
      const { error } = await supabase
        .from('todos')
        .update({ task: editingText })
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        setError('Failed to update task.');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Get filtered todos based on active tab
  const filteredTodos = todos.filter((todo) =>
    activeTab === 'active' ? !todo.is_complete : todo.is_complete
  );

  return (
    <>
      {/* Sign Out Button and User Info - Fixed position top right */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <div className="text-right mb-2">
          <p className="text-xs sm:text-sm text-gray-700 font-medium break-words max-w-32 sm:max-w-48">
            {user?.email && `${user.email}`}
          </p>
        </div>
        <button
          onClick={signOut}
          className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg w-full"
        >
          Sign Out
        </button>
      </div>

      <div className="w-full max-w-md px-4">
        <div className="mb-4">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-800">
            My Tasks
          </h2>
        </div>

        {loading && <p className="text-center text-gray-500 mb-4 text-sm">Loading todos...</p>}
      
      {error && (
        <div className="mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Active ({todos.filter((t) => !t.is_complete).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'completed'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Completed ({todos.filter((t) => t.is_complete).length})
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
        />
        <button
          onClick={addTodo}
          className="px-4 sm:px-5 py-2.5 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 font-medium"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            {activeTab === 'active'
              ? 'No active tasks. Great job! 🎉'
              : 'No completed tasks yet'}
          </p>
        ) : (
          filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.is_complete}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5 min-w-5 text-blue-500 rounded cursor-pointer"
            />

            {editingId === todo.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded text-black focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span
                  onClick={() => startEditing(todo.id, todo.task)}
                  className={`flex-1 text-sm sm:text-base break-words cursor-pointer hover:bg-gray-200 px-2 py-1 rounded transition ${
                    todo.is_complete
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                  }`}
                >
                  {todo.task}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg min-w-8 flex items-center justify-center"
                >
                  ×
                </button>
              </>
            )}
          </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          {todos.filter((t) => !t.is_complete).length} of {todos.length} tasks remaining
        </p>
      </div>
      </div>
    </>
  );
}
