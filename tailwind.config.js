import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                adventure: {
                    // Light purple/lavender (from swatch)
                    900: '#6b4d9e',
                    800: '#8163b8',
                    700: '#9779d1',
                    600: '#ad8fea',
                    500: '#c3a5f4',
                    400: '#d0b8f7',
                    300: '#ddcbfa',
                    200: '#e9defc',
                    100: '#f6f1fe',
                    50: '#faf8ff',
                },
                quest: {
                    // Bright golden yellow (from swatch)
                    900: '#b8860b',
                    800: '#d4a017',
                    700: '#e6b01e',
                    600: '#ffc107',
                    500: '#ffd333',
                    400: '#ffdb5c',
                    300: '#ffe485',
                    200: '#ffedad',
                    100: '#fff5d6',
                    50: '#fffcf0',
                },
                treasure: {
                    // Muted teal/sage (from swatch)
                    900: '#3d5a54',
                    800: '#4d6e67',
                    700: '#5d837a',
                    600: '#6d978d',
                    500: '#7daba0',
                    400: '#97bdb4',
                    300: '#b1cfc8',
                    200: '#cbe1dc',
                    100: '#e5f3f0',
                    50: '#f5faf9',
                },
                coral: {
                    // Hot pink/magenta (from swatch)
                    900: '#c7004e',
                    800: '#d9005d',
                    700: '#eb006c',
                    600: '#ff0080',
                    500: '#ff3399',
                    400: '#ff5cad',
                    300: '#ff85c2',
                    200: '#ffadd6',
                    100: '#ffd6eb',
                    50: '#fff0f7',
                },
                cyan: {
                    // Bright cyan/turquoise (from swatch)
                    900: '#007a8c',
                    800: '#0091a6',
                    700: '#00a8c0',
                    600: '#00bfda',
                    500: '#00d4ed',
                    400: '#33ddf1',
                    300: '#66e5f4',
                    200: '#99eef8',
                    100: '#ccf6fb',
                    50: '#f0fcfe',
                },
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'float-slow': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'wiggle-slow': 'wiggle 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 3s infinite',
                'sway': 'sway 4s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { opacity: '0.7' },
                    '100%': { opacity: '1' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                sway: {
                    '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
                    '25%': { transform: 'translateX(10px) rotate(2deg)' },
                    '75%': { transform: 'translateX(-10px) rotate(-2deg)' },
                },
            },
        },
    },

    plugins: [forms],
};
