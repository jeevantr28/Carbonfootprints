import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Utensils, Zap, Trash2, Send } from 'lucide-react';
import clsx from 'clsx';
import api from '../api';

const categories = [
  { id: 'transport', label: 'Transport', icon: Car, color: '#00FFB2', multiplier: 0.2 },
  { id: 'food', label: 'Food', icon: Utensils, color: '#FF4C6A', multiplier: 2.5 },
  { id: 'energy', label: 'Energy', icon: Zap, color: '#0ea5e9', multiplier: 0.5 },
  { id: 'waste', label: 'Waste', icon: Trash2, color: '#a855f7', multiplier: 1.2 },
];

const LogActivity = () => {
  const [selectedCategory, setSelectedCategory] = useState('transport');
  const [inputValue, setInputValue] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const val = parseFloat(inputValue);
    const cat = categories.find(c => c.id === selectedCategory);
    if (!isNaN(val) && cat) {
      setEstimate((val * cat.multiplier).toFixed(2));
    } else {
      setEstimate(0);
    }
  }, [inputValue, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue) return;
    setIsSubmitting(true);
    
    try {
      await api.post('/activities', {
        category: selectedCategory,
        description: description || `${selectedCategory} log`,
        amount: parseFloat(inputValue),
        activity_date: dateValue
      });
      
      // Briefly show success state before redirect
      setTimeout(() => {
        navigate('/history');
      }, 500);
      
    } catch (err) {
      console.error('Failed to log activity', err);
      setIsSubmitting(false);
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 animate-fade-in-up">
      <div 
        className={clsx(
          "glass-panel w-full max-w-lg p-8 animate-float transition-all duration-300",
          isSubmitting ? "scale-95 blur-[2px]" : "scale-100 blur-0"
        )}
      >
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00FFB2] mb-2 text-glow-mint">
            LOG PARAMETERS
          </h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Input new environmental data</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-4 uppercase">Select Sector</label>
            <div className="grid grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={clsx(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
                      isSelected 
                        ? `border-[${cat.color}] bg-white/10 shadow-[0_0_15px_${cat.color}40]` 
                        : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}
                    style={{
                      borderColor: isSelected ? cat.color : undefined,
                      boxShadow: isSelected ? `0 0 15px ${cat.color}40` : undefined,
                    }}
                  >
                    <Icon 
                      className={clsx("w-6 h-6 mb-2 transition-colors")} 
                      style={{ color: isSelected ? cat.color : '#9ca3af' }}
                    />
                    <span 
                      className="text-[10px] font-mono tracking-wider uppercase"
                      style={{ color: isSelected ? cat.color : '#9ca3af' }}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase">Log Details</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Highway drive to work"
              className="w-full glass-input font-mono py-3 px-4 text-sm"
            />
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase flex justify-between">
              <span>Input Value</span>
              <span className="text-[#00FFB2] text-glow-mint">
                {selectedCategory === 'transport' ? 'MILES' : 
                 selectedCategory === 'food' ? 'SERVINGS' : 
                 selectedCategory === 'energy' ? 'kWh' : 'LBS'}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0.00"
                className="w-full glass-input text-4xl font-mono py-4 px-6 text-center placeholder-gray-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">CO₂ Est.</span>
                <span 
                  className="text-lg font-mono font-bold animate-flicker"
                  style={{ color: activeCategory?.color, textShadow: `0 0 10px ${activeCategory?.color}80` }}
                >
                  {estimate} kg
                </span>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase">Date Coordinate</label>
            <input
              type="date"
              required
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full glass-input font-mono py-3 px-4 text-center text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputValue || isSubmitting}
            className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-4"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#00FFB2] to-[#0ea5e9] opacity-70 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
            <div className="relative bg-[#050810] rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-50">
              <Send className="w-5 h-5 text-[#00FFB2]" />
              <span className="font-mono font-bold tracking-widest uppercase text-white">
                {isSubmitting ? 'Transmitting...' : 'Commit Data'}
              </span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogActivity;
