import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface PublicationSearchResult {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  pubDate: string;
  doi: string | null;
  volume: string;
  issue: string;
  pages: string;
}

export function PublicationsSearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PublicationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PublicationSearchResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('pubmed-search', {
        body: {
          query: searchQuery,
          maxResults: 20,
        },
      });

      if (error) throw error;

      if (data?.data?.publications) {
        setResults(data.data.publications);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search publications. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize(pub: PublicationSearchResult) {
    setSelectedPub(pub);
    setSummarizing(true);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: {
          text: `${pub.title}. Published in ${pub.journal}. Authors: ${pub.authors}.`,
          type: 'publication',
        },
      });

      if (error) throw error;

      if (data?.data?.summary) {
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Summarization error:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
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
            <DocumentTextIcon className="w-6 h-6 text-secondary-blue" />
            <h1 className="text-2xl font-bold text-neutral-darkest">Publications Search</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-neutral-darkest mb-2">
                Search PubMed
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
                <input
                  id="query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for medical research, diseases, treatments..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-secondary-blue focus:border-transparent"
                />
              </div>
              <p className="text-xs text-neutral-medium mt-2">
                Example: "brain cancer treatment 2024" or "diabetes prevention strategies"
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !searchQuery}
              className="w-full py-3 bg-secondary-blue text-white rounded-xl hover:bg-secondary-deepBlue transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching PubMed...' : 'Search Publications'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-blue mx-auto mb-4"></div>
            <p className="text-neutral-dark">Searching medical literature...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && searched && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-neutral-medium mx-auto mb-4" />
            <p className="text-neutral-dark">No publications found. Try different keywords.</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <p className="text-neutral-dark mb-4">
              Found {results.length} publications from PubMed
            </p>
            <div className="space-y-4">
              {results.map((pub) => (
                <div key={pub.pmid} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition">
                  {/* Publication Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-neutral-darkest flex-1 pr-4">
                        {pub.title}
                      </h3>
                      <span className="px-3 py-1 bg-secondary-blue/10 text-secondary-blue text-xs font-medium rounded-lg whitespace-nowrap">
                        PMID: {pub.pmid}
                      </span>
                    </div>
                  </div>

                  {/* Authors & Journal */}
                  <div className="mb-4">
                    <p className="text-sm text-neutral-dark mb-1">
                      <span className="font-medium">Authors:</span> {pub.authors}
                    </p>
                    <p className="text-sm text-neutral-dark">
                      <span className="font-medium">Journal:</span> {pub.journal}
                      {pub.volume && ` | Vol. ${pub.volume}`}
                      {pub.issue && ` (${pub.issue})`}
                      {pub.pages && ` | pp. ${pub.pages}`}
                    </p>
                  </div>

                  {/* Publication Date & DOI */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-light mb-4">
                    <div className="text-sm text-neutral-medium">
                      Published: {pub.pubDate}
                    </div>
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary-blue hover:underline"
                      >
                        DOI: {pub.doi}
                      </a>
                    )}
                  </div>

                  {/* AI Summary Section */}
                  {selectedPub?.pmid === pub.pmid && (
                    <div className="mt-4 p-4 bg-secondary-blue/5 rounded-xl border border-secondary-blue/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-secondary-blue" />
                        <h4 className="font-semibold text-secondary-blue">AI Summary</h4>
                      </div>
                      {summarizing ? (
                        <p className="text-sm text-neutral-dark">Generating summary...</p>
                      ) : summary ? (
                        <p className="text-sm text-neutral-darkest">{summary}</p>
                      ) : null}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSummarize(pub)}
                      disabled={summarizing && selectedPub?.pmid === pub.pmid}
                      className="flex-1 py-2 bg-secondary-blue/10 text-secondary-blue rounded-lg hover:bg-secondary-blue hover:text-white transition font-semibold text-sm disabled:opacity-50"
                    >
                      <SparklesIcon className="w-4 h-4 inline mr-1" />
                      {selectedPub?.pmid === pub.pmid && summary ? 'Regenerate Summary' : 'AI Summary'}
                    </button>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition font-semibold text-sm text-center"
                    >
                      View on PubMed
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
