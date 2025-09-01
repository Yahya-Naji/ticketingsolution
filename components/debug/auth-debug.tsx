'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return (
    <div className="">
      {/* <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        {user && (
          <>
            <div>UID: {user.uid?.substring(0, 8)}...</div>
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>Name: {user.displayName}</div>
          </>
        )}
      </div> */}
    </div>
  );
};
