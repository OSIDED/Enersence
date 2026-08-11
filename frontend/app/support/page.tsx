"use client";

import { useState } from "react";
import { Search, HelpCircle, ChevronDown, Mail } from "lucide-react";
import Sidebar from "@/components/Sidebar";

// TODO: replace with your real support inbox once it exists, e.g.
// "support@enersence.com". This is the ONLY line you need to change
// to make the "Send Email" button point at a real address.
const SUPPORT_EMAIL = "enersence123@gmail.com";

const FAQS = [
  {
    q: "How do I connect a new smart meter?",
    a: 'Go to the Dashboard and click "Add New Meter", then follow the pairing instructions shown on your meter\'s display.',
  },
  {
    q: "Why is my consumption data delayed?",
    a: "Smart meters sync every 15 minutes. If a device shows SYNCING for longer than an hour, check its wifi connection.",
  },
  {
    q: "Understanding Peak Hours billing",
    a: "Peak hours are typically 6 PM–9 PM, when rates are highest. Shifting heavy appliance use outside this window lowers your bill.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleSendEmail() {
    const subject = encodeURIComponent("Enersence Support Request");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F4F6F8] dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-[1600px] w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          How can we help?
        </h1>

        <div className="relative mb-8 max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for Help Articles..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-6 flex-wrap items-start">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-[2] min-w-full md:min-w-[420px]">
            <div className="flex items-center gap-2 mb-5">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <div
                  key={faq.q}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform shrink-0 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === i && (
                    <p className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-6 flex-1 min-w-full md:min-w-[280px]">
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Send us a detailed message and we&apos;ll get back to you.
              </p>
              <button
                onClick={handleSendEmail}
                className="w-full border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-semibold py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Send Email
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
