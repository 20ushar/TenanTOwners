import React, { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const faqCategories = [
  {
    category: "General",
    items: [
      {
        question: "What is TenanTOwners?",
        answer: "TenanTOwners helps users discover rental and resale properties, compare available options, request property visits, and contact the team for further assistance."
      },
      {
        question: "Are the listed properties verified?",
        answer: "We review property details before publishing them, but availability, pricing, ownership documents, and property condition should be confirmed again before making any payment or signing an agreement."
      },
      {
        question: "Is property availability updated regularly?",
        answer: "Property availability is updated whenever confirmation is received from the owner or property representative. Some properties may become unavailable before the website is updated."
      },
      {
        question: "Does TenanTOwners own the listed properties?",
        answer: "Unless explicitly stated, TenanTOwners acts as a property discovery and brokerage platform and does not own the listed properties."
      }
    ]
  },
  {
    category: "Renting",
    items: [
      {
        question: "How much brokerage is charged for rental properties?",
        answer: "For successfully finalized rental properties, the brokerage is generally equal to 15 days of the monthly rent. The final charge will be confirmed before the agreement is completed."
      },
      {
        question: "What documents are required for renting?",
        answer: "Documents may include government-issued identity proof, address proof, photographs, employment or income details, police verification, and the signed rental agreement. Requirements may differ by owner or society."
      },
      {
        "question": "Can the monthly rent be negotiated?",
        answer: "Negotiation depends on the property owner. Properties marked as negotiable may allow discussion before finalization."
      }
    ]
  },
  {
    category: "Buying",
    items: [
      {
        question: "What does Registered Property mean?",
        answer: "It means the property is represented as legally registered with the relevant authority. Buyers should still independently verify the registry, ownership documents, dues, approvals, and other legal records before purchasing."
      },
      {
        question: "What documents should I check before buying a property?",
        answer: "Common documents include the ownership deed, registry, encumbrance details, approved layout, completion or occupancy certificate where applicable, tax receipts, maintenance dues, and relevant authority or RERA information."
      },
      {
        "question": "Is there brokerage for buying a property?",
        answer: "Brokerage or service charges may depend on the property and transaction. Any applicable charge will be disclosed before the user proceeds with the deal."
      },
      {
        "question": "Can I negotiate the sale price?",
        answer: "Properties marked Price Negotiable may allow negotiation. The final price depends on the owner and must be confirmed before the transaction."
      }
    ]
  },
  {
    category: "Property Visits and Brokerage",
    items: [
      {
        question: "How do I schedule a property visit?",
        answer: "Open the property details page and use the contact or visit-request option. The team will contact you to confirm your preferred date and time."
      },
      {
        question: "Do I need to pay before visiting a property?",
        answer: "No advance payment should be required merely to view a property unless a clearly disclosed service has been agreed upon. Never send money to an unknown person claiming to represent TenanTOwners."
      },
      {
        "question": "Is brokerage refundable?",
        answer: "Brokerage is normally charged for successfully completing the transaction and is generally non-refundable after the deal or agreement is finalized. Any applicable exceptions should be confirmed in writing."
      },
      {
        "question": "How do I report incorrect or suspicious property information?",
        answer: "Use the official contact option and provide the property title or listing link. The team will review the listing and correct, suspend, or remove it when necessary."
      }
    ]
  },
  {
    category: "Account and Privacy",
    items: [
      {
        question: "Can I save properties to my Wishlist?",
        answer: "Yes. Logged-in users can save properties to their Wishlist and access them later from their account."
      },
      {
        "question": "Where can I see my property requests?",
        answer: "Logged-in users can view their submitted requests through the My Requests section."
      },
      {
        question: "How is my personal information used?",
        answer: "Personal information is used to provide account access, respond to property enquiries, coordinate visits, and improve the service. More information is available in the website Privacy Policy."
      },
      {
        question: "How can I contact TenanTOwners?",
        answer: "Users can contact the team through the contact option on the property details page or through the official contact information displayed on the website."
      }
    ]
  }
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;
    const query = searchQuery.toLowerCase();
    
    return faqCategories.map(category => {
      const filteredItems = category.items.filter(
        faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
      );
      return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);
  }, [searchQuery]);

  const hasResults = filteredCategories.length > 0;

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | TenanTOwners</title>
        <meta name="description" content="Find answers about property listings, rental brokerage, buying properties, property visits, accounts and privacy on TenanTOwners." />
        <link rel="canonical" href="https://tenantowners.com/faq" />
        <meta property="og:title" content="Frequently Asked Questions | TenanTOwners" />
        <meta property="og:description" content="Find answers about property listings, rental brokerage, buying properties, property visits, accounts and privacy on TenanTOwners." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tenantowners.com/faq" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about TenanTOwners and how we're changing the real-estate experience.
          </p>
        </div>

        <div className="relative mb-10 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4aa4f0] focus:border-transparent transition-all shadow-sm"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenFaq(null);
            }}
          />
        </div>

        <div className="space-y-12">
          {hasResults ? (
            filteredCategories.map((category, catIndex) => (
              <div key={catIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 pl-2 border-l-4 border-[#4aa4f0]">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.items.map((faq, itemIndex) => {
                    const faqId = `${catIndex}-${itemIndex}`;
                    const isOpen = openFaq === faqId;
                    
                    return (
                      <div 
                        key={itemIndex} 
                        className={`bg-white dark:bg-slate-800 border ${isOpen ? 'border-[#4aa4f0]' : 'border-slate-200 dark:border-slate-700'} rounded-2xl overflow-hidden transition-all duration-300 shadow-sm`}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faqId)}
                          className="flex w-full items-center justify-between p-5 md:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4aa4f0] focus-visible:ring-inset"
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${faqId}`}
                          id={`faq-question-${faqId}`}
                        >
                          <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-[#4aa4f0]' : 'text-slate-900 dark:text-white'}`}>
                            {faq.question}
                          </span>
                          <div className={`flex-shrink-0 ml-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#4aa4f0]/10 text-[#4aa4f0]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>
                        <div
                          id={`faq-answer-${faqId}`}
                          role="region"
                          aria-labelledby={`faq-question-${faqId}`}
                          className={`overflow-hidden transition-all duration-300 grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                          <div className="min-h-0">
                            <p className="px-5 md:px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching questions found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                We couldn't find any questions matching "{searchQuery}". Please try another search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
