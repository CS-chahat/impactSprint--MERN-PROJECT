import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-5xl font-black mb-10 text-slate-900 underline decoration-orange-500">Our Innovation</h2>
      <div className="space-y-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-bold text-orange-500 mb-4">The "Sprint" Model</h3>
          <p className="text-xl text-slate-600 leading-relaxed">
            We don't ask for months of your time. We ask for 5 hours. 
            By breaking down NGO needs into "Sprints," we make volunteering 
            accessible for busy professionals.
          </p>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl text-white">
          <h3 className="text-2xl font-bold text-orange-400 mb-4">Verified Impact</h3>
          <p className="text-xl opacity-90 leading-relaxed">
            Every completed task earns you a cryptographically signed certificate. 
            Build your professional legacy while helping the world.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;