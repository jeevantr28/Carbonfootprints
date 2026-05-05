import React, { useState, useEffect } from 'react';
import { Download, Filter, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import api from '../api';

const ActivityHistory = () => {
  const [filter, setFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (category) => {
    setLoading(true);
    try {
      const url = category && category !== 'All' 
        ? `/activities?category=${category}` 
        : '/activities';
      const { data } = await api.get(url);
      setActivities(data.data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(filter);
  }, [filter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await api.delete(`/activities/${id}`);
        setActivities(activities.filter(a => a.id !== id));
      } catch (err) {
        console.error('Failed to delete activity', err);
      }
    }
  };

  const handleExport = () => {
    // Generate CSV from state
    if (activities.length === 0) return;
    const headers = ['Date', 'Category', 'Description', 'Amount', 'CO2_kg'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + activities.map(a => {
          return `${a.activity_date.split('T')[0]},${a.category},"${a.description}",${a.amount},${a.co2_kg}`;
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "carbon_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-wider mb-2">DATA <span className="font-light text-[#00FFB2]">ARCHIVE</span></h1>
          <p className="text-gray-400 font-mono text-sm">Historical emissions ledger.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter Dropdown */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#00FFB2] opacity-0 group-hover:opacity-20 blur transition-opacity rounded-lg"></div>
            <div className="relative flex items-center gap-2 glass-input px-4 py-2 border-[#00FFB2]/30">
              <Filter className="w-4 h-4 text-[#00FFB2]" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm font-mono tracking-widest uppercase outline-none text-white appearance-none pr-4 cursor-pointer"
              >
                <option value="All" className="bg-[#050810]">ALL SECTORS</option>
                <option value="Transport" className="bg-[#050810]">TRANSPORT</option>
                <option value="Food" className="bg-[#050810]">FOOD</option>
                <option value="Energy" className="bg-[#050810]">ENERGY</option>
                <option value="Waste" className="bg-[#050810]">WASTE</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="relative group overflow-hidden rounded-lg p-[1px]"
          >
            <span className="absolute inset-0 bg-[#0ea5e9] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#050810] px-4 py-2 flex items-center gap-2 rounded-lg transition-all group-hover:bg-opacity-50">
              <Download className="w-4 h-4 text-[#0ea5e9]" />
              <span className="text-sm font-mono tracking-widest uppercase text-white">Export CSV</span>
            </div>
          </button>
        </div>
      </header>

      {/* Data Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-mono text-xs tracking-widest uppercase text-gray-400">Date</th>
              <th className="py-4 px-6 font-mono text-xs tracking-widest uppercase text-gray-400">Sector</th>
              <th className="py-4 px-6 font-mono text-xs tracking-widest uppercase text-gray-400">Description</th>
              <th className="py-4 px-6 font-mono text-xs tracking-widest uppercase text-gray-400 text-right">CO₂ Impact</th>
              <th className="py-4 px-6 font-mono text-xs tracking-widest uppercase text-gray-400 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#00FFB2] font-mono tracking-widest uppercase animate-pulse">
                  Querying database...
                </td>
              </tr>
            ) : activities.map((activity, index) => {
              // The API returns lowercase category names like 'transport'
              const catLower = activity.category.toLowerCase();
              const catColor = 
                catLower === 'transport' ? '#00FFB2' :
                catLower === 'food' ? '#FF4C6A' :
                catLower === 'energy' ? '#0ea5e9' : '#a855f7';

              return (
                <tr 
                  key={activity.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <td className="py-4 px-6 font-mono text-sm text-gray-300">
                    {new Date(activity.activity_date).toISOString().split('T')[0]}
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-xs font-mono tracking-widest uppercase px-2 py-1 rounded-full border border-opacity-30"
                      style={{ color: catColor, borderColor: catColor, backgroundColor: `${catColor}10` }}
                    >
                      {activity.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-space text-gray-200">{activity.description}</td>
                  <td className="py-4 px-6 font-mono font-bold text-right text-glow-mint" style={{ color: catColor, textShadow: `0 0 8px ${catColor}60` }}>
                    {parseFloat(activity.co2_kg).toFixed(2)} kg
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleDelete(activity.id)}
                      className="text-gray-500 hover:text-[#FF4C6A] transition-colors p-2"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && activities.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 font-mono tracking-widest uppercase">
                  No records found for this sector.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityHistory;
