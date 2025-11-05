import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function DebugPanel() {
  const { user, profile, loading } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    const results: any = {};

    try {
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('user_profile')
        .select('count')
        .limit(1);
      
      results.basicConnection = {
        success: !testError,
        error: testError?.message || null,
        data: testData
      };

      // Test 2: Current user auth
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      results.authTest = {
        success: !authError,
        error: authError?.message || null,
        userId: currentUser?.id || null,
        email: currentUser?.email || null
      };

      // Test 3: Profile query for current user
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        results.profileQuery = {
          success: !profileError,
          error: profileError?.message || null,
          errorCode: profileError?.code || null,
          data: profileData,
          hasProfile: !!profileData
        };

        // Test 4: Preferences query for current user
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preference')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        results.preferencesQuery = {
          success: !preferencesError,
          error: preferencesError?.message || null,
          errorCode: preferencesError?.code || null,
          data: preferencesData,
          hasPreferences: !!preferencesData
        };
      }

      // Test 5: Insert test (try to create profile if doesn't exist)
      if (currentUser && !results.profileQuery?.hasProfile) {
        const { data: insertData, error: insertError } = await supabase
          .from('user_profile')
          .upsert({
            user_id: currentUser.id,
            user_type: 'patient',
            full_name: 'Debug Test User',
            bio: 'Test profile created by debug panel'
          }, { onConflict: 'user_id' });

        results.profileInsert = {
          success: !insertError,
          error: insertError?.message || null,
          errorCode: insertError?.code || null,
          data: insertData
        };
      }

    } catch (error: any) {
      results.overallError = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }

    setTestResults(results);
    setIsTestingConnection(false);
  };

  if (!user || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border-2 border-red-200 rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-lg font-bold text-red-600 mb-3">🔧 Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth State:</strong>
          <div className="ml-2">
            <div>User ID: {user?.id || 'None'}</div>
            <div>Email: {user?.email || 'None'}</div>
            <div>Profile: {profile ? '✅ Loaded' : '❌ Missing'}</div>
            <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
          </div>
        </div>

        <button
          onClick={testDatabaseConnection}
          disabled={isTestingConnection}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTestingConnection ? 'Testing...' : 'Test Database Connection'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs max-h-64 overflow-y-auto">
            <strong>Test Results:</strong>
            <pre className="whitespace-pre-wrap mt-1">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}