import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface MeetingRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_role: string;
  recipient_id: string;
  recipient_name: string;
  recipient_role: string;
  purpose: string;
  preferred_date: string;
  status: string;
  message: string;
  created_at: string;
}

interface Researcher {
  user_id: string;
  full_name: string;
  institution: string;
  research_area: string;
  publications_count: number;
}

export default function MeetingRequestsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'create'>('received');
  const [receivedRequests, setReceivedRequests] = useState<MeetingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MeetingRequest[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create request form
  const [selectedResearcher, setSelectedResearcher] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadMeetings();
    if (profile?.user_type === 'patient') {
      loadResearchers();
    }
  }, [user, profile]);

  const loadMeetings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('meeting_request')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (receivedError) throw receivedError;
      
      // Load sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('meeting_request')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sentError) throw sentError;
      
      // Enrich with user profiles
      const enrichReceived = await enrichMeetings(receivedData || []);
      const enrichSent = await enrichMeetings(sentData || []);
      
      setReceivedRequests(enrichReceived);
      setSentRequests(enrichSent);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrichMeetings = async (meetings: any[]): Promise<MeetingRequest[]> => {
    return Promise.all(
      meetings.map(async (meeting) => {
        const { data: requesterData } = await supabase
          .from('user_profile')
          .select('full_name, user_type')
          .eq('user_id', meeting.requester_id)
          .single();
        
        const { data: recipientData } = await supabase
          .from('user_profile')
          .select('full_name, user_type')
          .eq('user_id', meeting.recipient_id)
          .single();
        
        return {
          ...meeting,
          requester_name: requesterData?.full_name || 'Unknown',
          requester_role: requesterData?.user_type || 'user',
          recipient_name: recipientData?.full_name || 'Unknown',
          recipient_role: recipientData?.user_type || 'user'
        };
      })
    );
  };

  const loadResearchers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('user_id, full_name')
        .eq('user_type', 'researcher');
      
      if (error) throw error;
      
      // Get researcher details
      const enrichedResearchers = await Promise.all(
        (data || []).map(async (user) => {
          const { data: researcherData } = await supabase
            .from('researcher_profile')
            .select('institution, research_area, publications_count')
            .eq('user_id', user.user_id)
            .single();
          
          return {
            ...user,
            institution: researcherData?.institution || 'Not specified',
            research_area: researcherData?.research_area || 'Not specified',
            publications_count: researcherData?.publications_count || 0
          };
        })
      );
      
      setResearchers(enrichedResearchers);
    } catch (error) {
      console.error('Error loading researchers:', error);
    }
  };

  const createMeetingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedResearcher || !purpose || !preferredDate || !message) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('meeting_request')
        .insert({
          requester_id: user.id,
          recipient_id: selectedResearcher,
          purpose: purpose,
          preferred_date: preferredDate,
          message: message,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Reset form
      setSelectedResearcher('');
      setPurpose('');
      setPreferredDate('');
      setMessage('');
      setActiveTab('sent');
      await loadMeetings();
      alert('Meeting request sent successfully!');
    } catch (error) {
      console.error('Error creating meeting request:', error);
      alert('Failed to send meeting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('meeting_request')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      
      await loadMeetings();
      alert(`Meeting request ${status}!`);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredResearchers = researchers.filter(r =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.research_area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Meeting Requests
              </h1>
              <p className="mt-2 text-gray-600">
                {profile?.user_type === 'researcher' 
                  ? 'Manage meeting requests from patients and caregivers'
                  : 'Connect with researchers to discuss trials and research opportunities'
                }
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'received'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
            {profile?.user_type === 'patient' && (
              <button
                onClick={() => setActiveTab('create')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  New Request
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Received Requests</h3>
                <p className="text-gray-600">You haven't received any meeting requests yet.</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.requester_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            request.requester_role === 'researcher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {request.requester_role}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Purpose: {request.purpose}</p>
                      <p className="text-gray-600 text-sm mb-3">{request.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Preferred: {formatDate(request.preferred_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          Requested: {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'accepted')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'declined')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        <XCircleIcon className="h-5 w-5" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sent Requests</h3>
                <p className="text-gray-600">
                  {profile?.user_type === 'patient' 
                    ? "You haven't sent any meeting requests yet. Start by finding a researcher!"
                    : "You haven't sent any meeting requests yet."
                  }
                </p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.recipient_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            request.recipient_role === 'researcher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {request.recipient_role}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Purpose: {request.purpose}</p>
                      <p className="text-gray-600 text-sm mb-3">{request.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Preferred: {formatDate(request.preferred_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          Sent: {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'create' && profile?.user_type === 'patient' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Meeting with a Researcher</h2>
            
            {/* Researcher Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Researchers</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, institution, or research area..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Researcher List */}
            <div className="mb-8 max-h-64 overflow-y-auto space-y-2">
              {filteredResearchers.map((researcher) => (
                <div
                  key={researcher.user_id}
                  onClick={() => setSelectedResearcher(researcher.user_id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedResearcher === researcher.user_id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{researcher.full_name}</h3>
                  <p className="text-sm text-gray-600">{researcher.institution}</p>
                  <p className="text-sm text-gray-500">{researcher.research_area}</p>
                  <p className="text-xs text-gray-400 mt-1">{researcher.publications_count} publications</p>
                </div>
              ))}
            </div>

            {/* Request Form */}
            {selectedResearcher && (
              <form onSubmit={createMeetingRequest} className="space-y-6 border-t border-gray-200 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Discuss clinical trial eligibility"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the researcher why you'd like to meet and what you'd like to discuss..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Sending Request...' : 'Send Meeting Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
