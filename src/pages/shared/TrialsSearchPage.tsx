import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { 
  MagnifyingGlassIcon, 
  BeakerIcon, 
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface TrialSearchResult {
  nctNumber: string;
  title: string;
  summary: string;
  sponsor: string;
  status: string;
  phase: string;
  conditions: string[];
  locations: Array<{
    city: string;
    state: string;
    country: string;
    facility: string;
  }>;
}

export function TrialsSearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<TrialSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      // Call our Edge Function to search ClinicalTrials.gov
      const { data, error } = await supabase.functions.invoke('trials-search', {
        body: {
          condition: searchQuery,
          location: location || undefined,
          status: status || undefined,
          pageSize: 20,
        },
      });

      if (error) throw error;

      if (data?.data?.trials) {
        setResults(data.data.trials);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search trials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-lightest">
      {/* Header */}
      <div className="bg-white border-b border-neutral-light py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link to="/dashboard" className="text-neutral-dark hover:text-neutral-darkest">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-2">
            <BeakerIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-neutral-darkest">Clinical Trials Search</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Condition Search */}
              <div className="md:col-span-3">
                <label htmlFor="condition" className="block text-sm font-medium text-neutral-darkest mb-2">
                  Condition or Disease
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
                  <input
                    id="condition"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Brain Cancer, Diabetes, Heart Disease"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-darkest mb-2">
                  Location (Optional)
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, or Country"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-neutral-darkest mb-2">
                  Status (Optional)
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="RECRUITING">Recruiting</option>
                  <option value="ACTIVE_NOT_RECRUITING">Active, not recruiting</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !searchQuery}
                  className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search Trials'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-dark">Searching clinical trials...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <p className="text-neutral-dark">No trials found. Try adjusting your search criteria.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-neutral-dark mb-4">
              Found {results.length} clinical trials
            </p>
            <div className="space-y-4">
              {results.map((trial) => (
                <div key={trial.nctNumber} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                          {trial.nctNumber}
                        </span>
                        <span className="px-3 py-1 bg-secondary-blue/10 text-secondary-blue text-sm rounded-lg">
                          {trial.status}
                        </span>
                        {trial.phase && (
                          <span className="px-3 py-1 bg-neutral-light text-neutral-darkest text-sm rounded-lg">
                            Phase {trial.phase}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-neutral-darkest mb-2">
                        {trial.title}
                      </h3>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-neutral-dark mb-4 line-clamp-3">
                    {trial.summary}
                  </p>

                  {/* Conditions */}
                  {trial.conditions && trial.conditions.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {trial.conditions.slice(0, 3).map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-neutral-lightest text-neutral-darkest text-xs rounded">
                            {condition}
                          </span>
                        ))}
                        {trial.conditions.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-lightest text-neutral-darkest text-xs rounded">
                            +{trial.conditions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sponsor & Locations */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-neutral-light">
                    <div>
                      <p className="text-xs text-neutral-medium mb-1">Sponsor</p>
                      <p className="text-sm font-medium text-neutral-darkest">{trial.sponsor}</p>
                    </div>
                    {trial.locations && trial.locations.length > 0 && (
                      <div>
                        <p className="text-xs text-neutral-medium mb-1">Locations</p>
                        <div className="flex items-center space-x-1 text-sm text-neutral-darkest">
                          <MapPinIcon className="w-4 h-4 text-neutral-medium" />
                          <span>
                            {trial.locations[0].city}, {trial.locations[0].state || trial.locations[0].country}
                            {trial.locations.length > 1 && ` +${trial.locations.length - 1} more`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="mt-4 w-full py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition font-semibold">
                    View Trial Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
