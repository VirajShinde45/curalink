import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { ClinicalTrial, Publication, ForumThread } from '../../lib/supabase';
import VirtualResearchAssistant from '../../components/VirtualResearchAssistant';
import {
  BeakerIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export function ResearcherDashboard() {
  const { user, preferences, profile } = useAuth();
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      // Load trials
      const { data: trialsData } = await supabase
        .from('clinical_trial')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (trialsData) setTrials(trialsData);

      // Load publications
      const { data: publicationsData } = await supabase
        .from('publication')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (publicationsData) setPublications(publicationsData);

      // Load forum threads where I'm the author
      if (user) {
        const { data: threadsData } = await supabase
          .from('forum_thread')
          .select('*')
          .eq('author_id', user.id)
          .order('last_activity_at', { ascending: false })
          .limit(5);

        if (threadsData) setThreads(threadsData);
      }
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
            Welcome, Dr. {profile?.full_name || 'Researcher'}
          </h1>
          <p className="text-neutral-dark">
            Collaborate, discover, and advance medical research
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
              <div className="grid sm:grid-cols-4 gap-4">
                <Link
                  to="/search/trials"
                  className="p-4 bg-primary/5 border border-primary rounded-xl hover:shadow-medium transition text-center"
                >
                  <BeakerIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest text-sm">Browse Trials</div>
                </Link>
                <Link
                  to="/search/publications"
                  className="p-4 bg-secondary-blue/5 border border-secondary-blue rounded-xl hover:shadow-medium transition text-center"
                >
                  <DocumentTextIcon className="w-8 h-8 text-secondary-blue mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest text-sm">Publications</div>
                </Link>
                <Link
                  to="/collaborators"
                  className="p-4 bg-secondary-purple/5 border border-secondary-purple rounded-xl hover:shadow-medium transition text-center"
                >
                  <UserGroupIcon className="w-8 h-8 text-secondary-purple mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest text-sm">Find Collaborators</div>
                </Link>
                <Link
                  to="/forum"
                  className="p-4 bg-secondary-orange/5 border border-secondary-orange rounded-xl hover:shadow-medium transition text-center"
                >
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-secondary-orange mx-auto mb-2" />
                  <div className="font-semibold text-neutral-darkest text-sm">Forum</div>
                </Link>
              </div>
            </div>

            {/* Clinical Trials */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-darkest">Recent Clinical Trials</h2>
                <Link to="/search/trials" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {trials.length === 0 ? (
                  <p className="text-neutral-dark text-center py-8">
                    No clinical trials yet. Start exploring!
                  </p>
                ) : (
                  trials.map((trial) => (
                    <div key={trial.id} className="p-4 border border-neutral-light rounded-xl hover:shadow-soft transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-darkest flex-1">{trial.title}</h3>
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

            {/* Publications */}
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
                    No publications yet. Search PubMed to discover research!
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
            {/* Specialties */}
            {preferences?.specialties && preferences.specialties.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="font-bold text-neutral-darkest mb-3">My Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-lg">
                      {specialty}
                    </span>
                  ))}
                </div>
                <Link to="/settings" className="block mt-4 text-sm text-primary hover:underline">
                  Update specialties
                </Link>
              </div>
            )}

            {/* My Forum Threads */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="font-bold text-neutral-darkest mb-3">My Forum Threads</h3>
              {threads.length === 0 ? (
                <p className="text-sm text-neutral-dark mb-4">No threads yet. Start a discussion!</p>
              ) : (
                <div className="space-y-3 mb-4">
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
              )}
              <Link
                to="/forum"
                className="flex items-center justify-center space-x-2 w-full py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Start New Thread</span>
              </Link>
            </div>

            {/* Research Interests */}
            {preferences?.interests && preferences.interests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="font-bold text-neutral-darkest mb-3">Research Interests</h3>
                <ul className="space-y-2">
                  {preferences.interests.slice(0, 5).map((interest, index) => (
                    <li key={index} className="text-sm text-neutral-dark">
                      • {interest}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI-Powered Research Assistant */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-soft p-6 mb-6">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-bold text-neutral-darkest">AI Research Assistant</h2>
        </div>
        <p className="text-neutral-dark mb-6">
          Get intelligent guidance on trial design, methodology, and research best practices.
        </p>
        <div className="h-96">
          <VirtualResearchAssistant />
        </div>
      </div>
    </div>
  );
}
