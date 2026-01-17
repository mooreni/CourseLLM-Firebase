'use client';

import { courses } from '@/lib/mock-data';

interface SearchBarProps {
    query: string;
    setQuery: (query: string) => void;
    onSearch: () => void;
}

export default function SearchBar({ query, setQuery, onSearch }: SearchBarProps) {
    return (
        <div className="flex space-x-2">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="flex-grow p-2 border rounded"
                list="courses-list"
            />
            <datalist id="courses-list">
                {courses.map(course => (
                    <option key={course.id} value={course.title} />
                ))}
            </datalist>
            <button onClick={onSearch} className="p-2 bg-blue-500 text-white rounded">
                Search
            </button>
        </div>
    );
}
