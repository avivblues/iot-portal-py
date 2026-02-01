export const throughput24h = Array.from({ length: 24 }).map((_, index) => {
    const hour = index.toString().padStart(2, "0");
    const solarWave = Math.sin((index / 24) * Math.PI) * 28;
    const loadWave = Math.cos((index / 12) * Math.PI) * 6;
    const energy = Math.round((118 + solarWave + loadWave) * 10) / 10;
    const throughput = Math.round((3.8 + solarWave / 90 + loadWave / 60) * 100) / 100;
    return {
        timestamp: `${hour}:00`,
        energy,
        throughput
    };
});
export const alerts7d = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
    const seasonal = Math.sin(((idx + 1) / 7) * Math.PI * 1.2) * 3.4;
    const baseline = idx >= 4 ? 4.5 : 6.4;
    const alerts = Math.max(2, Math.round(baseline + seasonal));
    return { day, alerts };
});
export const consumptionSplit = [
    { label: "AHU", value: 32 },
    { label: "Chiller", value: 26 },
    { label: "IT Load", value: 18 },
    { label: "Utility", value: 14 },
    { label: "Lighting", value: 10 }
];
export const fleetHealth = {
    healthy: 228,
    warning: 18,
    critical: 5
};
