import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi controller dan komponen Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * BookingChart — Grafik tren reservasi 7 hari menggunakan react-chartjs-2 (Unit 5 & 6).
 *
 * Menerima props:
 * - labels: array tanggal (contoh: ['6 Okt', '7 Okt', ...])
 * - values: array jumlah reservasi (hari tanpa data diisi 0 oleh PHP)
 */
export default function BookingChart({ labels = [], values = [], title = 'Tren Reservasi 7 Hari Terakhir' }) {
    const data = {
        labels: labels.length > 0 ? labels : ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'],
        datasets: [
            {
                label: 'Jumlah Reservasi',
                data: values.length > 0 ? values : [0, 0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: 'rgba(67, 97, 238, 0.12)',
                borderColor: '#4361EE',
                borderWidth: 2.5,
                pointBackgroundColor: '#4361EE',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#242943',
                titleColor: '#ffffff',
                bodyColor: '#B8B8FF',
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => ` ${context.parsed.y} reservasi`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    stepSize: 1,
                    color: '#737B91',
                    font: { size: 11 },
                },
                grid: {
                    color: '#F7F8FC',
                },
            },
            x: {
                ticks: {
                    color: '#737B91',
                    font: { size: 11 },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    const totalBookings = (values || []).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

    return (
        <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                    <h3 className="text-base font-bold text-[#242943]">{title}</h3>
                    <p className="text-xs text-[#737B91]">Jumlah pemesanan meja per hari</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] text-[#4361EE] rounded-md text-xs font-semibold">
                    <span>Total:</span>
                    <span>{totalBookings} reservasi</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
