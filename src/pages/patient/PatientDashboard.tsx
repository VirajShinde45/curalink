import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { ClinicalTrial, Publication, ForumThread } from '../../lib/supabase';
import AIPatientTrialMatcher from '../../components/AIPatientTrialMatcher';
import { 
  BeakerIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function PatientDashboard() {
  const { user, preferences, profile } = useAuth();
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Load trials (limit 5 for dashboard)
      const { data: trialsData } = await supabase
        .from('clinical_trial')
        .select('*')
        .eq('status', 'recruiting')
        .order('created_at', { ascending: false })
        .limit(5);

      if (trialsData) setTrials(trialsData);

      // Load publications (limit 5)
      const { data: publicationsData } = await supabase
        .from('publication')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (publicationsData) setPublications(publicationsData);

      // Load forum threads (limit 5)
      const { data: threadsData } = await supabase
        .from('forum_thread')
        .select('*')
        .eq('status', 'open')
        .order('last_activity_at', { ascending: false })
        .limit(5);

      if (threadsData) setThreads(threadsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-dark">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-lightest">
      {/* Welcome Header */}
      <div className="bg-white border-b border-neutral-light py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-darkest mb-2">
            Welcome back, {profile?.full_name || 'Patient'}!
          </h1>
          <p className="text-neutral-dark">
            Here's what's new in medical research and your community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-neutral-darkest mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link
                  to="/search/trials"
                  className="p-4 bg-primary/5 border border-primary rounded-xl hover:shadow-medium transition text-center"
                >
                  <BeakerIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest">Find Trials</div>
                </Link>
                <Link
                  to="/search/publications"
                  className="p-4 bg-secondary-blue/5 border border-secondary-blue rounded-xl hover:shadow-medium transition text-center"
                >
                  <DocumentTextIcon className="w-8 h-8 text-secondary-blue mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest">Read Research</div>
                </Link>
                <Link
                  to="/forum"
                  className="p-4 bg-secondary-purple/5 border border-secondary-purple rounded-xl hover:shadow-medium transition text-center"
                >
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-secondary-purple mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest">Ask Questions</div>
                </Link>
              </div>
            </div>

            {/* Clinical Trials */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-darkest">Clinical Trials</h2>
                <Link to="/search/trials" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {trials.length === 0 ? (
                  <p className="text-neutral-dark text-center py-8">
                    No clinical trials found. Try searching!
                  </p>
                ) : (
                  trials.map((trial) => (
                    <div key={trial.id} className="p-4 border border-neutral-light rounded-xl hover:shadow-soft transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-darkest">{trial.title}</h3>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg whitespace-nowrap ml-2">
                          {trial.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-dark line-clamp-2 mb-2">
                        {trial.summary || 'No summary available'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-neutral-medium">
                        <span>{trial.sponsor}</span>
                        {trial.phase && <span className="px-2 py-1 bg-neutral-light rounded">Phase {trial.phase}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Publications */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-darkest">Recent Publications</h2>
                <Link to="/search/publications" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {publications.length === 0 ? (
                  <p className="text-neutral-dark text-center py-8">
                    No publications found. Try searching!
                  </p>
                ) : (
                  publications.map((pub) => (
                    <div key={pub.id} className="p-4 border border-neutral-light rounded-xl hover:shadow-soft transition">
                      <h3 className="font-semibold text-neutral-darkest mb-2">{pub.title}</h3>
                      <p className="text-sm text-neutral-dark line-clamp-2 mb-2">
                        {pub.abstract || 'No abstract available'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-neutral-medium">
                        <span>{pub.journal}</span>
                        <span>{pub.pub_date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conditions */}
            {preferences?.conditions && preferences.conditions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="font-bold text-neutral-darkest mb-3">My Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.conditions.map((condition, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-lg">
                      {condition}
                    </span>
                  ))}
                </div>
                <Link to="/settings" className="block mt-4 text-sm text-primary hover:underline">
                  Update conditions
                </Link>
              </div>
            )}

            {/* Forum Activity */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="font-bold text-neutral-darkest mb-3">Forum Activity</h3>
              <div className="space-y-3">
                {threads.slice(0, 3).map((thread) => (
                  <Link
                    key={thread.id}
                    to={`/forum/thread/${thread.id}`}
                    className="block p-3 bg-neutral-lightest rounded-lg hover:shadow-soft transition"
                  >
                    <p className="text-sm font-medium text-neutral-darkest line-clamp-2">
                      {thread.title}
                    </p>
                    <p className="text-xs text-neutral-medium mt-1">
                      {new Date(thread.last_activity_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
              <Link to="/forum" className="block mt-4 text-sm text-primary hover:underline">
                View all discussions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Features Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-neutral-darkest">AI-Powered Medical Features</h2>
          </div>
          <p className="text-neutral-dark mb-6">
            Leverage artificial intelligence to find personalized trial matches and get intelligent health guidance.
          </p>
          <AIPatientTrialMatcher />
        </div>
      </div>
    </div>
  );
}
