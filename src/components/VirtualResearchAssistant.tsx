import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, FileText, Users, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: string;
}

interface ResearchGuidance {
  category: string;
  suggestions: string[];
  examples: string[];
  bestPractices: string[];
}

const VirtualResearchAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your Virtual Research Assistant. I can help you with trial design, protocol optimization, research methodology, and study planning. How can I assist you today?",
      timestamp: new Date(),
      category: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const researchGuidance: Record<string, ResearchGuidance> = {
    trial_design: {
      category: 'Trial Design',
      suggestions: [
        'Define clear primary and secondary endpoints',
        'Consider adaptive trial designs for efficiency',
        'Plan for statistical analysis methodology',
        'Include patient-reported outcomes when appropriate',
        'Design for diverse participant recruitment'
      ],
      examples: [
        'Example: Randomized, double-blind, placebo-controlled trial design',
        'Example: Platform trial with multiple interventions',
        'Example: Bayesian adaptive design with interim analyses'
      ],
      bestPractices: [
        'Involve statisticians early in design process',
        'Consider regulatory guidance and precedent studies',
        'Plan for potential protocol amendments',
        'Include data safety monitoring plan'
      ]
    },
    protocol_optimization: {
      category: 'Protocol Optimization',
      suggestions: [
        'Streamline inclusion/exclusion criteria',
        'Minimize burden on participants',
        'Optimize visit schedule and assessments',
        'Consider telemedicine and digital endpoints',
        'Plan for patient retention strategies'
      ],
      examples: [
        'Example: Remote monitoring to reduce site visits',
        'Example: Electronic patient-reported outcomes',
        'Example: Flexible visit windows for real-world feasibility'
      ],
      bestPractices: [
        'Review protocols with patient advocates',
        'Consider feasibility at participating sites',
        'Plan for protocol deviations handling',
        'Include clear withdrawal criteria'
      ]
    },
    methodology: {
      category: 'Research Methodology',
      suggestions: [
        'Choose appropriate study design for research question',
        'Plan for randomization and blinding procedures',
        'Define sample size calculation methodology',
        'Consider ethical considerations and informed consent',
        'Plan for data quality and monitoring'
      ],
      examples: [
        'Example: Superiority trial design for new treatment',
        'Example: Non-inferiority design for biosimilar studies',
        'Example: Observational study with propensity score matching'
      ],
      bestPractices: [
        'Follow Good Clinical Practice guidelines',
        'Plan for missing data handling',
        'Consider multi-center coordination requirements',
        'Include comprehensive data management plan'
      ]
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateResearchGuidance(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        category: getMessageCategory(inputMessage)
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating guidance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResearchGuidance = async (userInput: string): Promise<string> => {
    // Simulate AI-powered guidance generation using rule-based logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('trial design') || lowerInput.includes('study design')) {
      const guidance = researchGuidance.trial_design;
      return `**${guidance.category} Guidance:**

Here are key considerations for your trial design:

**Suggestions:**
${guidance.suggestions.map(s => `• ${s}`).join('\n')}

**Examples:**
${guidance.examples.map(e => `• ${e}`).join('\n')}

**Best Practices:**
${guidance.bestPractices.map(bp => `• ${bp}`).join('\n')}

Would you like me to elaborate on any specific aspect?`;
    }

    if (lowerInput.includes('protocol')) {
      const guidance = researchGuidance.protocol_optimization;
      return `**${guidance.category} Assistance:**

For protocol optimization, consider these approaches:

**Key Suggestions:**
${guidance.suggestions.map(s => `• ${s}`).join('\n')}

**Practical Examples:**
${guidance.examples.map(e => `• ${e}`).join('\n')}

**Best Practices:**
${guidance.bestPractices.map(bp => `• ${bp}`).join('\n')}

Which protocol element would you like to discuss further?`;
    }

    if (lowerInput.includes('methodology') || lowerInput.includes('statistics')) {
      const guidance = researchGuidance.methodology;
      return `**${guidance.category} Support:**

Here's guidance for your research methodology:

**Core Suggestions:**
${guidance.suggestions.map(s => `• ${s}`).join('\n')}

**Design Examples:**
${guidance.examples.map(e => `• ${e}`).join('\n')}

**Methodology Best Practices:**
${guidance.bestPractices.map(bp => `• ${bp}`).join('\n')}

What specific methodology question can I help you with?`;
    }

    if (lowerInput.includes('recruitment') || lowerInput.includes('enrollment')) {
      return `**Recruitment Strategy Guidance:**

Effective patient recruitment is crucial for trial success:

**Strategy Suggestions:**
• Partner with patient advocacy groups
• Utilize digital health platforms and social media
• Collaborate with community health centers
• Implement referral incentive programs
• Consider telemedicine-based recruitment

**Retention Strategies:**
• Provide clear communication about trial benefits
• Minimize participant burden and travel requirements
• Offer flexible scheduling and virtual options
• Maintain regular contact and support

**Target Population Considerations:**
• Ensure diverse representation
• Consider health literacy levels
• Address cultural and linguistic barriers
• Plan for special populations (elderly, pediatric)

Would you like specific guidance for any of these areas?`;
    }

    if (lowerInput.includes('endpoint') || lowerInput.includes('outcome')) {
      return `**Endpoint Selection Guidance:**

Choosing appropriate endpoints is critical for trial success:

**Primary Endpoint Considerations:**
• Should directly address the research question
• Must be clinically meaningful and relevant
• Consider regulatory requirements and precedent
• Ensure measurement feasibility and reliability

**Secondary Endpoints:**
• Support primary endpoint interpretation
• Explore additional relevant outcomes
• Consider patient-reported outcomes
• Include safety and tolerability measures

**Emerging Considerations:**
• Digital biomarkers and remote monitoring
• Composite endpoints when appropriate
• Time-to-event endpoints for survival studies
• Patient-centered outcome measures

What type of endpoint are you considering for your study?`;
    }

    // Default response for general queries
    return `I'm here to help with various research-related questions. I can provide guidance on:

• **Trial Design**: Study types, randomization, blinding strategies
• **Protocol Optimization**: Inclusion/exclusion criteria, visit schedules
• **Research Methodology**: Statistical approaches, sample size planning
• **Recruitment & Retention**: Patient enrollment strategies
• **Endpoints**: Primary and secondary outcome measures
• **Regulatory Considerations**: Compliance and approval processes
• **Data Management**: Quality control and monitoring plans

Please let me know what specific aspect of your research you'd like to discuss, and I'll provide targeted guidance and examples.`;
  };

  const getMessageCategory = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('trial design') || lowerInput.includes('study design')) return 'trial_design';
    if (lowerInput.includes('protocol')) return 'protocol_optimization';
    if (lowerInput.includes('methodology') || lowerInput.includes('statistics')) return 'methodology';
    return 'general';
  };

  const QuickActions = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setInputMessage('Help me design a clinical trial')}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Trial Design Help</span>
          </div>
        </button>
        
        <button
          onClick={() => setInputMessage('Optimize my protocol')}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Protocol Optimization</span>
          </div>
        </button>
        
        <button
          onClick={() => setInputMessage('Research methodology guidance')}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Methodology Support</span>
          </div>
        </button>
        
        <button
          onClick={() => setInputMessage('Patient recruitment strategies')}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">Recruitment Help</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Virtual Research Assistant</h2>
            <p className="text-sm text-gray-600">AI-powered research guidance and support</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guidance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Research Guidance
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about trial design, methodology, recruitment..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto">
            <QuickActions />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualResearchAssistant;
