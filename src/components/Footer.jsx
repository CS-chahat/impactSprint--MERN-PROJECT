const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 p-1 rounded text-white text-xs font-bold">⚡</div>
        <span className="font-black tracking-tighter">ImpactSprint</span>
      </div>
      <p className="text-slate-400 text-sm">© 2026 ImpactSprint. Micro-volunteering for a better world.</p>
      <div className="flex gap-6 text-sm font-semibold text-slate-600">
        <a href="#" className="hover:text-orange-500 transition">Twitter</a>
        <a href="#" className="hover:text-orange-500 transition">LinkedIn</a>
      </div>
    </div>
  </footer>
);

export default Footer;