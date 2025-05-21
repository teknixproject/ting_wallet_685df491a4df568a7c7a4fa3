'use client';
import { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiMoreHorizontal, FiMinus, FiPlus, FiPause, FiGrid, 
  FiSettings, FiFilter, FiMapPin, FiTrash2
} from 'react-icons/fi';
import { FaTemperatureLow, FaWifi, FaHeadphones, FaLaptop, FaTv, FaPlus } from 'react-icons/fa';

export default function SmartHomeDashboard() {
  const [currentTemp, setCurrentTemp] = useState(30);
  const [lights, setLights] = useState(true);
  const [lastDaysData, setLastDaysData] = useState([]);
  const [timeLeft, setTimeLeft] = useState('1:22hrs left');
  
  // Generate random data for the bar chart
  useEffect(() => {
    const generateRandomData = () => {
      return Array.from({ length: 13 }, () => Math.floor(Math.random() * 70) + 10);
    };
    
    let data = generateRandomData();
    // Set specific high values for day 21 and 24 to match the image
    data[2] = 70; // Day 21
    data[5] = 60; // Day 24
    setLastDaysData(data);
  }, []);
  
  // Temperature control handlers
  const increaseTemp = () => {
    if (currentTemp < 40) {
      setCurrentTemp(prevTemp => prevTemp + 1);
    }
  };
  
  const decreaseTemp = () => {
    if (currentTemp > 10) {
      setCurrentTemp(prevTemp => prevTemp - 1);
    }
  };
  
  // Calculate the progress for the circular temperature control
  const calculateTemperatureProgress = () => {
    const minTemp = 10;
    const maxTemp = 30;
    const range = maxTemp - minTemp;
    const current = currentTemp - minTemp;
    return (current / range) * 100;
  };
  
  const progressPercentage = calculateTemperatureProgress();
  const circleCircumference = 2 * Math.PI * 120;
  const dashOffset = circleCircumference - (circleCircumference * progressPercentage) / 100;
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-8 gap-6">
          <div className="text-orange-400 font-bold">S</div>
          <div className="w-full h-px bg-gray-200"></div>
          <button className="p-2 text-gray-400 hover:text-purple-600 focus:outline-none"><FiGrid /></button>
          <button className="p-2 text-gray-400 hover:text-purple-600 focus:outline-none"><FiSettings /></button>
          <button className="p-2 text-gray-400 hover:text-purple-600 focus:outline-none"><FiFilter /></button>
          <div className="w-full h-px bg-gray-200"></div>
          <button className="p-2 text-purple-600 focus:outline-none"><FiMapPin /></button>
          <button className="p-2 text-gray-400 hover:text-purple-600 focus:outline-none"><FiLightbulb /></button>
          <button className="p-2 text-gray-400 hover:text-purple-600 focus:outline-none"><FiTrash2 /></button>
          <div className="mt-auto">
            <img 
              src="https://randomuser.me/api/portraits/women/44.jpg" 
              alt="User" 
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button className="text-gray-400 mr-3 focus:outline-none">
                <FiArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-gray-400 font-medium">Global</h2>
                <h1 className="text-2xl font-bold text-gray-800">Temperature</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">53%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border border-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                </div>
                <div className="w-10 h-5 bg-gray-200 rounded-full relative flex items-center">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5"></div>
                </div>
              </div>
              <button className="text-gray-400 focus:outline-none">
                <FiMoreHorizontal size={24} />
              </button>
            </div>
          </div>
          
          {/* Temperature Control */}
          <div className="mb-16">
            {/* Temperature Range Indicators */}
            <div className="flex justify-between mb-6">
              <div className="text-purple-600">20°C</div>
              <div className="text-gray-400">30°C</div>
            </div>
            
            {/* Temperature Dial */}
            <div className="flex justify-center items-center relative">
              {/* SVG Circle */}
              <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
                <circle
                  cx="150"
                  cy="150"
                  r="120"
                  stroke="#f0f0f0"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="150"
                  cy="150"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 150 150)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                
                {/* Marker */}
                <circle 
                  cx={150 + 120 * Math.cos((progressPercentage * 3.6 - 90) * Math.PI / 180)} 
                  cy={150 + 120 * Math.sin((progressPercentage * 3.6 - 90) * Math.PI / 180)} 
                  r="8" 
                  fill="#7c3aed" 
                />
              </svg>
              
              {/* Center Display */}
              <div className="w-48 h-48 bg-white rounded-full shadow-lg flex flex-col items-center justify-center z-10">
                <span className="text-gray-400 text-xs">Goal</span>
                <div className="text-4xl font-bold">
                  {currentTemp}
                  <span className="text-2xl text-gray-500">°C</span>
                </div>
              </div>
              
              {/* Temperature Controls */}
              <button 
                onClick={decreaseTemp}
                className="absolute left-16 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shadow hover:bg-gray-200 focus:outline-none"
              >
                <FiMinus />
              </button>
              <button 
                onClick={increaseTemp}
                className="absolute right-16 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shadow hover:bg-gray-200 focus:outline-none"
              >
                <FiPlus />
              </button>
            </div>
            
            {/* Time Remaining */}
            <div className="flex justify-center mt-8 items-center space-x-3">
              <FiPause className="text-gray-300" />
              <span className="text-gray-400">{timeLeft}</span>
            </div>
          </div>
          
          {/* Last Days Chart */}
          <div>
            <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Last days</h3>
            <div className="h-32 flex items-end space-x-2">
              {[19, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day, index) => {
                // Define colors for specific bars to match the image
                let barColor = 'bg-gray-200';
                if (day === 21) barColor = 'bg-orange-400'; // Orange bar
                if (day === 24) barColor = 'bg-purple-700'; // Purple bar
                
                // Get height from lastDaysData or default to low value
                const height = lastDaysData[index] || 10;
                const heightPercentage = `${height}%`;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-6 ${barColor} rounded-sm`} 
                      style={{ height: heightPercentage }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-72 border-l p-8">
          {/* Shortcuts */}
          <div className="mb-12">
            <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Shortcuts</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                  <FaTemperatureLow />
                </div>
                <div>
                  <h4 className="font-medium">Temperature</h4>
                  <p className="text-xs text-gray-500">24°C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white">
                  <FaWifi />
                </div>
                <div>
                  <h4 className="font-medium">Internet</h4>
                  <p className="text-xs text-gray-500">78.22</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white">
                  {/* <FiLightbulb /> */}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Lights</h4>
                  <p className="text-xs text-gray-500">9 + 4</p>
                </div>
                <div 
                  className={`w-10 h-5 rounded-full relative ${lights ? 'bg-green-400' : 'bg-gray-300'} cursor-pointer`}
                  onClick={() => setLights(!lights)}
                >
                  <div 
                    className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${lights ? 'translate-x-5' : 'translate-x-1'}`}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center">
                <button className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                  <FaPlus />
                </button>
                <div className="ml-3 text-gray-400 text-sm">Add</div>
              </div>
            </div>
          </div>
          
          {/* Devices */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs uppercase text-gray-500 tracking-wider">Devices</h3>
              <button className="text-gray-400 rotate-180 focus:outline-none">
                <FiArrowLeft size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center text-purple-600">
                  <FaHeadphones />
                </div>
                <span className="text-xs text-gray-500 mt-1">Audio</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                  <FaLaptop />
                </div>
                <span className="text-xs text-gray-500 mt-1">PC</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                  <FaTv />
                </div>
                <span className="text-xs text-gray-500 mt-1">TV</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center col-start-2">
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                  <FaPlus />
                </div>
                <span className="text-xs text-gray-500 mt-1">Add</span>
              </div>
            </div>
          </div>
          
          {/* Rooms */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase text-gray-500 tracking-wider">Rooms</h3>
              <button className="text-gray-400 rotate-180 focus:outline-none">
                <FiArrowLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}