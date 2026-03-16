// import { useMemo, useState } from "react";

// const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i); // 07:00 até 18:00

// function startOfWeek(date: Date) {
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = day === 0 ? -6 : 1 - day; // semana começando na segunda
//     d.setDate(d.getDate() + diff);
//     d.setHours(0, 0, 0, 0);
//     return d;
//     }

//     function addDays(date: Date, days: number) {
//     const d = new Date(date);
//     d.setDate(d.getDate() + days);
//     return d;
//     }

//     function formatHour(hour: number) {
//     return `${String(hour).padStart(2, "0")}:00`;
//     }

//     export default function AgendaVeiculosSemana() {
//     const [selectedDuration, setSelectedDuration] = useState(1); // horas
//     const [selectedVehicle, setSelectedVehicle] = useState({
//         placa: "ABC-1234",
//         modelo: "Toro",
//     });

//     const now = new Date();
//     const weekStart = useMemo(() => startOfWeek(now), [now]);

//     const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

//     function handleSlotClick(slotStart: Date, slotEnd: Date) {
//         const state = getSlotState(slotStart, slotEnd, reservasMock, now);

//         if (state.blocked) return;

//         console.log("Agendar veículo:", {
//         placa: selectedVehicle.placa,
//         modelo: selectedVehicle.modelo,
//         inicio: slotStart,
//         fim: slotEnd,
//         duracaoHoras: selectedDuration,
//         });
//     }

//     return (
//         <section className="min-h-screen bg-white text-gray-900 dark:bg-[#0b1220] dark:text-white p-6">
//         <div className="mx-auto max-w-7xl rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-xl overflow-hidden">
//             <div className="grid grid-cols-[320px_1fr] min-h-[80vh]">
            
//             {/* Sidebar */}
//             <aside className="border-r border-gray-200 dark:border-white/10 p-6 space-y-6">
//                 <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Veículo</p>
//                 <h2 className="text-3xl font-bold">{selectedVehicle.modelo}</h2>
//                 <p className="text-base text-gray-600 dark:text-gray-300">
//                     Placa: {selectedVehicle.placa}
//                 </p>
//                 </div>

//                 <div className="space-y-3">
//                 <p className="font-medium">Tempo de uso</p>
//                 <div className="flex flex-wrap gap-2">
//                     {[1, 2, 4, 8, 24].map((hours) => (
//                     <button
//                         key={hours}
//                         type="button"
//                         onClick={() => setSelectedDuration(hours)}
//                         className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
//                         selectedDuration === hours
//                             ? "bg-[#CDFF00] text-black"
//                             : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white"
//                         }`}
//                     >
//                         {hours === 24 ? "1 dia" : `${hours}h`}
//                     </button>
//                     ))}
//                 </div>
//                 </div>

//                 <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4 space-y-2 text-sm">
//                 <p><strong>Regras:</strong></p>
//                 <p>• Hoje, só pode agendar a partir de agora + 1 hora</p>
//                 <p>• Faixas listradas estão indisponíveis</p>
//                 <p>• Bloqueios podem ser por antecedência, reserva ou uso</p>
//                 </div>
//             </aside>

//             {/* Calendar */}
//             <div className="overflow-auto">
//                 <div className="grid grid-cols-[80px_repeat(7,minmax(140px,1fr))]">
                
//                 <div className="sticky top-0 z-20 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/10"></div>

//                 {days.map((day, idx) => (
//                     <div
//                     key={idx}
//                     className="sticky top-0 z-20 bg-white dark:bg-[#111827] border-b border-l border-gray-200 dark:border-white/10 p-3 text-center"
//                     >
//                     <p className="text-xs uppercase text-gray-500">
//                         {day.toLocaleDateString("pt-BR", { weekday: "short" })}
//                     </p>
//                     <p className="font-semibold">
//                         {day.toLocaleDateString("pt-BR", {
//                         day: "2-digit",
//                         month: "2-digit",
//                         })}
//                     </p>
//                     </div>
//                 ))}

//                 {HOURS.map((hour) => (
//                     <>
//                     <div
//                         key={`label-${hour}`}
//                         className="border-b border-gray-200 dark:border-white/10 p-3 text-sm text-gray-500"
//                     >
//                         {formatHour(hour)}
//                     </div>

//                     {days.map((day, dayIndex) => {
//                         const slotStart = new Date(day);
//                         slotStart.setHours(hour, 0, 0, 0);

//                         const slotEnd = new Date(slotStart);
//                         slotEnd.setHours(slotStart.getHours() + selectedDuration);

//                         const state = getSlotState(slotStart, slotEnd, reservasMock, now);

//                         return (
//                         <button
//                             key={`${dayIndex}-${hour}`}
//                             type="button"
//                             onClick={() => handleSlotClick(slotStart, slotEnd)}
//                             disabled={state.blocked}
//                             className={[
//                             "relative h-20 border-b border-l border-gray-200 dark:border-white/10 transition text-left p-2",
//                             state.blocked
//                                 ? "cursor-not-allowed bg-gray-100/70 dark:bg-white/5"
//                                 : "hover:bg-[#CDFF00]/20 dark:hover:bg-[#CDFF00]/10",
//                             state.striped
//                                 ? "bg-[repeating-linear-gradient(135deg,rgba(120,120,120,0.10)_0px,rgba(120,120,120,0.10)_4px,transparent_4px,transparent_8px)]"
//                                 : "",
//                             ].join(" ")}
//                         >
//                             <span className="text-xs font-medium">
//                             {!state.blocked ? "Disponível" : "Indisponível"}
//                             </span>

//                             {state.reason && (
//                             <span className="block text-[11px] text-gray-500 mt-1">
//                                 {state.reason === "cutoff" && "Antecedência mínima"}
//                                 {state.reason === "reserved" && "Reservado"}
//                                 {state.reason === "in_use" && "Em uso"}
//                             </span>
//                             )}
//                         </button>
//                         );
//                     })}
//                     </>
//                 ))}
//                 </div>
//             </div>
//             </div>
//         </div>
//         </section>
//     );
// }