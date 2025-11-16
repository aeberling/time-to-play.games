import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface ReverbConfig {
    host: string;
    port: number;
    scheme: string;
    app_key: string;
    app_id: string;
}

interface Props {
    reverbConfig: ReverbConfig;
}

export default function TestWebSocket({ reverbConfig }: Props) {
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    useEffect(() => {
        addLog('Testing WebSocket connection...');
        addLog(`Host: ${reverbConfig.host}`);
        addLog(`Port: ${reverbConfig.port}`);
        addLog(`Scheme: ${reverbConfig.scheme}`);
        addLog(`App Key: ${reverbConfig.app_key}`);
        addLog(`App ID: ${reverbConfig.app_id}`);

        // Test WebSocket connection
        const wsUrl = `${reverbConfig.scheme === 'https' ? 'wss' : 'ws'}://${reverbConfig.host}:${reverbConfig.port}/app/${reverbConfig.app_key}?protocol=7`;
        addLog(`Attempting connection to: ${wsUrl}`);

        setConnectionStatus('connecting');

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                addLog('✅ WebSocket connection opened!');
                setConnectionStatus('connected');

                // Send ping
                addLog('Sending ping...');
                ws.send(JSON.stringify({ event: 'pusher:ping' }));
            };

            ws.onmessage = (event) => {
                addLog(`📨 Received message: ${event.data}`);
            };

            ws.onerror = (error) => {
                addLog(`❌ WebSocket error: ${error}`);
                setConnectionStatus('error');
                setErrorMessage('WebSocket connection failed');
            };

            ws.onclose = (event) => {
                addLog(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
                if (connectionStatus !== 'error') {
                    setConnectionStatus('disconnected');
                }
            };

            // Cleanup on unmount
            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        } catch (error) {
            addLog(`❌ Exception: ${error}`);
            setConnectionStatus('error');
            setErrorMessage(String(error));
        }
    }, []);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-green-100 text-green-800';
            case 'connecting':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return '✅';
            case 'connecting':
                return '🔄';
            case 'error':
                return '❌';
            default:
                return '⭕';
        }
    };

    return (
        <>
            <Head title="WebSocket Connection Test" />

            <div className="min-h-screen bg-gray-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                            WebSocket Connection Test
                        </h1>

                        {/* Connection Status */}
                        <div className="mb-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${getStatusColor()}`}>
                                <span className="text-xl">{getStatusIcon()}</span>
                                <span className="capitalize">{connectionStatus}</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 font-medium">Error:</p>
                                <p className="text-red-700">{errorMessage}</p>
                            </div>
                        )}

                        {/* Configuration */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                Reverb Configuration
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-gray-600">Host:</div>
                                    <div className="text-gray-900">{reverbConfig.host}</div>

                                    <div className="text-gray-600">Port:</div>
                                    <div className="text-gray-900">{reverbConfig.port}</div>

                                    <div className="text-gray-600">Scheme:</div>
                                    <div className="text-gray-900">{reverbConfig.scheme}</div>

                                    <div className="text-gray-600">App Key:</div>
                                    <div className="text-gray-900">{reverbConfig.app_key}</div>

                                    <div className="text-gray-600">App ID:</div>
                                    <div className="text-gray-900">{reverbConfig.app_id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Connection Logs */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                Connection Log
                            </h2>
                            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                                {logs.map((log, index) => (
                                    <div key={index} className="mb-1">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Troubleshooting Tips */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Verify the Reverb background worker is running in Kinsta</li>
                                <li>Check that TCP proxy is configured correctly</li>
                                <li>Ensure REVERB_HOST and REVERB_PORT match the TCP proxy hostname</li>
                                <li>Verify REVERB_SCHEME is set to 'https'</li>
                                <li>Check Kinsta logs for Reverb server errors</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
