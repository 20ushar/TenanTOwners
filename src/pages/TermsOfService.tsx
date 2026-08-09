import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | TenanTOwners</title>
        <meta name="description" content="Read the TenanTOwners terms covering property listings, enquiries, visits, brokerage, payments, user responsibilities, and platform usage." />
      </Helmet>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Terms of Service</h1>
        
        <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="mb-8 text-sm text-slate-500 dark:text-slate-400 font-medium space-y-1">
            <p>Effective Date: 28 July 2026</p>
            <p>Last Updated: 28 July 2026</p>
          </div>

          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            These Terms of Service govern access to and use of the TenanTOwners website, property-listing services, account features, property enquiries, visit requests, and related services.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            By accessing or using TenanTOwners, you agree to these Terms of Service and the <Link to="/privacy" className="text-[#4aa4f0] hover:underline transition-colors">Privacy Policy</Link>.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            If you do not agree with these terms, do not use the website or submit a property enquiry.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. About TenanTOwners</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners is a real-estate discovery and brokerage platform that helps users:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Explore rental and resale properties</li>
            <li>Review available property information</li>
            <li>Save properties to a Wishlist</li>
            <li>Submit property enquiries</li>
            <li>Request property visits</li>
            <li>Connect with property owners, representatives, brokers, or the TenanTOwners team</li>
            <li>Receive assistance during the property-search process</li>
          </ul>
          
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners operates primarily in:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Noida Extension</li>
            <li>Central Noida</li>
            <li>Greater Noida</li>
            <li>Uttar Pradesh, India</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            These locations are operating areas and must not be described as a registered-office address unless separately verified.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Acceptance and Eligibility</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">By using TenanTOwners, you confirm that:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>You are legally capable of entering into a binding agreement</li>
            <li>The information you provide is accurate and current</li>
            <li>You will use the website only for lawful purposes</li>
            <li>You will comply with these terms and applicable laws</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users who are not legally capable of entering into property-related agreements should use the service only through a legally authorized parent, guardian, or representative.
          </p>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Platform Role</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners helps users discover properties and communicate with relevant property owners, representatives, brokers, or team members.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Unless expressly stated in a separate written agreement, TenanTOwners is not:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The owner of a listed property</li>
            <li>The landlord</li>
            <li>The tenant</li>
            <li>The buyer</li>
            <li>The seller</li>
            <li>The property developer</li>
            <li>A bank or lender</li>
            <li>An insurance provider</li>
            <li>A legal advisor</li>
            <li>A tax advisor</li>
            <li>A licensed property valuer</li>
            <li>A title-verification authority</li>
            <li>A party to the final rent, lease, sale, or purchase agreement</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may provide brokerage, coordination, listing, and property-search assistance but does not automatically become a party to the final property transaction.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. User Accounts</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Some website features may require users to create an account.</p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users are responsible for:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Providing correct account information</li>
            <li>Maintaining the confidentiality of their password</li>
            <li>Not sharing passwords or OTPs</li>
            <li>Protecting access to their email address or phone number</li>
            <li>Informing TenanTOwners about suspected unauthorized access</li>
            <li>Keeping profile and contact information updated</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must not:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Create accounts using false identities</li>
            <li>Impersonate another person</li>
            <li>Access another user’s account</li>
            <li>Attempt to bypass authentication</li>
            <li>Share login credentials for abusive or unlawful purposes</li>
            <li>Use automated systems to create multiple accounts</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may suspend or restrict an account where misuse, fraud, unauthorized access, or violation of these terms is reasonably suspected.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Property Listings</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Property information may be provided by:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Property owners</li>
            <li>Authorized representatives</li>
            <li>Brokers</li>
            <li>Developers</li>
            <li>Administrators</li>
            <li>Other relevant sources</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Property information may include:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Price</li>
            <li>Rent</li>
            <li>Availability</li>
            <li>Images</li>
            <li>Videos</li>
            <li>Property type</li>
            <li>BHK</li>
            <li>Area</li>
            <li>Furnishing status</li>
            <li>Construction quality</li>
            <li>Facing</li>
            <li>Registration status</li>
            <li>Amenities</li>
            <li>Location</li>
            <li>Society</li>
            <li>Google Maps link</li>
            <li>Other property details</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners aims to present information accurately but does not guarantee that every listing is complete, current, error-free, or continuously available.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Property availability, pricing, photographs, condition, and other information may change without immediate notice.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            A property listing is not a legally binding offer unless expressly confirmed through a separate written agreement.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Property Verification and Due Diligence</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must independently inspect and verify a property before:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Making any payment</li>
            <li>Paying a token amount</li>
            <li>Paying brokerage</li>
            <li>Signing a rent agreement</li>
            <li>Signing an agreement to sell</li>
            <li>Completing a purchase</li>
            <li>Moving into a property</li>
          </ul>
          
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">For rental properties, users should verify matters such as:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Owner identity</li>
            <li>Authority to rent the property</li>
            <li>Property condition</li>
            <li>Monthly rent</li>
            <li>Security deposit</li>
            <li>Maintenance charges</li>
            <li>Utility charges</li>
            <li>Move-in conditions</li>
            <li>Society rules</li>
            <li>Rental-agreement terms</li>
          </ul>

          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">For purchase properties, users should verify matters such as:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Ownership and title</li>
            <li>Registry documents</li>
            <li>Encumbrances</li>
            <li>Outstanding loans</li>
            <li>Government approvals</li>
            <li>RERA registration where applicable</li>
            <li>Completion or occupancy certificates where applicable</li>
            <li>Property taxes</li>
            <li>Maintenance dues</li>
            <li>Authority approvals</li>
            <li>Possession status</li>
            <li>Measurement and area</li>
            <li>Pending disputes</li>
            <li>Other legal and financial documents</li>
          </ul>

          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should obtain independent legal, financial, technical, or professional advice before completing a significant property transaction.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners must not advertise any property as “100% verified,” “legally guaranteed,” or “fraud-free” unless that claim can be documented and legally supported.
          </p>

          {/* Section 7 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Property Enquiries and Visit Requests</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users may submit enquiries or request property visits through the website.</p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Submitting a request does not guarantee:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Property availability</li>
            <li>Visit confirmation</li>
            <li>Owner approval</li>
            <li>Price acceptance</li>
            <li>Rental approval</li>
            <li>Transaction completion</li>
          </ul>
          
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            A visit is confirmed only after the relevant owner, representative, or TenanTOwners team member confirms the date and time.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should behave respectfully during visits and comply with reasonable property and society rules.
          </p>
          
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must not:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Damage the property</li>
            <li>Harass owners, residents, staff, or representatives</li>
            <li>Record private areas without permission</li>
            <li>Enter restricted areas</li>
            <li>Misuse contact information obtained through the platform</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may cancel or refuse a visit where there is suspected abuse, fraud, safety risk, or unlawful activity.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Brokerage and Service Charges</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may charge brokerage or service fees for successfully completed property services.
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Rental Properties</h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            For a rental transaction successfully finalized through TenanTOwners, the brokerage is generally equal to 15 days of the agreed monthly rent, unless a different amount is clearly disclosed and accepted before finalization.
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Buy Properties</h3>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Brokerage or service charges for a purchase transaction may vary depending on:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The property</li>
            <li>The transaction</li>
            <li>The services provided</li>
            <li>Any agreement with the user, owner, representative, or developer</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Any applicable Buy-property brokerage should be disclosed before the user proceeds with the paid service or finalizes the transaction.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Where applicable, taxes or additional charges must be disclosed separately.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            A user should request written confirmation or a receipt for every payment.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Payments and Payment Safety</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should make payments only through payment methods or accounts officially confirmed by TenanTOwners or the relevant verified transaction party.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must not send:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Passwords</li>
            <li>OTPs</li>
            <li>Card PINs</li>
            <li>UPI PINs</li>
            <li>Internet-banking passwords</li>
            <li>Unnecessary banking credentials</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners is not responsible for payments voluntarily sent to unknown persons, impersonators, unofficial accounts, or unauthorized third parties, except where liability cannot legally be excluded.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Any token amount, booking amount, rent, deposit, or purchase amount paid directly to a property owner, developer, seller, or representative may be governed by a separate receipt or agreement between the relevant parties.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should obtain written payment confirmation before transferring money.
          </p>

          {/* Section 10 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Cancellations and Refunds</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Property availability and transaction circumstances may change.</p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Any cancellation or refund will depend on:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The service purchased</li>
            <li>Whether the service has already been completed</li>
            <li>The written terms disclosed before payment</li>
            <li>The reason for cancellation</li>
            <li>Payments made to third parties</li>
            <li>Applicable law</li>
          </ul>
          
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Brokerage or service fees earned after successful completion of the agreed service are generally non-refundable, except where:
          </p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>A refund is required by applicable law</li>
            <li>TenanTOwners expressly agreed otherwise in writing</li>
            <li>The service was not provided due to a confirmed failure attributable to TenanTOwners</li>
          </ul>

          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Payments made directly to owners, sellers, developers, or other third parties are not automatically controlled by TenanTOwners.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Any specific cancellation or refund policy displayed during a transaction will form part of these terms.
          </p>

          {/* Section 11 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. User Conduct</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must not use TenanTOwners to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Violate applicable law</li>
            <li>Submit false information</li>
            <li>Post fraudulent property listings</li>
            <li>Misrepresent ownership or authorization</li>
            <li>Harass or threaten another person</li>
            <li>Commit fraud or impersonation</li>
            <li>Collect user information without permission</li>
            <li>Upload unlawful or infringing content</li>
            <li>Transmit malware or harmful code</li>
            <li>Attempt unauthorized access</li>
            <li>Scrape or copy website data using automated tools without permission</li>
            <li>Interfere with website security</li>
            <li>Send spam</li>
            <li>Manipulate reviews, enquiries, or requests</li>
            <li>Use the website for discriminatory or unlawful housing practices</li>
            <li>Conduct activities that may harm users, properties, TenanTOwners, or third parties</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may investigate suspected violations and restrict access where reasonably necessary.
          </p>

          {/* Section 12 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Property Content and Media</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">A person submitting property information, photographs, videos, documents, or other content confirms that:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The information is reasonably accurate</li>
            <li>They have authority to provide it</li>
            <li>They have permission to use the submitted media</li>
            <li>The content does not violate another person’s rights</li>
            <li>The content is not fraudulent, misleading, illegal, or harmful</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            By submitting property content, the submitting person grants TenanTOwners a limited, non-exclusive permission to store, display, resize, process, and use the content for operating and promoting the relevant listing and service.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Ownership of the original content remains with its lawful owner.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may remove content that is:</p>
          <ul className="list-disc pl-6 mb-12 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Incorrect</li>
            <li>Outdated</li>
            <li>Misleading</li>
            <li>Infringing</li>
            <li>Unlawful</li>
            <li>Inappropriate</li>
            <li>Reported by an authorized owner</li>
            <li>In violation of these terms</li>
          </ul>

          {/* Section 13 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. Wishlist and My Requests</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Wishlist and My Requests are convenience features.</p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners does not guarantee that:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Saved properties will remain available</li>
            <li>Prices will remain unchanged</li>
            <li>Property information will remain identical</li>
            <li>Submitted requests will always receive a response</li>
            <li>A saved or requested property will be finalized</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should independently reconfirm current property details.
          </p>

          {/* Section 14 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Third-Party Services and Links</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may use or link to third-party services, including where applicable:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Firebase</li>
            <li>Cloudinary</li>
            <li>Vercel</li>
            <li>Google Sign-In</li>
            <li>Google Maps</li>
            <li>Email providers</li>
            <li>Communication services</li>
            <li>Other external websites</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Third-party services operate under their own terms, policies, and technical systems.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners does not control independent third-party websites and is not responsible for their content or practices, except where responsibility cannot legally be excluded.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should review the relevant third-party terms before using those services.
          </p>

          {/* Section 15 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Intellectual Property</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The TenanTOwners name, logo, website design, software, layout, text, graphics, and original website content may be protected by applicable intellectual-property laws.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users may use the website only for personal and lawful property-search purposes.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Without prior written permission, users must not:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Copy the website</li>
            <li>Reproduce substantial website content</li>
            <li>Sell or commercially exploit website data</li>
            <li>Use the TenanTOwners branding</li>
            <li>Create a misleadingly similar website</li>
            <li>Remove copyright or ownership notices</li>
            <li>Reverse engineer protected software except where legally permitted</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Property media belonging to owners or third parties remains subject to the rights of those respective owners.
          </p>

          {/* Section 16 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. Service Availability</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may occasionally:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Update the website</li>
            <li>Perform maintenance</li>
            <li>Modify features</li>
            <li>Correct errors</li>
            <li>Remove unavailable properties</li>
            <li>Restrict access for security reasons</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Continuous and uninterrupted access is not guaranteed.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners should take reasonable steps to restore service following a technical problem but is not responsible for every interruption beyond its reasonable control.
          </p>

          {/* Section 17 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">17. Suspension and Termination</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may suspend, restrict, or terminate access where a user:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Violates these terms</li>
            <li>Provides false information</li>
            <li>Attempts fraud</li>
            <li>Misuses another person’s information</li>
            <li>Interferes with website security</li>
            <li>Harasses users or representatives</li>
            <li>Uses the platform unlawfully</li>
            <li>Creates a safety or reputational risk</li>
            <li>Fails to pay an agreed and valid service charge</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Where reasonable, the user may be informed of the action.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Serious fraud, security threats, or unlawful conduct may result in immediate restriction without prior notice.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users may stop using the website at any time.
          </p>

          {/* Section 18 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">18. Disclaimers</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The website and property information are provided on an “as available” basis.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">To the maximum extent permitted by law, TenanTOwners does not guarantee:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Continuous website availability</li>
            <li>That every listing is error-free</li>
            <li>Property availability</li>
            <li>Owner or tenant acceptance</li>
            <li>Successful negotiation</li>
            <li>Final transaction completion</li>
            <li>Future property value</li>
            <li>Rental income</li>
            <li>Loan approval</li>
            <li>Legal title</li>
            <li>Construction quality</li>
            <li>RERA compliance</li>
            <li>Government approval</li>
            <li>Accuracy of third-party statements</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Nothing in these terms excludes rights or protections that cannot legally be excluded.
          </p>

          {/* Section 19 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">19. Limitation of Liability</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            To the maximum extent permitted by applicable law, TenanTOwners will not be responsible for indirect or consequential losses arising from:
          </p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Independent decisions made by users</li>
            <li>Property unavailability</li>
            <li>Price changes</li>
            <li>Acts of owners, tenants, buyers, sellers, developers, or third parties</li>
            <li>Unauthorized third-party payments</li>
            <li>Reliance on unverified listing information</li>
            <li>External websites or services</li>
            <li>Temporary technical interruptions</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            This limitation does not exclude liability that cannot legally be excluded, including liability arising from fraud, wilful misconduct, or other legally non-excludable conduct.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users remain responsible for conducting appropriate checks before entering into a property transaction.
          </p>

          {/* Section 20 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">20. Indemnity</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            To the extent permitted by law, a user may be responsible for losses, claims, or reasonable costs caused by:
          </p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The user’s unlawful conduct</li>
            <li>Fraudulent information supplied by the user</li>
            <li>Unauthorized property listings</li>
            <li>Infringing content uploaded by the user</li>
            <li>Misuse of another person’s account or information</li>
            <li>Material violation of these terms</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            This provision must not limit mandatory consumer rights or impose liability that is prohibited by law.
          </p>

          {/* Section 21 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">21. Privacy</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Use of personal information is governed by the TenanTOwners <Link to="/privacy" className="text-[#4aa4f0] hover:underline transition-colors">Privacy Policy</Link>.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users should review the Privacy Policy to understand:</p>
          <ul className="list-disc pl-6 mb-12 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Information collected</li>
            <li>Purposes of collection</li>
            <li>Information sharing</li>
            <li>Security practices</li>
            <li>Data retention</li>
            <li>User rights</li>
            <li>Contact and grievance procedures</li>
          </ul>

          {/* Section 22 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">22. Changes to These Terms</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may update these Terms of Service when:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Services change</li>
            <li>New features are introduced</li>
            <li>Business practices change</li>
            <li>Legal requirements change</li>
            <li>Security requirements change</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The updated terms should be published on this page with a revised “Last Updated” date.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Material changes may also be communicated through the website or available user contact details where appropriate.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Continued use of the website after updated terms become effective may indicate acceptance, subject to any separate consent required by applicable law.
          </p>

          {/* Section 23 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">23. Governing Law and Disputes</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            These terms are governed by the applicable laws of India.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The parties should first attempt to resolve a dispute by contacting TenanTOwners through the official grievance email.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Nothing in these terms prevents a consumer from using rights or remedies available under applicable consumer-protection or other mandatory laws.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Subject to applicable law and mandatory consumer jurisdiction, disputes may be handled by courts or competent authorities having jurisdiction in Gautam Buddh Nagar, Uttar Pradesh.
          </p>

          {/* Section 24 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">24. Contact and Grievance Support</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            For questions, complaints, or concerns regarding these terms or the TenanTOwners services, contact:
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">TenanTOwners</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Official Email: <a href="mailto:tenantownerofficial@gmail.com" className="text-[#4aa4f0] hover:underline transition-colors">tenantownerofficial@gmail.com</a>
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Operating Areas:</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Noida Extension</li>
            <li>Central Noida</li>
            <li>Greater Noida</li>
            <li>Uttar Pradesh, India</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Complaint Response Period:</h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners aims to acknowledge and provide an initial response to complaints within 7 calendar days.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Some matters may require additional investigation. Where additional time is required, TenanTOwners should keep the complainant reasonably informed.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users should include sufficient information to identify:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Their account</li>
            <li>The relevant property</li>
            <li>Their enquiry</li>
            <li>Their payment, where applicable</li>
            <li>The issue being reported</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users must not send passwords, OTPs, card PINs, UPI PINs, banking passwords, or unnecessary identity documents through ordinary email.
          </p>
        </div>
      </div>
    </>
  );
}
