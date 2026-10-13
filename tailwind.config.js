import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    primary: '#4361EE',       // Cobalt Blue
                    'primary-hover': '#3A53D0',
                    'primary-light': '#EEF2FF',
                    orange: '#FF9F1C',        // Accent Orange
                    'orange-light': '#FFF7ED',
                    teal: '#2EC4B6',          // Accent Teal
                    'teal-light': '#F0FDFA',
                    lavender: '#B8B8FF',      // Accent Lavender
                    'lavender-light': '#F5F5FF',
                    bg: '#F7F8FC',            // Main Background
                    surface: '#FFFFFF',       // Card / Surface
                    text: '#242943',          // Primary Text
                    muted: '#737B91',         // Muted Text
                    border: '#E4E7EF',        // Border
                    success: '#16A34A',
                    'success-bg': '#DCFCE7',
                    warning: '#D97706',
                    'warning-bg': '#FEF3C7',
                    danger: '#DC2626',
                    'danger-bg': '#FEE2E2',
                    info: '#2563EB',
                    'info-bg': '#DBEAFE',
                },
            },
            borderRadius: {
                badge: '6px',
                btn: '8px',
                card: '12px',
                panel: '16px',
            },
        },
    },

    plugins: [forms],
};
