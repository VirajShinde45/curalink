import { Link } from 'react-router-dom';
import { ArrowRightIcon, BeakerIcon, UserGroupIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-lightest to-white">
      {/* Header */}
      <header className="py-6 px-4 border-b border-neutral-light">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BeakerIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-darkest">CuraLink</h1>
          </div>
          <div className="flex space-x-3">
            <Link to="/auth/signin" className="px-5 py-2 text-neutral-darkest hover:text-primary transition duration-200 rounded-lg hover:bg-neutral-lightest">
              Sign In
            </Link>
            <Link to="/auth/signup" className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-soft hover:shadow-md">
              Join Us
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-darkest mb-4">
            When my mom was diagnosed with a rare condition,<br />
            <span className="text-primary">we couldn't find the right trial</span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-dark mb-8 max-w-3xl mx-auto leading-relaxed">
            That's why we built CuraLink. Too many brilliant researchers and willing patients never find each other. 
            We're changing that—one connection at a time.
          </p>

          {/* Dual CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/auth/signup?type=patient"
              className="group px-8 py-4 bg-white border-2 border-primary text-primary rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-medium flex items-center justify-center space-x-2 hover:scale-105"
            >
              <UserGroupIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Find a Trial</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/auth/signup?type=researcher"
              className="group px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-medium flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg"
            >
              <BeakerIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Share My Research</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
          
          {/* Personal note */}
          <p className="text-sm text-neutral-medium italic max-w-2xl mx-auto">
            "The best medical discoveries happen when brilliant minds meet the patients who need them most."
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-neutral-dark">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Privacy-First (we hate spam too)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Actually Accessible (not just checking boxes)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Real Data, Real Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-neutral-lightest">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-neutral-darkest mb-12">
            What makes us different
          </h3>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="p-6 md:p-8 bg-white rounded-2xl card-hover border border-neutral-light hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <MagnifyingGlassIcon className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-neutral-darkest mb-3">Smart Search That Actually Works</h4>
              <p className="text-neutral-dark leading-relaxed">
                Say goodbye to endless scrolling. Our search actually understands what you're looking for. 
                "Something for diabetes with heart problems" finds exactly that—no PhD required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 md:p-8 bg-white rounded-2xl card-hover border border-neutral-light hover:border-primary/20">
              <div className="w-12 h-12 bg-secondary-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-blue group-hover:scale-110 transition-all duration-300">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-secondary-blue" />
              </div>
              <h4 className="text-xl font-bold text-neutral-darkest mb-3">Real People, Real Answers</h4>
              <p className="text-neutral-dark leading-relaxed">
                Skip the echo chambers. Chat with actual researchers, patients who've been there, 
                and healthcare pros who actually respond. No bots, no corporate speak.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 md:p-8 bg-white rounded-2xl card-hover border border-neutral-light hover:border-primary/20">
              <div className="w-12 h-12 bg-secondary-purple/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-purple group-hover:scale-110 transition-all duration-300">
                <UserGroupIcon className="w-7 h-7 text-secondary-purple" />
              </div>
              <h4 className="text-xl font-bold text-neutral-darkest mb-3">Direct Lines to Experts</h4>
              <p className="text-neutral-dark leading-relaxed">
                Getting a researcher's attention is hard. We're making it as easy as sending a message. 
                No gatekeepers, no cold emails that get ignored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Let's make medical research more human</h3>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Every breakthrough starts with a connection. Be part of making them happen.
          </p>
          <p className="text-sm mb-8 opacity-75">
            Free to use, forever. No strings attached—just like it should be.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary rounded-2xl hover:bg-neutral-lightest transition-all duration-300 shadow-medium font-semibold hover:scale-105 hover:shadow-lg"
          >
            <span>Join the Movement</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-neutral-darkest text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BeakerIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">CuraLink</span>
          </div>
          <p className="text-neutral-medium mb-3">
            Made with ❤️ for everyone touched by medical research
          </p>
          <p className="text-sm text-neutral-medium mb-2">
            Accessibility matters. Privacy is non-negotiable. Human connection is everything.
          </p>
          <p className="text-xs text-neutral-medium">
            © 2025 CuraLink. Built in a small apartment in Seattle, one late night at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
