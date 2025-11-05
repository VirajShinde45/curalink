import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Users, AlertCircle, CheckCircle, Clock, Target, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MatchResult {
  trial_id: string;
  match_score: number;
  eligibility_status: 'eligible' | 'potentially_eligible' | 'likely_ineligible' | 'needs_review';
  match_reasons: string[];
  recommended_action: string;
  explanations: {
    condition_match: number;
    location_match: number;
    age_match: number;
    complexity_score: number;
    reasoning: string;
  };
}

interface Trial {
  id: string;
  title: string;
  summary: string;
  phase: string;
  status: string;
  enrollment_count: number;
  sponsor: string;
  trial_locations?: any[];
}

interface AICompatiblePatientProfile {
  medical_conditions?: string[];
  current_medications?: string[];
  birth_date?: string;
  location?: string;
  risk_factors?: string[];
  performance_status?: string;
}

const AIPatientTrialMatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [profile, setProfile] = useState<AICompatiblePatientProfile & { user_id?: string }>({});
  const [activeTab, setActiveTab] = useState<'matches' | 'screen'>('matches');
  const [screeningResult, setScreeningResult] = useState<any>(null);

  useEffect(() => {
    loadPatientProfile();
    loadTrials();
  }, []);

  const loadPatientProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data || {});
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('clinical_trial')
        .select('*')
        .eq('status', 'recruiting')
        .limit(50);

      if (error) throw error;
      setTrials(data || []);
    } catch (error) {
      console.error('Error loading trials:', error);
    }
  };

  const findMatchingTrials = async () => {
    if (!profile.user_id) {
      alert('Please complete your profile first');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-patient-trial-matcher', {
        body: {
          user_id: profile.user_id,
          trial_ids: []
        }
      });

      if (error) throw error;
      
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error finding matches:', error);
      alert('Error finding matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const screenForTrial = async (trialId: string) => {
    if (!profile.user_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-eligibility-screener', {
        body: {
          patient_id: profile.user_id,
          trial_id: trialId
        }
      });

      if (error) throw error;
      
      setScreeningResult(data.assessment);
      setActiveTab('screen');
    } catch (error) {
      console.error('Error screening eligibility:', error);
      alert('Error screening eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'text-green-600 bg-green-50 border-green-200';
      case 'potentially_eligible': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'likely_ineligible': return 'text-red-600 bg-red-50 border-red-200';
      case 'needs_review': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eligible': return <CheckCircle className="w-4 h-4" />;
      case 'potentially_eligible': return <Clock className="w-4 h-4" />;
      case 'likely_ineligible': return <AlertCircle className="w-4 h-4" />;
      case 'needs_review': return <Target className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PatientProfileCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Heart className="w-5 h-5 text-red-500 mr-2" />
        Your Profile for AI Matching
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
          <input
            type="text"
            value={profile.medical_conditions?.join(', ') || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, medical_conditions: e.target.value.split(',').map(c => c.trim()) }))}
            placeholder="e.g., diabetes, hypertension"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
          <input
            type="text"
            value={profile.current_medications?.join(', ') || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, current_medications: e.target.value.split(',').map(m => m.trim()) }))}
            placeholder="e.g., metformin, lisinopril"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={profile.location || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., New York, NY"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Performance Status</label>
          <select
            value={profile.performance_status || 'unknown'}
            onChange={(e) => setProfile(prev => ({ ...prev, performance_status: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="unknown">Unknown</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-3">
        <button
          onClick={findMatchingTrials}
          disabled={loading || !profile.user_id}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Target className="w-4 h-4 mr-2" />
          )}
          Find Matching Trials
        </button>
      </div>
    </div>
  );

  const MatchResultsCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          AI-Powered Trial Matches ({matches.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Trials ranked by compatibility with your profile
        </p>
      </div>
      
      <div className="p-6">
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No matches found yet. Update your profile and click "Find Matching Trials".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const trial = trials.find(t => t.id === match.trial_id);
              if (!trial) return null;

              return (
                <div
                  key={match.trial_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTrial(trial);
                    setSelectedMatch(match);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{trial.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{trial.summary}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Phase: {trial.phase || 'Unknown'}</span>
                        <span>Status: {trial.status}</span>
                        <span>Sponsor: {trial.sponsor}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(match.match_score)} mb-1`}>
                        {match.match_score}%
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(match.eligibility_status)}`}>
                        {getStatusIcon(match.eligibility_status)}
                        <span className="ml-1 capitalize">{match.eligibility_status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <strong>Match Reasons:</strong> {match.match_reasons.join(', ')}
                    </div>
                    <div className="text-sm text-blue-600">
                      <strong>Recommendation:</strong> {match.recommended_action}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        screenForTrial(match.trial_id);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Screen for Eligibility
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrial(trial);
                        setSelectedMatch(match);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const EligibilityScreeningCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">AI Eligibility Screening</h3>
      </div>
      
      <div className="p-6">
        {screeningResult ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{screeningResult.assessment_details.overall_eligibility}%</div>
                <div className="text-sm text-gray-600">Overall Eligibility</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{screeningResult.assessment_details.age_assessment}%</div>
                <div className="text-sm text-gray-600">Age Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{screeningResult.assessment_details.condition_compatibility}%</div>
                <div className="text-sm text-gray-600">Condition Match</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {screeningResult.detailed_feedback.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {screeningResult.detailed_feedback.strengths.map((strength: string, idx: number) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {screeningResult.detailed_feedback.concerns.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Concerns
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {screeningResult.detailed_feedback.concerns.map((concern: string, idx: number) => (
                      <li key={idx}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {screeningResult.detailed_feedback.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {screeningResult.detailed_feedback.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a trial and click "Screen for Eligibility" to get AI-powered assessment.</p>
          </div>
        )}
      </div>
    </div>
  );

  const TrialDetailModal = () => {
    if (!selectedTrial || !selectedMatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedTrial.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>Phase: {selectedTrial.phase || 'Unknown'}</span>
                  <span>Status: {selectedTrial.status}</span>
                  <span>Sponsor: {selectedTrial.sponsor}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrial(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Trial Information</h4>
                <p className="text-gray-600 mb-4">{selectedTrial.summary || 'No description available'}</p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Enrollment Count:</strong> {selectedTrial.enrollment_count || 'Not specified'}</div>
                  <div><strong>Study Type:</strong> {selectedTrial.phase || 'Not specified'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">AI Match Analysis</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Match Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(selectedMatch.match_score)}`}>
                      {selectedMatch.match_score}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Condition Match</span>
                      <span>{selectedMatch.explanations.condition_match}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Location Match</span>
                      <span>{selectedMatch.explanations.location_match}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Age Compatibility</span>
                      <span>{selectedMatch.explanations.age_match}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">Match Reasoning</h5>
                  <p className="text-sm text-gray-600">{selectedMatch.explanations.reasoning}</p>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">Recommended Action</h5>
                  <p className="text-sm text-blue-600">{selectedMatch.recommended_action}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PatientProfileCard />
      
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Trial Matches
            </button>
            <button
              onClick={() => setActiveTab('screen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'screen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Eligibility Screening
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'matches' ? <MatchResultsCard /> : <EligibilityScreeningCard />}
        </div>
      </div>
      
      <TrialDetailModal />
    </div>
  );
};

export default AIPatientTrialMatcher;
