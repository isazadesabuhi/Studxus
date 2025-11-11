"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestTokenPage() {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function getToken() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setToken(data.session.access_token);
        setUser(data.session.user);
      }
    }
    getToken();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            No Active Session
          </h1>
          <p className="text-gray-600">
            Please sign in first to get your access token.
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔑 Your Access Token
          </h1>

          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>User:</strong> {user.email}
              </p>
              <p className="text-sm text-blue-800">
                <strong>ID:</strong> {user.id}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token (Bearer Token)
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  value={token}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                How to use in Postman:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>Copy the token above</li>
                <li>Open Postman</li>
                <li>Go to the Authorization tab</li>
                <li>Select Bearer Token type</li>
                <li>Paste the token</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Or use in Headers:
              </h3>
              <code className="block bg-white p-3 rounded border text-sm font-mono">
                Authorization: Bearer {token.substring(0, 30)}...
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Test</h2>
          <p className="text-gray-600 mb-4">
            Test your token by fetching your profile:
          </p>
          <button
            onClick={async () => {
              const res = await fetch("/api/profiles", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await res.json();
              alert(JSON.stringify(data, null, 2));
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Test Profile API
          </button>
        </div>
      </div>
    </div>
  );
}
