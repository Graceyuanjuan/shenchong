import React from 'react';
import PetBowl from './components/PetBowl';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <h1 className="text-2xl font-bold text-center mb-8">神宠系统测试</h1>
      <div className="text-center mb-4">
        <p className="text-gray-600">如果你看到这个文字，说明React和Tailwind都正常工作</p>
      </div>
      <PetBowl />
    </div>
  );
}
