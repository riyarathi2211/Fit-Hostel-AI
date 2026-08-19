import React, { useState, useEffect } from 'react';

function ExerciseGuide() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const DATA_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
  const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching exercises:', err);
        setLoading(false);
      });
  }, []);

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-400 text-sm animate-pulse font-mono">Loading Exercise Library...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#17223b] p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-extrabold text-white">Exercise & Form Guide</h2>
          <p className="text-xs text-gray-400 mt-1">Visual demonstrations and execution steps</p>
        </div>
        <input
          type="text"
          placeholder="Search by exercise or muscle group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 bg-[#0a1627] border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.slice(0, 12).map((ex) => (
          <div key={ex.id} className="bg-[#17223b] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            
            <div>
              {/* Exercise Demonstration Image */}
              {ex.images && ex.images.length > 0 ? (
                <div className="bg-[#0a1627] rounded-xl p-2 mb-4 border border-gray-800/50 flex justify-center items-center h-48 overflow-hidden">
                  <img
                    src={`${IMAGE_BASE}${ex.images[0]}`}
                    alt={ex.name}
                    className="max-h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="bg-[#0a1627] rounded-xl mb-4 h-48 flex items-center justify-center text-xs text-gray-500">
                  No visual available
                </div>
              )}

              <h3 className="text-base font-bold text-cyan-400 capitalize">{ex.name}</h3>
              
              <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-md">
                  Target: {ex.primaryMuscles.join(', ')}
                </span>
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md">
                  {ex.equipment || 'Bodyweight'}
                </span>
              </div>

              {/* Execution Steps */}
              <div className="mt-4 space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">How to Perform:</p>
                <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside leading-relaxed">
                  {ex.instructions.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="text-gray-300">{step}</li>
                  ))}
                </ol>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ExerciseGuide;