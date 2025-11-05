import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { BeakerIcon } from '@heroicons/react/24/outline';

export function ResearcherOnboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [researchInterests, setResearchInterests] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [publicationsCount, setPublicationsCount] = useState('');
  const [orcidId, setOrcidId] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, updatePreferences, updateProfile } = useAuth();
  const navigate = useNavigate();

  const commonSpecialties = [
    'Oncology',
    'Cardiology',
    'Neurology',
    'Immunology',
    'Pharmacology',
    'Genetics',
    'Epidemiology',
    'Clinical Trials',
  ];

  function toggleSpecialty(specialty: string) {
    setSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  }

  async function handleComplete() {
    if (!user) {
      console.error('No user found');
      alert('Please sign in again to continue.');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting onboarding data save...');
      
      // Update user profile with full name
      console.log('Updating profile with full name:', fullName.trim());
      await updateProfile({
        full_name: fullName.trim(),
      });

      // Update preferences with specialties
      console.log('Updating preferences with specialties:', specialties);
      await updatePreferences({
        specialties,
      });

      // Create or update researcher profile
      const researcherProfileData = {
        user_id: user.id,
        institution: institution.trim(),
        department: department.trim(),
        orcid_id: orcidId.trim() || null,
        publications_count: parseInt(publicationsCount) || 0,
        research_interests: researchInterests.trim(),
      };

      console.log('Researcher profile data:', researcherProfileData);

      // Check if researcher profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('researcher_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
      }

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing researcher profile...');
        const { error: updateError } = await supabase
          .from('researcher_profile')
          .update(researcherProfileData)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating researcher profile:', updateError);
          throw updateError;
        }
        console.log('Researcher profile updated successfully');
      } else {
        // Insert new profile
        console.log('Creating new researcher profile...');
        const { error: insertError } = await supabase
          .from('researcher_profile')
          .insert(researcherProfileData);

        if (insertError) {
          console.error('Error creating researcher profile:', insertError);
          throw insertError;
        }
        console.log('Researcher profile created successfully');
      }

      console.log('All onboarding data saved successfully');
      // Redirect to researcher dashboard
      navigate('/researcher/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save your information. Please try again. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-lightest to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-darkest">CuraLink</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${
                s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-neutral-light'
              }`}
            />
          ))}
        </div>

        {/* Onboarding Card */}
        <div className="bg-white rounded-2xl shadow-medium p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-darkest mb-2">
                Welcome, Researcher!
              </h2>
              <p className="text-neutral-dark mb-6">
                Let's start with your basic information
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-darkest mb-3">
                  Research Specialties *
                </label>
                <p className="text-sm text-neutral-medium mb-3">
                  Select all that apply
                </p>
                <div className="flex flex-wrap gap-3">
                  {commonSpecialties.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-4 py-2 rounded-xl border-2 transition ${
                        specialties.includes(specialty)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-light text-neutral-dark hover:border-neutral-medium'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (fullName.trim() && specialties.length > 0) {
                    setStep(2);
                  } else {
                    alert('Please enter your name and select at least one specialty');
                  }
                }}
                className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-darkest mb-2">
                Research Interests
              </h2>
              <p className="text-neutral-dark mb-6">
                Tell us more about your research focus
              </p>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    Describe Your Research Interests
                  </label>
                  <textarea
                    value={researchInterests}
                    onChange={(e) => setResearchInterests(e.target.value)}
                    placeholder="e.g., Breast cancer immunotherapy, CAR-T cell therapy development, clinical trial design..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-neutral-medium mt-1">
                    This helps patients and collaborators find you
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-neutral-light text-neutral-darkest rounded-xl hover:bg-neutral-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-darkest mb-2">
                Professional Details
              </h2>
              <p className="text-neutral-dark mb-6">
                Help others find and connect with you
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    Institution/Organization *
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Stanford University, Mayo Clinic, etc."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Department of Oncology"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    Number of Publications
                  </label>
                  <input
                    type="number"
                    value={publicationsCount}
                    onChange={(e) => setPublicationsCount(e.target.value)}
                    placeholder="45"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-neutral-medium mt-1">
                    Your peer-reviewed publications count
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darkest mb-2">
                    ORCID iD (Optional)
                  </label>
                  <input
                    type="text"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    placeholder="0000-0002-1234-5678"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-neutral-medium mt-1">
                    Link your ORCID profile for verified credentials
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-neutral-light text-neutral-darkest rounded-xl hover:bg-neutral-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading || !institution.trim()}
                  className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
