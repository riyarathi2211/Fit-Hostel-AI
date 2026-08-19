// src/pages/WorkoutPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getWgerExerciseData } from "../services/wgerService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60";

function WorkoutPage() {
  const [schedule, setSchedule] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState("0-0");

  useEffect(() => {
    const fetchFullBlueprint = async () => {
      try {
        // Changed localStorage -> sessionStorage
        const token = sessionStorage.getItem("token");

        // 1. Fetch user routine blueprint from backend
        const workoutRes = await axios.get("http://localhost:5000/api/workout/my-plan", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawSchedule = workoutRes.data?.schedule || workoutRes.data?.workoutPlan || [];
        setMeta(workoutRes.data?.meta || {});

        // 2. Process all days and enrich exercises dynamically via Wger/Multi-Source API
        const enrichedSchedule = await Promise.all(
          rawSchedule.map(async (dayObj) => {
            const rawExercises = dayObj.exercises || dayObj.workout || [];
            const list = Array.isArray(rawExercises) ? rawExercises : [];

            const enrichedExercises = await Promise.all(
              list.map(async (item) => {
                const rawName = typeof item === "string" ? item : (item.name || item.exercise || "");

                // Fetch dynamic metadata & visuals
                const liveData = await getWgerExerciseData(rawName);

                // Instructions Priority: Backend > Wger/DB > Dynamic Fallback Template
                let finalInstructions = [];
                if (item.instructions && Array.isArray(item.instructions) && item.instructions.length > 0) {
                  finalInstructions = item.instructions;
                } else if (liveData?.instructions && liveData.instructions.length > 0) {
                  finalInstructions = liveData.instructions;
                } else {
                  finalInstructions = [
                    `Set up with proper posture and core braced for ${rawName}.`,
                    `Perform controlled repetitions focusing on full target movement.`,
                    `Maintain steady rhythm and controlled breathing throughout the set.`
                  ];
                }

                return {
                  name: rawName || "Scheduled Exercise",
                  sets: typeof item === "object" && item.sets ? `${item.sets} Sets` : "3 Sets",
                  reps: typeof item === "object" && item.reps ? item.reps : "8-10 reps",
                  target: item.target || liveData?.target || "General Fitness",
                  images: liveData?.images || [],
                  instructions: finalInstructions
                };
              })
            );

            return {
              ...dayObj,
              exercises: enrichedExercises
            };
          })
        );

        setSchedule(enrichedSchedule);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching workout blueprint:", err);
        setLoading(false);
      }
    };

    fetchFullBlueprint();
  }, []);

  const toggleExpand = (key) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4 font-mono">
        <div className="p-6 bg-[#17223b] rounded-2xl border border-gray-800 animate-pulse text-gray-400 text-sm">
          Fetching full weekly training blueprint & live exercise visuals...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-[#17223b] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">
          Training Blueprint
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-400">
            GOAL: <strong className="text-cyan-400 font-bold uppercase">{meta.assignedGoal || "FITNESS"}</strong>
          </span>
        </div>
      </div>

      {/* SCHEDULE DAYS LOOP */}
      <div className="space-y-8">
        {schedule.map((dayData, dayIdx) => (
          <div key={dayIdx} className="bg-[#17223b] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wider">
                {dayData.day || `Day ${dayIdx + 1}`}{" "}
                <span className="text-gray-400 font-normal lowercase">— {dayData.focus || "Target Session"}</span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {dayData.exercises.map((ex, exIdx) => {
                const itemKey = `${dayIdx}-${exIdx}`;
                const isExpanded = expandedKey === itemKey;

                return (
                  <div
                    key={exIdx}
                    onClick={() => toggleExpand(itemKey)}
                    className={`bg-[#0a1627] border ${
                      isExpanded
                        ? "border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "border-gray-800/80 hover:border-gray-700"
                    } p-5 rounded-xl transition-all cursor-pointer space-y-4`}
                  >
                    {/* EXERCISE HEADER */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-cyan-400 capitalize">{ex.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Target: <span className="text-gray-200 capitalize font-medium">{ex.target}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-md border border-cyan-500/20 font-mono font-bold whitespace-nowrap">
                          {ex.sets} • {ex.reps}
                        </span>
                        <span className="text-gray-400 text-sm font-black">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {/* EXPANDABLE DETAILS */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-gray-800/80 space-y-4">
                        {/* VISUAL PROCEDURE */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Procedure:</p>

                          {ex.images && ex.images.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-xl border border-gray-800/60">
                              {ex.images.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="flex flex-col items-center">
                                  <div className="h-48 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 p-2 border border-gray-800/40">
                                    <img
                                      src={imgUrl}
                                      alt={`${ex.name} step ${imgIdx + 1}`}
                                      className="max-h-full object-contain rounded"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = FALLBACK_IMAGE;
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-cyan-400 font-mono mt-1.5 uppercase font-bold tracking-wider">
                                    {imgIdx === 0 ? "Step 1: Start Position" : `Step ${imgIdx + 1}: Execution`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* GRAPHIC PLACEHOLDER (Fallback visual if no API image is returned) */
                            <div className="bg-slate-900/80 p-4 rounded-xl border border-gray-800/60 flex flex-col items-center justify-center text-center py-6 gap-3">
                              <div className="h-44 w-full max-w-sm flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 p-2 border border-gray-800/40">
                                <img
                                  src={FALLBACK_IMAGE}
                                  alt={`${ex.name} exercise guide`}
                                  className="max-h-full object-contain rounded"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-xs text-gray-300 font-medium">Standard Execution Guide</p>
                              <p className="text-[11px] text-gray-500">
                                Follow the step-by-step procedure below for correct technique.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* STEP-BY-STEP INSTRUCTIONS */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step-by-Step Execution:</p>
                          <ol className="text-sm text-gray-200 list-decimal list-inside space-y-2 leading-relaxed">
                            {ex.instructions.map((step, idx) => (
                              <li key={idx} className="pl-1">{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutPage;