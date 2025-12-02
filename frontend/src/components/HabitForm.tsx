// frontend/src/components/HabitForm.tsx
import React, { useState } from 'react';
import { type Habit } from '../db/db';

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'points'>) => void;
  onCancel: () => void;
  initialData?: Habit;
}

const ICONS = ['📚', '💪', '🧘', '🏃', '🎨', '💻', '📝', '🎯', '🌱', '⚡', '🔥', '✨'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'study' as const,
    frequency: initialData?.frequency || 'daily' as const,
    icon: initialData?.icon || '📚',
    color: initialData?.color || '#3B82F6',
    reminderTime: initialData?.reminderTime || '',
    atomicCue: initialData?.atomicCue || '',
    atomicCraving: initialData?.atomicCraving || '',
    atomicResponse: initialData?.atomicResponse || '',
    atomicReward: initialData?.atomicReward || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Habit name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.atomicCue.trim()) newErrors.atomicCue = 'Cue is required (When/Where will you do it?)';
    if (!formData.atomicCraving.trim()) newErrors.atomicCraving = 'Craving is required (Why do you want this?)';
    if (!formData.atomicResponse.trim()) newErrors.atomicResponse = 'Response is required (What will you do?)';
    if (!formData.atomicReward.trim()) newErrors.atomicReward = 'Reward is required (What satisfaction will you get?)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? 'Edit Habit' : 'Create New Habit'}
      </h2>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Habit Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Study Algorithms"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="What do you want to accomplish?"
            rows={3}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Category & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="study">📚 Study</option>
              <option value="health">💪 Health</option>
              <option value="personal">🌱 Personal</option>
              <option value="other">⚡ Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
            </select>
          </div>
        </div>

        {/* Icon & Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => handleChange('icon', icon)}
                className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                  formData.icon === icon 
                    ? 'border-blue-500 bg-blue-50 scale-110' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  formData.color === color 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Atomic Habits Framework */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ⚡ Atomic Habits Framework
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Design your habit using the 4 Laws of Behavior Change
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 1. Cue (Make it Obvious) *
            </label>
            <input
              type="text"
              value={formData.atomicCue}
              onChange={(e) => handleChange('atomicCue', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.atomicCue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., After I wake up and have breakfast..."
            />
            {errors.atomicCue && <p className="text-red-500 text-xs mt-1">{errors.atomicCue}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💭 2. Craving (Make it Attractive) *
            </label>
            <input
              type="text"
              value={formData.atomicCraving}
              onChange={(e) => handleChange('atomicCraving', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.atomicCraving ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., I want to ace my exams and feel confident..."
            />
            {errors.atomicCraving && <p className="text-red-500 text-xs mt-1">{errors.atomicCraving}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚡ 3. Response (Make it Easy) *
            </label>
            <input
              type="text"
              value={formData.atomicResponse}
              onChange={(e) => handleChange('atomicResponse', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.atomicResponse ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., I will study algorithms for 30 minutes..."
            />
            {errors.atomicResponse && <p className="text-red-500 text-xs mt-1">{errors.atomicResponse}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎁 4. Reward (Make it Satisfying) *
            </label>
            <input
              type="text"
              value={formData.atomicReward}
              onChange={(e) => handleChange('atomicReward', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.atomicReward ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Then I can check my progress and earn points..."
            />
            {errors.atomicReward && <p className="text-red-500 text-xs mt-1">{errors.atomicReward}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {initialData ? 'Update Habit' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};