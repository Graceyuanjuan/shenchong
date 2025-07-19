import React from 'react';
import PetBowl from './components/PetBowl';

const MainUI: React.FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <PetBowl />
    </div>
  );
};

export default MainUI;
