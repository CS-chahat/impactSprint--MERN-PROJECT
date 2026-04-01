import React from 'react';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h2 className="text-6xl font-black mb-6">Need <span className="text-orange-500">Help?</span></h2>
      <p className="text-xl text-slate-500 mb-12">Whether you are an NGO or a Developer, we are here for you.</p>
      
      <div className="grid md:grid-cols-2 gap-8 text-left">
        <div className="p-8 bg-orange-50 rounded-3xl">
          <h4 className="font-bold text-orange-600 text-lg">Email Us</h4>
          <p className="text-2xl font-black mt-2">hello@impactsprint.io</p>
        </div>
        <div className="p-8 bg-slate-100 rounded-3xl">
          <h4 className="font-bold text-slate-600 text-lg">Support</h4>
          <p className="text-2xl font-black mt-2">support@impactsprint.io</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;