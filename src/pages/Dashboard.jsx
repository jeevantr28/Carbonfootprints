import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Zap, Target, Globe, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import api from '../api';

const Dashboard = () => {
  const [showTips, setShowTips] = useState(false);
  const [summary, setSummary] = useState({ totalAllTime: 0, totalThisWeek: 0, totalThisMonth: 0, monthlyGoal: 100 });
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, categoryRes, trendRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/stats/by-category'),
          api.get('/stats/trend')
        ]);
        
        setSummary(summaryRes.data.data);
        
        // Format category data
        const colors = { transport: '#00FFB2', food: '#FF4C6A', energy: '#0ea5e9', waste: '#a855f7' };
        setCategoryData(categoryRes.data.data.map(item => ({
          ...item,
          color: colors[item.category] || '#ffffff'
        })));
        
        // Format trend data
        setTrendData(trendRes.data.data.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          co2: parseFloat(item.co2).toFixed(2)
        })));
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const timer = setTimeout(() => setShowTips(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const Card = ({ title, value, unit, icon: Icon, delay, isAlert }) => (
    <div 
      className={clsx(
        "glass-panel p-6 flex flex-col justify-between animate-float hover:-translate-y-4 transition-transform duration-500",
        isAlert ? "border-[#FF4C6A]/30 shadow-[0_0_24px_rgba(255,76,106,0.15)]" : ""
      )}
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 font-mono text-sm tracking-widest uppercase">{title}</h3>
        <Icon className={clsx("w-5 h-5", isAlert ? "text-[#FF4C6A]" : "text-[#00FFB2]")} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={clsx(
          "text-4xl font-mono font-bold",
          !loading && "animate-flicker",
          isAlert ? "text-[#FF4C6A] text-glow-warning" : "text-[#00FFB2] text-glow-mint"
        )}>
          {loading ? '...' : value}
        </span>
        <span className="text-gray-500 font-mono">{unit}</span>
      </div>
    </div>
  );

  const isOverGoal = parseFloat(summary.totalThisMonth) > parseFloat(summary.monthlyGoal);
  const goalDelta = isOverGoal 
    ? `+${(summary.totalThisMonth - summary.monthlyGoal).toFixed(1)}` 
    : `${(summary.monthlyGoal - summary.totalThisMonth).toFixed(1)} remaining`;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-wider mb-2">TELEMETRY <span className="font-light text-[#00FFB2]">OVERVIEW</span></h1>
        <p className="text-gray-400 font-mono text-sm">System nominal. Monitoring environmental impact parameters.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card title="Total Emissions" value={summary.totalAllTime} unit="kg CO₂" icon={Globe} delay="0s" />
        <Card title="Weekly Total" value={summary.totalThisWeek} unit="kg" icon={Zap} delay="0.2s" />
        <Card title="Monthly Goal Delta" value={goalDelta} unit={isOverGoal ? 'over limit' : 'to limit'} icon={Target} delay="0.4s" isAlert={isOverGoal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Line Chart */}
        <div className="glass-panel p-6 animate-float" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6">Emissions Timeline (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5, 8, 16, 0.9)', border: '1px solid #00FFB2', borderRadius: '8px' }}
                  itemStyle={{ color: '#00FFB2', fontFamily: 'JetBrains Mono' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#00FFB2" 
                  strokeWidth={3}
                  dot={{ fill: '#00FFB2', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8, fill: '#fff', stroke: '#00FFB2' }}
                  style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,255,178,0.8))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-panel p-6 animate-float" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6">Sector Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} />
                <YAxis dataKey="category" type="category" stroke="rgba(255,255,255,0.5)" tick={{fontFamily: 'JetBrains Mono', fontSize: 12}} width={80} style={{ textTransform: 'uppercase' }} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(5, 8, 16, 0.9)', border: '1px solid #00FFB2', borderRadius: '8px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Eco-tips Panel */}
      <div 
        className={clsx(
          "glass-panel border-[#0ea5e9]/30 p-6 flex items-start gap-4 transition-all duration-1000 transform",
          showTips ? "translate-y-0 opacity-100 shadow-[0_0_24px_rgba(14,165,233,0.15)]" : "translate-y-20 opacity-0"
        )}
      >
        <div className="bg-[#0ea5e9]/20 p-3 rounded-full mt-1">
          <AlertCircle className="w-6 h-6 text-[#0ea5e9] animate-pulse" />
        </div>
        <div>
          <h4 className="text-[#0ea5e9] font-mono font-bold tracking-widest uppercase mb-2 text-glow-mint" style={{ textShadow: '0 0 10px rgba(14,165,233,0.5)'}}>Incoming Transmission</h4>
          <p className="text-gray-300 font-space leading-relaxed">
            Reducing highway speed from 75mph to 65mph can cut fuel consumption by up to 15%. Consider engaging eco-cruising mode for your next transport vector.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
