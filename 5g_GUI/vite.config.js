import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import vmConfig from './vmConfig.js';
const sshhost = vmConfig.ssh_host;
const AppPort = vmConfig.app_port;
const PORT = vmConfig.server_port;

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: '0.0.0.0', // Allows external access
        port: `${AppPort}`,
        https: false, // Disable HTTPS for the app

        proxy: {
            '/run-command': {
                target: `http://${sshhost}:${PORT}`, // Server endpoint running locally
                changeOrigin: true,
            },
        },
    }
});
