import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, Coffee, Pill, MessageSquare, AlertTriangle, Brain, Sparkles, ChevronRight, Plus, Download, Filter } from 'lucide-react';

const DiabetesTrackerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [readings, setReadings] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showAddReading, setShowAddReading] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('week');

  // Initialize with sample data
  useEffect(() => {
    const sampleReadings = [
      { id: 1, value: 95, type: 'fasting', date: '2024-09-12 07:00', note: 'Morning' },
      { id: 2, value: 140, type: 'post-meal', date: '2024-09-12 13:30', note: 'After lunch' },
      { id: 3, value: 110, type: 'fasting', date: '2024-09-13 07:15', note: '' },
      { id: 4, value: 165, type: 'post-meal', date: '2024-09-13 20:00', note: 'After dinner' },
      { id: 5, value: 88, type: 'fasting', date: '2024-09-14 06:45', note: 'Morning' },
      { id: 6, value: 135, type: 'post-meal', date: '2024-09-14 13:00', note: 'After lunch' },
      { id: 7, value: 92, type: 'fasting', date: '2024-09-15 07:30', note: '' },
      { id: 8, value: 158, type: 'post-meal', date: '2024-09-15 19:45', note: 'Pizza dinner' },
      { id: 9, value: 98, type: 'fasting', date: '2024-09-16 07:00', note: 'Morning' },
      { id: 10, value: 128, type: 'post-meal', date: '2024-09-16 12:45', note: 'Salad lunch' },
      { id: 11, value: 105, type: 'fasting', date: '2024-09-17 07:20', note: '' },
      { id: 12, value: 142, type: 'post-meal', date: '2024-09-17 20:15', note: 'After dinner' },
      { id: 13, value: 90, type: 'fasting', date: '2024-09-18 06:50', note: 'Morning' },
    ];

    const sampleFoods = [
      { id: 1, name: 'Oatmeal with berries', calories: 250, gi: 55, date: '2024-09-18 07:30' },
      { id: 2, name: 'Grilled chicken salad', calories: 320, gi: 35, date: '2024-09-17 13:00' },
      { id: 3, name: 'Brown rice and vegetables', calories: 380, gi: 50, date: '2024-09-17 20:00' },
      { id: 4, name: 'Greek yogurt', calories: 150, gi: 40, date: '2024-09-16 10:00' },
    ];

    const sampleMeds = [
      { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '08:00, 20:00' },
      { id: 2, name: 'Insulin', dosage: '10 units', frequency: 'Before meals', time: 'As needed' },
    ];

    setReadings(sampleReadings);
    setFoodLogs(sampleFoods);
    setMedications(sampleMeds);
  }, []);

  // AI Chatbot logic
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            ...chatMessages,
            userMessage
          ].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          system: 'You are a helpful diabetes health assistant. Provide clear, supportive advice about blood sugar management, diet, and lifestyle. Keep responses concise and actionable. Always remind users to consult their healthcare provider for medical decisions.'
        })
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Calculate statistics
  const getStats = () => {
    if (readings.length === 0) return { avg: 0, high: 0, low: 0, trend: 0 };
    
    const values = readings.map(r => r.value);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const high = Math.max(...values);
    const low = Math.min(...values);
    
    const recent = readings.slice(-5).map(r => r.value);
    const older = readings.slice(-10, -5).map(r => r.value);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    const trend = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);

    return { avg, high, low, trend };
  };

  const stats = getStats();

  // AI Pattern Detection
  const detectPatterns = () => {
    const patterns = [];
    
    const postMealReadings = readings.filter(r => r.type === 'post-meal');
    const highPostMeal = postMealReadings.filter(r => r.value > 180);
    if (highPostMeal.length > 2) {
      patterns.push({
        type: 'warning',
        title: 'Frequent post-meal spikes detected',
        desc: `${highPostMeal.length} readings above 180 mg/dL after meals`,
        action: 'Consider smaller portions or lower GI foods'
      });
    }

    const morningReadings = readings.filter(r => r.type === 'fasting');
    const avgMorning = morningReadings.reduce((sum, r) => sum + r.value, 0) / morningReadings.length;
    if (avgMorning > 120) {
      patterns.push({
        type: 'alert',
        title: 'Elevated fasting glucose',
        desc: `Average morning reading: ${avgMorning.toFixed(1)} mg/dL`,
        action: 'Review dinner timing and evening snacks'
      });
    }

    if (readings.some(r => r.note?.toLowerCase().includes('pizza')) && readings.some(r => r.value > 160)) {
      patterns.push({
        type: 'insight',
        title: 'Pizza may cause spikes',
        desc: 'High readings observed after pizza meals',
        action: 'Try thin crust or smaller portions'
      });
    }

    return patterns;
  };

  const patterns = detectPatterns();

  // Chart data preparation
  const chartData = readings.slice(-20).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: r.value,
    type: r.type,
    target: 120
  }));

  // Heatmap data
  const getHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const times = ['Morning', 'Afternoon', 'Evening', 'Night'];
    
    return times.map(time => {
      const data = { time };
      days.forEach(day => {
        data[day] = Math.floor(Math.random() * 80) + 80; // Sample data
      });
      return data;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Activity className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Diatrack
                </h1>
                <p className="text-sm text-gray-500">Your Intelligent Diabetes Companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-2">
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-1 border-b border-gray-200 -mb-px">
            {['dashboard', 'analytics', 'ai-chat', 'logs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Average</span>
                  <Activity className="text-indigo-500" size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.avg}</div>
                <div className="text-sm text-gray-500 mt-1">mg/dL</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Highest</span>
                  <TrendingUp className="text-red-500" size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.high}</div>
                <div className="text-sm text-gray-500 mt-1">mg/dL</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Lowest</span>
                  <TrendingDown className="text-green-500" size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.low}</div>
                <div className="text-sm text-gray-500 mt-1">mg/dL</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">7-Day Trend</span>
                  {parseFloat(stats.trend) > 0 ? (
                    <TrendingUp className="text-orange-500" size={20} />
                  ) : (
                    <TrendingDown className="text-green-500" size={20} />
                  )}
                </div>
                <div className={`text-3xl font-bold ${parseFloat(stats.trend) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {stats.trend > 0 ? '+' : ''}{stats.trend}%
                </div>
                <div className="text-sm text-gray-500 mt-1">vs last week</div>
              </div>
            </div>

            {/* AI Insights */}
            {patterns.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="text-purple-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">AI-Detected Patterns</h2>
                  <Sparkles className="text-yellow-500" size={20} />
                </div>
                <div className="space-y-3">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className={`mt-1 ${
                          pattern.type === 'warning' ? 'text-orange-500' : 
                          pattern.type === 'alert' ? 'text-red-500' : 'text-blue-500'
                        }`} size={20} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{pattern.desc}</p>
                          <div className="mt-2 flex items-center text-sm text-indigo-600 font-medium">
                            <ChevronRight size={16} />
                            <span>{pattern.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Blood Sugar Trends</h2>
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowAddReading(true)}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="mb-2" size={24} />
                <div className="font-semibold">Log Reading</div>
                <div className="text-sm text-indigo-100 mt-1">Record blood sugar</div>
              </button>

              <button
                onClick={() => setShowAddFood(true)}
                className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Coffee className="mb-2" size={24} />
                <div className="font-semibold">Log Meal</div>
                <div className="text-sm text-green-100 mt-1">Track what you eat</div>
              </button>

              <button
                onClick={() => setShowAddMed(true)}
                className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Pill className="mb-2" size={24} />
                <div className="font-semibold">Log Medication</div>
                <div className="text-sm text-pink-100 mt-1">Track your meds</div>
              </button>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Time-of-Day Heatmap</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-sm font-medium text-gray-600">Time</th>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <th key={day} className="text-center p-2 text-sm font-medium text-gray-600">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getHeatmapData().map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-sm font-medium text-gray-700">{row.time}</td>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const value = row[day];
                          const color = value < 100 ? 'bg-green-200' : value < 140 ? 'bg-yellow-200' : 'bg-red-200';
                          return (
                            <td key={day} className="p-1">
                              <div className={`${color} rounded p-2 text-center text-sm font-semibold`}>
                                {value}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meal Impact Analysis</h2>
              <div className="space-y-4">
                {foodLogs.slice(0, 5).map((food, idx) => (
                  <div key={food.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{food.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {food.calories} cal • GI: {food.gi}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Impact</div>
                      <div className={`font-bold ${food.gi < 55 ? 'text-green-600' : food.gi < 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {food.gi < 55 ? 'Low' : food.gi < 70 ? 'Medium' : 'High'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'ai-chat' && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 h-[600px] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <MessageSquare className="text-white" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white">AI Health Assistant</h2>
                  <p className="text-indigo-100 text-sm">Ask me anything about diabetes management</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="mx-auto text-indigo-300 mb-4" size={48} />
                  <p className="text-gray-500">Start a conversation with your AI assistant</p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {[
                      'What foods should I avoid?',
                      'How can I lower my morning readings?',
                      'Explain my recent spike',
                      'Best exercises for diabetes'
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(q)}
                        className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm text-indigo-700 transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your question..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isAiTyping || !chatInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Blood Sugar Readings</h2>
              <div className="space-y-2">
                {readings.slice().reverse().slice(0, 10).map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{reading.value} mg/dL</div>
                      <div className="text-sm text-gray-600">
                        {reading.type} • {reading.date}
                      </div>
                      {reading.note && <div className="text-sm text-gray-500 mt-1">{reading.note}</div>}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reading.value < 100 ? 'bg-green-100 text-green-700' :
                      reading.value < 140 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reading.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Food Logs</h2>
              <div className="space-y-2">
                {foodLogs.slice().reverse().map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{food.name}</div>
                      <div className="text-sm text-gray-600">{food.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{food.calories} cal</div>
                      <div className="text-sm text-gray-600">GI: {food.gi}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Medications</h2>
              <div className="space-y-2">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{med.name}</div>
                      <div className="text-sm text-gray-600">{med.dosage} • {med.frequency}</div>
                    </div>
                    <div className="text-sm text-gray-600">{med.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Adding Reading */}
      {showAddReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Log Blood Sugar Reading</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newReading = {
                id: readings.length + 1,
                value: parseFloat(formData.get('value')),
                type: formData.get('type'),
                date: formData.get('date') || new Date().toISOString().slice(0, 16),
                note: formData.get('note')
              };
              setReadings([...readings, newReading]);
              setShowAddReading(false);
              e.target.reset();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Sugar (mg/dL)</label>
                  <input type="number" name="value" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="fasting">Fasting</option>
                    <option value="post-meal">Post-Meal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" name="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <input type="text" name="note" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddReading(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Food */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Log Meal</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newFood = {
                id: foodLogs.length + 1,
                name: formData.get('name'),
                calories: parseInt(formData.get('calories')),
                gi: parseInt(formData.get('gi')),
                date: formData.get('date') || new Date().toISOString().slice(0, 16)
              };
              setFoodLogs([...foodLogs, newFood]);
              setShowAddFood(false);
              e.target.reset();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
                  <input type="text" name="name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input type="number" name="calories" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Glycemic Index</label>
                  <input type="number" name="gi" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" name="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddFood(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Medication */}
      {showAddMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Log Medication</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newMed = {
                id: medications.length + 1,
                name: formData.get('name'),
                dosage: formData.get('dosage'),
                frequency: formData.get('frequency'),
                time: formData.get('time')
              };
              setMedications([...medications, newMed]);
              setShowAddMed(false);
              e.target.reset();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                  <input type="text" name="name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input type="text" name="dosage" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <input type="text" name="frequency" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="text" name="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddMed(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiabetesTrackerApp;