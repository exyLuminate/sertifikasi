/**
 * Bootstrap file — inisialisasi library global untuk frontend.
 *
 * File ini dijalankan sebelum app.jsx me-mount React.
 * Saat ini hanya menyiapkan axios dengan CSRF token header
 * (meskipun kita pakai Inertia, axios tetap berguna untuk
 * request tertentu seperti upload file atau helper).
 */
import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
