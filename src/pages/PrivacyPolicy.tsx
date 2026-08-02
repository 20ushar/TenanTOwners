import React from 'react';
import { Helmet } from 'react-helmet-async';

export function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | TenanTOwners</title>
        <meta name="description" content="Read how TenanTOwners collects, uses, shares, protects, and manages personal information related to accounts, property enquiries, property visits, and website usage." />
      </Helmet>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="mb-8 text-sm text-slate-500 dark:text-slate-400 font-medium space-y-1">
            <p>Effective Date: 28 July 2026</p>
            <p>Last Updated: 28 July 2026</p>
          </div>

          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners respects your privacy and is committed to handling personal information responsibly.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            This Privacy Policy explains what information we may collect, why we collect it, how it may be used or shared, how it is protected, and the choices available to users when they use the TenanTOwners website and related services.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            By using TenanTOwners, you acknowledge that you have read this Privacy Policy. Where consent is legally required, consent should be requested separately through the appropriate website interface.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">We may collect the following categories of information:</p>
          
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Account Information</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>User account identifier</li>
            <li>Profile information</li>
            <li>Authentication-related information managed by the authentication provider</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Property Enquiry Information</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Properties viewed</li>
            <li>Properties saved to Wishlist</li>
            <li>Property enquiries</li>
            <li>Property visit requests</li>
            <li>Preferred location</li>
            <li>Preferred society</li>
            <li>Budget</li>
            <li>BHK preference</li>
            <li>Property type preference</li>
            <li>Other property requirements entered by the user</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Communication Information</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Emails</li>
            <li>Phone enquiries</li>
            <li>Contact-form submissions</li>
            <li>Support requests</li>
            <li>Feedback</li>
            <li>Complaints</li>
            <li>Other correspondence sent to TenanTOwners</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Technical and Usage Information</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Device type</li>
            <li>Browser type</li>
            <li>IP address</li>
            <li>Login and session information</li>
            <li>Pages visited</li>
            <li>Referral source</li>
            <li>Error logs</li>
            <li>Security-related information</li>
            <li>Cookies</li>
            <li>Browser local storage</li>
            <li>Session storage</li>
            <li>Similar technologies required for website functionality, authentication, security, and preferences</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Property owners, representatives, brokers, or administrators may also provide:</h3>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Property details</li>
            <li>Property photographs</li>
            <li>Property videos</li>
            <li>Location information</li>
            <li>Society information</li>
            <li>Property-owner or representative contact details</li>
            <li>Pricing and availability information</li>
          </ul>

          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners does not intentionally request users to submit passwords, OTPs, payment credentials, or sensitive banking details through property forms, enquiry forms, or ordinary support communications.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">We may use personal information to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Create and manage user accounts</li>
            <li>Authenticate users</li>
            <li>Maintain account security</li>
            <li>Provide Wishlist functionality</li>
            <li>Display and manage My Requests</li>
            <li>Respond to property enquiries</li>
            <li>Coordinate property visits</li>
            <li>Connect interested users with relevant property owners, representatives, brokers, or team members</li>
            <li>Recommend or display suitable rental and resale properties</li>
            <li>Provide customer support</li>
            <li>Communicate about requested properties or services</li>
            <li>Send authentication and password-reset communications</li>
            <li>Maintain and improve website functionality</li>
            <li>Diagnose technical problems</li>
            <li>Detect fraud, misuse, spam, or unauthorized access</li>
            <li>Protect users and the website</li>
            <li>Resolve complaints</li>
            <li>Enforce website policies</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Personal information should not be used for an unrelated purpose without an appropriate legal basis or consent where required.
          </p>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Account Authentication</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may support account authentication through methods such as:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Email and password</li>
            <li>Google Sign-In</li>
            <li>Phone number and OTP, where enabled</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Passwords must be managed through the authentication provider.</p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Passwords must never be stored as readable text in:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Website source code</li>
            <li>Firestore</li>
            <li>Local storage</li>
            <li>Session storage</li>
            <li>Application logs</li>
            <li>Admin records</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Authentication providers may process information according to their own privacy policies, terms, and security practices.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Property Enquiries and Visit Requests</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">When a user submits a property enquiry or visit request, relevant information may be shared with:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>The TenanTOwners team</li>
            <li>The applicable property owner</li>
            <li>An authorized property representative</li>
            <li>A broker or service provider involved in responding to the enquiry</li>
            <li>A person responsible for coordinating the visit</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Only information reasonably necessary to respond to the enquiry or provide the requested service should be shared.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Submitting an enquiry or visit request does not guarantee:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Property availability</li>
            <li>Final pricing</li>
            <li>Ownership status</li>
            <li>Property condition</li>
            <li>Approval of a rental application</li>
            <li>Completion of a transaction</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should independently confirm important property and transaction details before making any payment or signing any agreement.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Information Sharing</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners does not sell or rent users’ personal information.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Information may be shared in the following circumstances:
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Service Providers</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">We may use service providers for:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Website hosting</li>
            <li>Authentication</li>
            <li>Database services</li>
            <li>Image and media hosting</li>
            <li>Communication</li>
            <li>Security</li>
            <li>Error monitoring</li>
            <li>Analytics, if enabled</li>
            <li>Technical support</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Property Services</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Information may be shared with property owners, authorized representatives, brokers, or team members when reasonably necessary to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Answer a property enquiry</li>
            <li>Coordinate a property visit</li>
            <li>Discuss property requirements</li>
            <li>Provide a service requested by the user</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Legal Requirements</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Information may be disclosed when reasonably required by:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Applicable law</li>
            <li>Regulation</li>
            <li>Court order</li>
            <li>Government authority</li>
            <li>Lawful legal request</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Protection and Security</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Information may be used or disclosed when reasonably necessary to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Prevent fraud</li>
            <li>Investigate misuse</li>
            <li>Protect users</li>
            <li>Protect website security</li>
            <li>Enforce legal rights</li>
            <li>Respond to security incidents</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Business Transfer</h3>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            If TenanTOwners or its operations are reorganized, transferred, merged, acquired, or sold, relevant information may be transferred subject to applicable legal requirements and reasonable safeguards.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Third-Party Services</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The website may use third-party services, including where applicable:
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Firebase</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Firebase may be used for:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Authentication</li>
            <li>Database services</li>
            <li>Application functionality</li>
            <li>Security</li>
            <li>Related technical services</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Cloudinary</h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Cloudinary may be used for storing, processing, and delivering property images or other media.
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Vercel or Current Hosting Provider</h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The website may be hosted and deployed through Vercel or another hosting provider used by the project.
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">Google Services</h3>
          <p className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Google services may be used for:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Google Sign-In</li>
            <li>Google Maps links</li>
            <li>Location-related functionality</li>
            <li>Other enabled Google integrations</li>
          </ul>

          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            These third-party providers may process information under their own privacy policies, terms, and security practices.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners should only provide service providers with information reasonably necessary for their assigned purpose.
          </p>

          {/* Section 7 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Cookies and Browser Storage</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may use cookies, local storage, session storage, or similar technologies to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Keep users signed in</li>
            <li>Maintain authentication sessions</li>
            <li>Remember preferences</li>
            <li>Support Wishlist functionality</li>
            <li>Support My Requests</li>
            <li>Maintain selected Buy or Rent preferences</li>
            <li>Protect the website against misuse</li>
            <li>Improve website functionality</li>
            <li>Diagnose errors</li>
            <li>Measure website performance where applicable</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Some technologies may be essential for the website to function correctly.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            If non-essential analytics, advertising, or tracking technologies are added, appropriate notice and consent controls should be introduced where required.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Data Security</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners uses reasonable technical and organizational measures intended to protect personal information from:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Unauthorized access</li>
            <li>Misuse</li>
            <li>Loss</li>
            <li>Alteration</li>
            <li>Improper disclosure</li>
            <li>Accidental destruction</li>
            <li>Security attacks</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">These measures may include:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Authentication controls</li>
            <li>Protected administrator routes</li>
            <li>Restricted database permissions</li>
            <li>Secure network communication</li>
            <li>Service-provider security controls</li>
            <li>Access restrictions</li>
            <li>Abuse prevention</li>
            <li>Error and security monitoring</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            No internet-based system can be guaranteed to be completely secure. Therefore, TenanTOwners cannot guarantee absolute security.
          </p>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users are responsible for:</p>
          <ul className="list-disc pl-6 mb-12 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Keeping account credentials confidential</li>
            <li>Not sharing passwords or OTPs</li>
            <li>Using a secure password</li>
            <li>Reporting suspected unauthorized account access</li>
          </ul>

          {/* Section 9 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Data Retention</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Personal information may be retained only for as long as reasonably required to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Provide requested services</li>
            <li>Maintain active user accounts</li>
            <li>Respond to enquiries</li>
            <li>Coordinate property visits</li>
            <li>Resolve complaints</li>
            <li>Maintain security</li>
            <li>Prevent fraud</li>
            <li>Meet legal or accounting requirements</li>
            <li>Resolve disputes</li>
            <li>Enforce website policies</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Information that is no longer reasonably required should be deleted, anonymized, or access-restricted, subject to applicable legal obligations and technical limitations.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Backups may temporarily retain deleted information until they are overwritten through the normal backup cycle.
          </p>

          {/* Section 10 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. User Rights and Choices</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Subject to applicable law, users may request to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Access personal information associated with their account</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Update profile information</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Request deletion of eligible personal information</li>
            <li>Close their account</li>
            <li>Raise a complaint</li>
            <li>Ask questions about how their information is handled</li>
          </ul>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Some information may need to be retained for:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Legal compliance</li>
            <li>Fraud prevention</li>
            <li>Security</li>
            <li>Dispute resolution</li>
            <li>Record-keeping obligations</li>
          </ul>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners may need to verify the user’s identity before completing a privacy-related request.
          </p>

          {/* Section 11 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Emails and Communications</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may contact users regarding:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Account activity</li>
            <li>Email verification</li>
            <li>Password resets</li>
            <li>Property enquiries</li>
            <li>Property visit requests</li>
            <li>Customer support</li>
            <li>Security alerts</li>
            <li>Important website updates</li>
            <li>Policy updates</li>
            <li>Services requested by the user</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users may request to stop optional promotional communications.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Essential authentication, transaction, support, and security messages may still be sent.
          </p>

          {/* Section 12 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Children’s Privacy</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners is intended for adults who are legally capable of entering into property-related arrangements.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners does not knowingly collect personal information from children without legally valid authorization or parental or guardian consent where required.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            If a parent or guardian believes that a child has provided personal information improperly, they should contact TenanTOwners so the matter can be reviewed.
          </p>

          {/* Section 13 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. External Links</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">The website or property listings may contain links to:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Google Maps</li>
            <li>Social-media platforms</li>
            <li>Communication services</li>
            <li>Property-related websites</li>
            <li>Other third-party services</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners does not control the content, security, or privacy practices of independent third-party websites.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users should review the privacy policies and terms of those services before submitting personal information.
          </p>

          {/* Section 14 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. International Processing</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Some third-party service providers may process or store information outside India.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Where information is processed internationally, TenanTOwners will take reasonable steps to use appropriate providers and follow applicable legal requirements and restrictions.
          </p>

          {/* Section 15 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Security Incidents and Data Breaches</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">If a security incident or personal-data breach occurs, TenanTOwners may take reasonable steps to:</p>
          <ul className="list-disc pl-6 mb-12 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Investigate the incident</li>
            <li>Contain the incident</li>
            <li>Protect affected accounts</li>
            <li>Restore secure operations</li>
            <li>Reset or revoke affected access</li>
            <li>Notify affected users where appropriate</li>
            <li>Notify relevant authorities where legally required</li>
            <li>Improve safeguards to reduce future risks</li>
          </ul>

          {/* Section 16 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. Changes to This Privacy Policy</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">TenanTOwners may update this Privacy Policy when:</p>
          <ul className="list-disc pl-6 mb-6 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Website services change</li>
            <li>New features are introduced</li>
            <li>Technology changes</li>
            <li>Third-party service providers change</li>
            <li>Legal or regulatory requirements change</li>
          </ul>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            The updated policy should be published on this page with a revised “Last Updated” date.
          </p>
          <p className="mb-12 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Material changes may also be communicated through the website or available user contact details where appropriate.
          </p>

          {/* Section 17 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">17. Contact and Grievance Support</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            For privacy-related questions, correction or deletion requests, complaints, or concerns, contact:
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
            TenanTOwners aims to acknowledge and provide an initial response to privacy-related complaints within 7 calendar days.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            If additional investigation is required, TenanTOwners may take more time and should keep the complainant informed about relevant progress.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Users submitting a request should include sufficient information to help identify the account, enquiry, or issue.
          </p>

          <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">Users must not send the following through ordinary email:</p>
          <ul className="list-disc pl-6 mb-4 text-slate-600 dark:text-slate-300 space-y-2 text-lg">
            <li>Passwords</li>
            <li>OTPs</li>
            <li>Payment credentials</li>
            <li>Banking credentials</li>
            <li>Unnecessary identity documents</li>
            <li>Other highly sensitive information</li>
          </ul>

        </div>
      </div>
    </>
  );
}
