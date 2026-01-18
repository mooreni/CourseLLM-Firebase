'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProviderClient';
import SearchBar from './_components/SearchBar';
import SearchFilters from './_components/SearchFilters';
import SearchResults from './_components/SearchResults';
import { SearchResult } from './types';

export default function SearchPage() {
  const router = useRouter();
  const { profile, firebaseUser, user } = useAuth() as any; // support either name
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [topK, setTopK] = useState(Number(searchParams.get('topK')) || 5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (courseId) newParams.set('courseId', courseId);
    if (type) newParams.set('type', type);
    if (topK) newParams.set('topK', topK.toString());
    router.push(`/search?${newParams.toString()}`);
  }, [query, courseId, type, topK, router]);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      console.warn('⚠️ Query too short');
      setResults([]);
      return;
    }

    if (!courseId.trim()) {
      console.error('❌ courseId is required');
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Get Firebase ID token so search-service auth passes
      const fbUser = firebaseUser ?? user ?? null;
      const token = fbUser ? await fbUser.getIdToken() : null;

      console.log('📤 Sending search request:', { q: query, courseId, type, topK });

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ q: query, courseId, type, topK }),
      });

      console.log('📥 Response:', { status: response.status }, 'token =', token);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Search failed:', response.status, text);
        setResults([]);
        return;
      }

      const data = await response.json();
      console.log('✅ Search results:', data);
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (error) {
      console.error('❌ Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const dashboardUrl = profile?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <Link href={dashboardUrl}>
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      <div className="space-y-4">
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
        <SearchFilters
          courseId={courseId}
          setCourseId={setCourseId}
          type={type}
          setType={setType}
          topK={topK}
          setTopK={setTopK}
        />
        {loading ? <div>Loading...</div> : <SearchResults results={results} />}
      </div>
    </div>
  );
}
