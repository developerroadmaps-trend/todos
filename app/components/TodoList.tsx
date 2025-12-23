'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Loader, Tag, LogOut, User, X } from 'lucide-react';
import { Combobox } from '@headlessui/react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function TodoList() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState('login');
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // フィルタリングされたカテゴリーを計算
  const filteredCategories = categoryInput === ''
    ? categories
    : categories.filter(cat =>
        cat.name.toLowerCase().includes(categoryInput.toLowerCase())
      );

  useEffect(() => {
    checkUser();
    subscribeToAuthChanges();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.log('No user logged in');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAuthChanges = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user || null);
    });
    return () => subscription?.unsubscribe();
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', currentUser.id);

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load todos
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;
      setTodos(todosData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (loginMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setEmail('');
        setPassword('');
        alert('Sign up successful! Please check your email to confirm.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setTodos([]);
      setCategories([]);
      setFilterCategory(null);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // INSERT INTO todos
  const addTodo = async () => {
    if (!input.trim() || !currentUser) return;

    try {
      setSaving(true);
      let categoryId = null;

      // Handle category
      if (categoryInput.trim()) {
        // Check if category already exists
        let category = categories.find(
          cat => cat.name.toLowerCase() === categoryInput.trim().toLowerCase()
        );
        
        // If category doesn't exist, create it
        if (!category) {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500'];
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{
              name: categoryInput.trim(),
              color: colors[Math.floor(Math.random() * colors.length)],
              user_id: currentUser.id,
            }])
            .select()
            .single();

          if (categoryError) throw categoryError;
          category = newCategory;
          // Update local state with new category
          setCategories([...categories, newCategory]);
        }
        
        categoryId = category.id;
      }

      const { data: newTodo, error } = await supabase
        .from('todos')
        .insert([{
          task: input,
          is_complete: false,
          status: 'not_started',
          category_id: categoryId,
          user_id: currentUser.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setTodos([newTodo, ...todos]);
      setInput('');
      setCategoryInput('');
    } catch (error) {
      console.error('Error adding todo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add todo';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const statusCycle = { 'not_started': 'in_progress', 'in_progress': 'completed', 'completed': 'not_started' };
      const status = (todo.status || 'not_started') as keyof typeof statusCycle;
      const newStatus = statusCycle[status];
      const newCompleted = newStatus === 'completed';

      const { error } = await supabase
        .from('todos')
        .update({
          status: newStatus,
          is_complete: newCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, status: newStatus, is_complete: newCompleted } : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
      cleanupEmptyCategories(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    } finally {
      setSaving(false);
    }
  };

  const clearCompleted = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('is_complete', true);

      if (error) throw error;
      const updated = todos.filter(t => !t.is_complete);
      setTodos(updated);
      cleanupEmptyCategories(updated);
    } catch (error) {
      console.error('Error clearing completed:', error);
      setError('Failed to clear completed');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Delete this category? Todos will become uncategorized.')) return;

    try {
      setSaving(true);

      // Update todos to remove category
      const { error: updateError } = await supabase
        .from('todos')
        .update({ category_id: null })
        .eq('category_id', categoryId);

      if (updateError) throw updateError;

      // Delete category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) throw deleteError;

      setCategories(categories.filter(c => c.id !== categoryId));
      setTodos(todos.map(t => t.category_id === categoryId ? { ...t, category_id: null } : t));
      if (filterCategory === categoryId) setFilterCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  const cleanupEmptyCategories = (currentTodos: any[]) => {
    const categoriesWithTodos = new Set(currentTodos.map(t => t.category_id).filter(id => id !== null));
    const emptyCategories = categories.filter(cat => !categoriesWithTodos.has(cat.id));

    if (emptyCategories.length > 0) {
      const updatedCategories = categories.filter(cat => categoriesWithTodos.has(cat.id));
      setCategories(updatedCategories);

      if (emptyCategories.some(cat => cat.id === filterCategory)) {
        setFilterCategory(null);
      }
    }
  };

  const startEditing = (id: number, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const saveEdit = async (id: number) => {
    if (!editingText.trim()) {
      cancelEdit();
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('todos')
        .update({
          task: editingText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, task: editingText.trim() } : t));
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating todo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editingId !== null) {
        saveEdit(editingId);
      } else if (!currentUser) {
        handleAuth();
      } else {
        addTodo();
      }
    } else if (e.key === 'Escape' && editingId !== null) {
      cancelEdit();
    }
  };

  const getCategoryForTodo = (categoryId: number | null) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // SQL-like aggregate queries
  const activeTodos = todos.filter(t => !t.is_complete).length;
  const completedTodos = todos.filter(t => t.is_complete).length;
  const todosByCategory = (categoryId: number | null) => todos.filter(t => t.category_id === categoryId).length;
  
  const getStatusCounts = (categoryId: number | null | 'uncategorized') => {
    let categoryTodos;
    
    if (categoryId === 'uncategorized') {
      // Count only todos with no category
      categoryTodos = todos.filter(t => t.category_id === null);
    } else if (categoryId) {
      // Count todos for specific category
      categoryTodos = todos.filter(t => t.category_id === categoryId);
    } else {
      // Count all todos (for overall stats)
      categoryTodos = todos;
    }
    
    return {
      not_started: categoryTodos.filter(t => (t.status || 'not_started') === 'not_started').length,
      in_progress: categoryTodos.filter(t => t.status === 'in_progress').length,
      completed: categoryTodos.filter(t => (t.status === 'completed' || t.is_complete)).length
    };
  };
  
  // Filter todos based on selected category
  const filteredTodos = filterCategory === 'uncategorized'
    ? todos.filter(t => t.category_id === null)
    : filterCategory 
    ? todos.filter(t => t.category_id === filterCategory)
    : todos;

  // Login/Signup Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo List</h1>
            <p className="text-gray-500">PostgreSQL-Style User System</p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setLoginMode('login')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  loginMode === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setLoginMode('signup')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  loginMode === 'signup'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3 text-black"
              disabled={loading}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-black"
              disabled={loading}
            />

            <button
              onClick={handleAuth}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                loginMode === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Powered by Supabase PostgreSQL
          </p>
        </div>
      </div>
    );
  }

  // Main Todo App (User is logged in)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Todo List</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <User size={14} />
                Logged in as <span className="font-medium">{currentUser.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader className="animate-spin" size={14} />
                  Saving...
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-500 mb-6">
            {activeTodos} active • {completedTodos} completed
          </p>

          {/* Categories Display - Simulating JOIN query */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                filterCategory === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilterCategory('uncategorized')}
              className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-sm transition-all ${
                filterCategory === 'uncategorized'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  filterCategory === 'uncategorized' ? 'bg-white' : 'bg-gray-400'
                }`}></span>
                <span>Uncategorized</span>
              </div>
              <span className={`text-xs mt-0.5 ${filterCategory === 'uncategorized' ? 'text-indigo-100' : 'text-gray-500'}`}>
                🔵 {getStatusCounts('uncategorized').not_started} 🟡 {getStatusCounts('uncategorized').in_progress} 🟢 {getStatusCounts('uncategorized').completed}
              </span>
            </button>
            {categories.map(category => {
              const counts = getStatusCounts(category.id);
              return (
                <div key={category.id} className="relative group">
                  <button
                    onClick={() => setFilterCategory(category.id)}
                    className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filterCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        filterCategory === category.id ? 'bg-white' : category.color
                      }`}></span>
                      <span>{category.name}</span>
                    </div>
                    <span className={`text-xs mt-0.5 ${filterCategory === category.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                      🔵 {counts.not_started} 🟡 {counts.in_progress} 🟢 {counts.completed}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category.id);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete category"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
            <Combobox
              value={categoryInput}
              onChange={(value) => setCategoryInput(value || '')}
              as="div"
              className="relative w-40"
            >
              <div className="relative">
                <Combobox.Input
                  placeholder="Category (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  onChange={(e) => setCategoryInput(e.target.value)}
                />
              </div>
              {filteredCategories.length > 0 && categoryInput && (
                <Combobox.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCategories.map(category => (
                    <Combobox.Option
                      key={category.id}
                      value={category.name}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-3 flex items-center gap-2 transition-colors ${
                          active ? 'bg-indigo-500 text-white' : 'text-gray-800 hover:bg-gray-50'
                        }`
                      }
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ 
                          backgroundColor: category.color 
                            .replace('bg-blue-500', '#3b82f6')
                            .replace('bg-green-500', '#22c55e')
                            .replace('bg-purple-500', '#a855f7')
                            .replace('bg-pink-500', '#ec4899')
                            .replace('bg-yellow-500', '#eab308')
                            .replace('bg-red-500', '#ef4444')
                        }}
                      ></span>
                      <span>{category.name}</span>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </Combobox>
            <button
              onClick={addTodo}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {filteredTodos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                {filterCategory ? 'No tasks in this category' : 'No tasks yet. Add one to get started!'}
              </p>
            ) : (
              filteredTodos.map(todo => {
                const category = getCategoryForTodo(todo.category_id);
                const status = (todo.status || 'not_started') as 'not_started' | 'in_progress' | 'completed';
                const statusColors = {
                  'not_started': 'border-blue-300',
                  'in_progress': 'border-yellow-300',
                  'completed': 'border-green-600'
                };
                const statusEmojis = {
                  'not_started': '🔵',
                  'in_progress': '🟡',
                  'completed': '🟢'
                };
                return (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => cycleStatus(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${statusColors[status]} hover:scale-110`}
                      title={`Status: ${status.replace('_', ' ')}`}
                    >
                      <span className="text-xs">{statusEmojis[status]}</span>
                    </button>
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            className="flex-1 px-2 py-1 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          />
                          <button
                            onClick={() => saveEdit(todo.id)}
                            disabled={saving}
                            className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => startEditing(todo.id, todo.task)}
                          className={`block cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded transition-colors ${
                            todo.is_complete
                              ? 'line-through text-gray-400'
                              : 'text-gray-800'
                          }`}
                        >
                          {todo.task}
                        </span>
                      )}
                      {category && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                          {category.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {completedTodos > 0 && (
            <button
              onClick={clearCompleted}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Clear completed tasks
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              DB Schema: users → todos (user_id FK) | categories → todos (category_id FK)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
