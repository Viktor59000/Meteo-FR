import Chart from 'chart.js/auto';

let hourlyChart;

export function initChart() {
    const canvas = document.getElementById('hourly-chart');
    if (!canvas) {
        console.warn('Chart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');

    // Gradient for temperature
    const gradientTemp = ctx.createLinearGradient(0, 0, 0, 400);
    gradientTemp.addColorStop(0, 'rgba(255, 200, 100, 0.5)');
    gradientTemp.addColorStop(1, 'rgba(255, 200, 100, 0)');

    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Précipitations (mm)',
                    data: [],
                    type: 'bar',
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    yAxisID: 'y1',
                    borderRadius: 4,
                    barThickness: 8
                },
                {
                    label: 'Température (°C)',
                    data: [],
                    borderColor: '#fbbf24',
                    backgroundColor: gradientTemp,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y',
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8' }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#94a3b8', maxTicksLimit: 8 }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#334155', drawBorder: false },
                    ticks: { color: '#94a3b8' }
                },
                y1: {
                    type: 'linear',
                    display: false, // Hide rain axis but keep scaling
                    position: 'right',
                    grid: { display: false },
                    min: 0,
                    suggestedMax: 10
                }
            }
        }
    });
}

export function updateHourlyChart(hourly) {
    if (!hourlyChart) return;

    const currentHour = new Date().getHours();
    const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);

    // Take next 24 hours
    const times = hourly.time.slice(startIndex, startIndex + 24).map(t =>
        new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
    const temps = hourly.temperature_2m.slice(startIndex, startIndex + 24);
    const rain = hourly.precipitation.slice(startIndex, startIndex + 24);

    hourlyChart.data.labels = times;
    hourlyChart.data.datasets[0].data = rain; // Bar (Rain)
    hourlyChart.data.datasets[1].data = temps; // Line (Temp)

    hourlyChart.update();
}
export function updateChart(hourly) {
    if (!hourlyChart) return;

    // Process data for next 24h
    const currentHour = new Date().getHours();
    const labels = [];
    const temps = [];
    const precip = [];

    for (let i = 0; i < 24; i++) {
        const index = hourly.time.findIndex(t => new Date(t).getHours() === (currentHour + i) % 24);
        if (index !== -1) {
            labels.push(`${(currentHour + i) % 24}h`);
            temps.push(hourly.temperature_2m[index]);
            precip.push(hourly.precipitation[index]);
        }
    }

    hourlyChart.data.labels = labels;
    hourlyChart.data.datasets[0].data = precip;
    hourlyChart.data.datasets[1].data = temps;
    hourlyChart.update();
}
