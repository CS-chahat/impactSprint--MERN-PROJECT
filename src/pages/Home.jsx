import React from 'react';

const Home = () => {
  const cards = [
    {
      label: "Command Center",
      title: "Admin Portal",
      subtitle: "Oversee the Ecosystem.",
      desc: "Full command center. Monitor all sprints, verify NGOs, manage the entire platform from a single split-screen dashboard.",
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      tagColor: "bg-slate-100 text-slate-600"
    },
    {
      label: "For NGOs",
      title: "NGO Gateway",
      subtitle: "Post a Sprint. Get Help Now.",
      desc: "Connect your mission to world-class professionals. Post time-bound tasks and watch your goals become reality in hours, not months.",
      icon: (
        <svg className="w-6 h-6 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      tagColor: "bg-orange-50 text-[#FF6B35]"
    },
    {
      label: "For Professionals",
      title: "Professional Hub",
      subtitle: "Lend Your Skill. Build Your Legacy.",
      desc: "Sprint for good. Apply your expertise to real-world social challenges, earn verified impact certificates, and build a portfolio.",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      tagColor: "bg-teal-50 text-teal-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center max-w-5xl mx-auto relative">
        {/* Background Decorative Geometry (Matching your screenshot) */}
        <div className="absolute top-10 right-0 -z-10 opacity-5">
           <svg width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="black" strokeWidth="0.5" fill="none"/><path d="M50 10 L90 80 L10 80 Z" stroke="black" strokeWidth="0.5" fill="none"/></svg>
        </div>

        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-orange-100 bg-orange-50/50">
          <span className="text-[10px] font-bold tracking-widest text-[#FF6B35] uppercase">
            ● Micro-Volunteering Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6">
          Skills that <span className="text-[#FF6B35]">Sprint</span> for Good.
        </h1>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Match professionals with NGOs for high-impact, time-bound micro-tasks. 
          Real work. Real impact. Verified certificates.
        </p>
      </section>

      {/* Cards Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="group p-10 rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-default"
          >
            <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-6 ${card.tagColor}`}>
              {card.label}
            </div>
            
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              {card.icon}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">{card.title}</h2>
            <h3 className={`text-lg font-bold mb-4 ${index === 1 ? 'text-[#FF6B35]' : index === 2 ? 'text-teal-600' : 'text-slate-700'}`}>
              {card.subtitle}
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              {card.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;