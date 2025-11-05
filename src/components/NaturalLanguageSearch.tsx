import React, { useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface SearchResult {
  type: 'trial' | 'researcher' | 'publication';
  id: string;
  title: string;
  description: string;
  relevance_score: number;
  matching_terms: string[];
  details: any;
}

interface QueryIntent {
  intent: 'find_trials' | 'find_researchers' | 'search_publications' | 'general_info' | 'find_locations';
  confidence: number;
  extracted_entities: {
    conditions?: string[];
    locations?: string[];
    ages?: string;
    phases?: string[];
    study_types?: string[];
  };
}

interface SearchExplanation {
  query_processed: string;
  intent_detected: string;
  confidence: number;
  search_criteria_used: any;
  results_summary: {
    total_found: number;
    top_results_types: string[];
    relevance_range: string;
  };
  suggestions: string[];
}

const NaturalLanguageSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<QueryIntent | null>(null);
  const [explanation, setExplanation] = useState<SearchExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const exampleQueries = [
    "Find cancer trials near California for diabetes patients",
    "Search for depression research studies for adults over 50",
    "Looking for Phase 3 trials in New York for heart disease",
    "Find researchers studying Alzheimer's in Massachusetts",
    "Search for COVID-19 vaccine studies for elderly patients"
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-natural-language-search', {
        body: {
          query: query.trim(),
          search_type: 'all'
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setIntent(data.intent);
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error performing search:', error);
      alert('Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setTimeout(() => handleSearch(), 100);
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'trial': return '🧪';
      case 'researcher': return '👨‍🔬';
      case 'publication': return '📄';
      default: return '📋';
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'researcher': return 'bg-green-100 text-green-800 border-green-200';
      case 'publication': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-neutral-darkest">AI-Powered Natural Language Search</h2>
        </div>
        <p className="text-neutral-dark mb-6">
          Ask questions in plain English and let AI find the most relevant clinical trials, researchers, and publications.
        </p>

        {/* Search Input */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., 'Find cancer trials near California for patients over 65'"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Example Queries */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-gray-700">Try these examples:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Intent Analysis */}
      {intent && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-soft p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Search Intent Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Detected Intent:</span>
              <div className="font-medium text-gray-800 capitalize">{intent.intent.replace('_', ' ')}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Confidence:</span>
              <div className="font-medium text-gray-800">{intent.confidence}%</div>
            </div>
            {intent.extracted_entities.conditions && intent.extracted_entities.conditions.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-sm text-gray-600">Conditions Found:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {intent.extracted_entities.conditions.map((condition, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {intent.extracted_entities.locations && intent.extracted_entities.locations.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-sm text-gray-600">Locations Found:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {intent.extracted_entities.locations.map((location, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Search Results ({results.length})
            </h3>
            {explanation && (
              <p className="text-sm text-gray-600 mt-1">
                Found results with relevance scores between {explanation.results_summary.relevance_range}
              </p>
            )}
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results found. Try a different query or adjust your search terms.</p>
                {explanation?.suggestions && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {explanation.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getResultTypeIcon(result.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getResultTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRelevanceColor(result.relevance_score)}`}>
                          {result.relevance_score}%
                        </div>
                        <div className="text-xs text-gray-500">Relevance</div>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">{result.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.description}</p>
                    
                    {result.details && (
                      <div className="text-sm text-gray-700 mb-3">
                        {result.type === 'trial' && (
                          <div className="flex items-center space-x-4">
                            {result.details.phase && <span>Phase: {result.details.phase}</span>}
                            {result.details.status && <span>Status: {result.details.status}</span>}
                            {result.details.sponsor && <span>Sponsor: {result.details.sponsor}</span>}
                          </div>
                        )}
                        {result.type === 'researcher' && (
                          <div>
                            <span>Institution: {result.details.institution}</span>
                            {result.details.specialties && (
                              <span className="ml-4">Specialties: {result.details.specialties.slice(0, 3).join(', ')}</span>
                            )}
                          </div>
                        )}
                        {result.type === 'publication' && (
                          <div className="flex items-center space-x-4">
                            <span>Journal: {result.details.journal}</span>
                            {result.details.publication_date && <span>Date: {result.details.publication_date}</span>}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {result.matching_terms && result.matching_terms.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Matching terms: </span>
                        {result.matching_terms.map((term, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-1"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageSearch;
