'use client';

import { useEffect, useState } from 'react';

export default function DebugEnv() {
  const [envVars, setEnvVars] = useState({
    clientId: '',
    apiKey: '',
    hasClientId: false,
    hasApiKey: false,
  });

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
    
    setEnvVars({
      clientId: clientId.substring(0, 10) + '...' + clientId.substring(clientId.length - 5),
      apiKey: apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5),
      hasClientId: !!clientId,
      hasApiKey: !!apiKey,
    });
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-yellow-800 mb-2">Environment Variables Debug</h4>
      <div className="text-sm space-y-1">
        <p className="text-yellow-700">
          Client ID: {envVars.hasClientId ? '✅ ' + envVars.clientId : '❌ Missing'}
        </p>
        <p className="text-yellow-700">
          API Key: {envVars.hasApiKey ? '✅ ' + envVars.apiKey : '❌ Missing'}
        </p>
      </div>
    </div>
  );
}
