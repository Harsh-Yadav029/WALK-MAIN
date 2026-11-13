import React from 'react';
import { Shield, FileText, RefreshCw, Truck, Lock } from 'lucide-react';

const LegalTabbedPages = () => {
  const [activeTab, setActiveTab] = React.useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'refund', label: 'Refund & Cancellation Policy', icon: RefreshCw },
    { id: 'shipping', label: 'Shipping & Delivery Policy', icon: Truck },
  ];

  const sectionHeadingStyle = {
    color: '#ffffff',
    fontSize: '1.35rem',
    fontWeight: 600,
    marginTop: '2rem',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.5rem',
  };

  const textStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.75',
    marginBottom: '1rem',
  };

  const listStyle = {
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  };

  const companyFooterStyle = {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px dashed rgba(239, 199, 25, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem 8rem 1rem', maxWidth: '1000px' }}>
      {/* Top Banner Header */}
      <div style={{ textCenter: 'center', textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Legal & Compliance
        </span>
        <h1 style={{ fontSize: '2.8rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#ffffff' }}>
          Company Policies
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          Transparent, standard terms and privacy protections for Walk The Plan Private Limited clients.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: isActive ? '1px solid var(--accent-orange)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: isActive ? 'rgba(239, 199, 25, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Box */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* PRIVACY POLICY TAB */}
        {activeTab === 'privacy' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>Privacy Policy</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span><strong>Effective Date:</strong> 01 August 2026</span>
                <span><strong>Last Updated:</strong> 01 August 2026</span>
              </div>
            </div>

            <h3 style={sectionHeadingStyle}>1. Introduction</h3>
            <p style={textStyle}>
              Welcome to <strong>Walk The Plan Private Limited</strong> ("Walk The Plan", "Company", "we", "our", or "us").
            </p>
            <p style={textStyle}>
              We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your personal data when you visit our website, submit enquiries, book our services, make payments, communicate with us, or otherwise interact with us.
            </p>
            <p style={textStyle}>
              By accessing or using our website or services, you agree to the practices described in this Privacy Policy.
            </p>

            <h3 style={sectionHeadingStyle}>2. Company Information</h3>
            <p style={textStyle}>
              <strong>Walk The Plan Private Limited</strong><br />
              Building No. 328, Sector 19, Udyog Vihar, Phase IV,<br />
              Gurugram, Haryana – 122015, India<br /><br />
              Email: <strong><a href="mailto:info@walktheplan.in" style={{ color: 'var(--accent-orange)' }}>info@walktheplan.in</a></strong><br />
              Website: <strong><a href="https://walktheplan.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>https://walktheplan.in</a></strong>
            </p>

            <h3 style={sectionHeadingStyle}>3. Information We Collect</h3>
            <p style={textStyle}>Depending on how you interact with us, we may collect the following information:</p>
            
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>A. Personal Information</h4>
            <ul style={listStyle}>
              <li>Full Name</li>
              <li>Mobile Number</li>
              <li>Email Address</li>
              <li>City and State</li>
              <li>Postal Address (where required)</li>
              <li>Company Name (if applicable)</li>
              <li>GST Number (if applicable)</li>
            </ul>

            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>B. Project Information</h4>
            <p style={textStyle}>To deliver our visualization services, we may collect:</p>
            <ul style={listStyle}>
              <li>Architectural drawings</li>
              <li>Floor plans</li>
              <li>CAD/DWG files</li>
              <li>PDF layouts</li>
              <li>Site measurements</li>
              <li>Interior layouts</li>
              <li>Project specifications</li>
              <li>Images, videos, or reference materials shared by you</li>
            </ul>

            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>C. Franchise Information</h4>
            <p style={textStyle}>If you submit a franchise enquiry, we may collect:</p>
            <ul style={listStyle}>
              <li>Business experience</li>
              <li>Investment capacity</li>
              <li>Preferred location</li>
              <li>Professional details</li>
              <li>Contact information</li>
            </ul>

            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>D. Payment Information</h4>
            <p style={textStyle}>
              Payments made through our website are processed securely by our authorized payment gateway partners, including <strong>Razorpay</strong>.
            </p>
            <p style={textStyle}>
              <strong>Walk The Plan does not collect or store your complete debit card, credit card, UPI PIN, CVV, net banking credentials, or other sensitive payment authentication information.</strong> Such information is securely processed by the payment gateway in accordance with applicable laws and industry security standards.
            </p>

            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>E. Automatically Collected Information</h4>
            <p style={textStyle}>When you visit our website, we may automatically collect:</p>
            <ul style={listStyle}>
              <li>IP Address</li>
              <li>Browser Type</li>
              <li>Device Information</li>
              <li>Operating System</li>
              <li>Pages Visited</li>
              <li>Date and Time of Visit</li>
              <li>Referral Source</li>
              <li>Website Usage Statistics</li>
            </ul>

            <h3 style={sectionHeadingStyle}>4. How We Use Your Information</h3>
            <p style={textStyle}>We use your information to:</p>
            <ul style={listStyle}>
              <li>Respond to your enquiries.</li>
              <li>Schedule walkthroughs and projection sessions.</li>
              <li>Deliver AR, VR, and visualization services.</li>
              <li>Process bookings and payments.</li>
              <li>Generate quotations and invoices.</li>
              <li>Communicate regarding appointments and project updates.</li>
              <li>Improve our website and services.</li>
              <li>Provide customer support.</li>
              <li>Send service-related notifications.</li>
              <li>Process franchise applications.</li>
              <li>Comply with legal and regulatory obligations.</li>
              <li>Detect fraud, misuse, or unauthorized activities.</li>
            </ul>
            <p style={textStyle}>We do <strong>not</strong> sell your personal information to third parties.</p>

            <h3 style={sectionHeadingStyle}>5. Legal Basis for Processing</h3>
            <p style={textStyle}>We process your information only when necessary for:</p>
            <ul style={listStyle}>
              <li>Providing requested services.</li>
              <li>Performing contractual obligations.</li>
              <li>Complying with legal requirements.</li>
              <li>Protecting legitimate business interests.</li>
              <li>Operating and improving our website.</li>
              <li>Your consent, where required by applicable law.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>6. Sharing of Information</h3>
            <p style={textStyle}>We may share information only where necessary with:</p>
            <ul style={listStyle}>
              <li>Payment gateway providers (such as Razorpay)</li>
              <li>Technology and cloud hosting providers</li>
              <li>IT service providers</li>
              <li>Professional advisors (lawyers, accountants, auditors)</li>
              <li>Government or regulatory authorities when required by law</li>
              <li>Courts or law enforcement agencies where legally necessary</li>
            </ul>
            <p style={textStyle}>We do not rent, sell, or trade your personal information for marketing purposes.</p>

            <h3 style={sectionHeadingStyle}>7. Data Security</h3>
            <p style={textStyle}>
              We implement reasonable administrative, technical, and organizational safeguards to protect your information from unauthorized access, alteration, disclosure, misuse, or destruction.
            </p>
            <p style={textStyle}>
              While we strive to use commercially acceptable security measures, no internet-based system or method of electronic storage can be guaranteed to be completely secure.
            </p>

            <h3 style={sectionHeadingStyle}>8. Retention of Information</h3>
            <p style={textStyle}>We retain your information only for as long as necessary to:</p>
            <ul style={listStyle}>
              <li>Provide our services.</li>
              <li>Complete ongoing projects.</li>
              <li>Resolve disputes.</li>
              <li>Maintain business records.</li>
              <li>Comply with applicable laws.</li>
            </ul>
            <p style={textStyle}>
              Architectural drawings and project files may be retained for future revisions, warranty support, legal compliance, or project continuity unless deletion is requested and retention is not otherwise required by law.
            </p>

            <h3 style={sectionHeadingStyle}>9. Cookies and Analytics</h3>
            <p style={textStyle}>Our website may use cookies and similar technologies to:</p>
            <ul style={listStyle}>
              <li>Improve website performance.</li>
              <li>Remember user preferences.</li>
              <li>Analyze visitor traffic.</li>
              <li>Measure marketing effectiveness.</li>
              <li>Enhance user experience.</li>
            </ul>
            <p style={textStyle}>You may disable cookies through your browser settings; however, certain features of the website may not function properly.</p>

            <h3 style={sectionHeadingStyle}>10. Third-Party Services</h3>
            <p style={textStyle}>Our website may integrate third-party platforms, including but not limited to:</p>
            <ul style={listStyle}>
              <li>Razorpay</li>
              <li>Google Analytics</li>
              <li>Google Maps</li>
              <li>Meta Pixel</li>
              <li>YouTube</li>
              <li>WhatsApp</li>
              <li>Social media platforms</li>
            </ul>
            <p style={textStyle}>These services operate under their own privacy policies, and we encourage users to review them before sharing information.</p>

            <h3 style={sectionHeadingStyle}>11. Your Rights</h3>
            <p style={textStyle}>Subject to applicable Indian laws, you may request to:</p>
            <ul style={listStyle}>
              <li>Access your personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Update your information.</li>
              <li>Withdraw consent where applicable.</li>
              <li>Request deletion of information, subject to legal or contractual obligations.</li>
              <li>Raise concerns regarding the processing of your personal data.</li>
            </ul>
            <p style={textStyle}>To exercise these rights, please contact us using the details provided below.</p>

            <h3 style={sectionHeadingStyle}>12. Children's Privacy</h3>
            <p style={textStyle}>Our services are intended for individuals who are legally capable of entering into contracts under applicable law.</p>
            <p style={textStyle}>We do not knowingly collect personal information from children without appropriate authorization. If we become aware that personal information has been collected from a child without proper consent where required, we will take reasonable steps to delete such information.</p>

            <h3 style={sectionHeadingStyle}>13. Marketing Communications</h3>
            <p style={textStyle}>If you voluntarily subscribe to newsletters, promotional messages, or updates, we may contact you regarding:</p>
            <ul style={listStyle}>
              <li>New services</li>
              <li>Company announcements</li>
              <li>Events</li>
              <li>Promotional offers</li>
              <li>Business opportunities</li>
            </ul>
            <p style={textStyle}>You may opt out of marketing communications at any time by contacting us or using the unsubscribe option where available.</p>

            <h3 style={sectionHeadingStyle}>14. International Users</h3>
            <p style={textStyle}>Our services are operated from India. If you access our website from outside India, you acknowledge that your information may be transferred to and processed in India in accordance with this Privacy Policy and applicable laws.</p>

            <h3 style={sectionHeadingStyle}>15. Changes to this Privacy Policy</h3>
            <p style={textStyle}>We reserve the right to update or modify this Privacy Policy from time to time.</p>
            <p style={textStyle}>Any changes will become effective upon publication on this page. We encourage users to review this Privacy Policy periodically.</p>

            <h3 style={sectionHeadingStyle}>16. Contact Us</h3>
            <p style={textStyle}>If you have any questions, concerns, or requests regarding this Privacy Policy or our handling of personal information, please contact us:</p>
            <p style={textStyle}>
              <strong>Walk The Plan Private Limited</strong><br />
              Building No. 328, Sector 19, Udyog Vihar, Phase IV,<br />
              Gurugram, Haryana – 122015, India<br /><br />
              <strong>Email:</strong> <a href="mailto:info@walktheplan.in" style={{ color: 'var(--accent-orange)' }}>info@walktheplan.in</a><br />
              <strong>Website:</strong> <a href="https://walktheplan.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>https://walktheplan.in</a>
            </p>

            <h3 style={sectionHeadingStyle}>17. Governing Law</h3>
            <p style={textStyle}>This Privacy Policy shall be governed by and interpreted in accordance with the laws of India. Any disputes relating to this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana.</p>
          </div>
        )}

        {/* TERMS & CONDITIONS TAB */}
        {activeTab === 'terms' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>Terms & Conditions</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span><strong>Effective Date:</strong> 01 August 2026</span>
                <span><strong>Last Updated:</strong> 01 August 2026</span>
              </div>
            </div>

            <h3 style={sectionHeadingStyle}>1. Introduction</h3>
            <p style={textStyle}>
              Welcome to <strong>Walk The Plan Private Limited</strong> ("Walk The Plan", "Company", "we", "our", or "us").
            </p>
            <p style={textStyle}>
              These Terms & Conditions ("Terms") govern your access to and use of our website, products, services, consultations, walkthrough experiences, and any online or offline transactions conducted with Walk The Plan.
            </p>
            <p style={textStyle}>
              By accessing our website, submitting an enquiry, booking a service, or making a payment, you agree to be legally bound by these Terms.
            </p>

            <h3 style={sectionHeadingStyle}>2. About Walk The Plan</h3>
            <p style={textStyle}>
              Walk The Plan Private Limited provides architectural visualization and immersive spatial experience services, including but not limited to:
            </p>
            <ul style={listStyle}>
              <li>AR-Based 1:1 Floor Plan Projection</li>
              <li>Real-Scale Home Walkthroughs</li>
              <li>Virtual Reality (VR) Experiences</li>
              <li>Bare Shell Visualization</li>
              <li>Interior Visualization</li>
              <li>Architectural Presentation Solutions</li>
              <li>Project Demonstration Services</li>
              <li>Related Consultation Services</li>
            </ul>

            <h3 style={sectionHeadingStyle}>3. Eligibility</h3>
            <p style={textStyle}>By using our website or services, you confirm that:</p>
            <ul style={listStyle}>
              <li>You are at least 18 years of age or legally competent to enter into a binding contract.</li>
              <li>The information provided by you is true, complete, and accurate.</li>
              <li>You are authorized to share any architectural drawings, plans, or project documents submitted to us.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>4. Booking & Service Confirmation</h3>
            <p style={textStyle}>A booking shall be considered confirmed only after:</p>
            <ul style={listStyle}>
              <li>Required project details have been received;</li>
              <li>Availability has been confirmed by Walk The Plan; and</li>
              <li>Applicable advance payment has been successfully received.</li>
            </ul>
            <p style={textStyle}>Walk The Plan reserves the right to accept or decline any booking at its sole discretion.</p>

            <h3 style={sectionHeadingStyle}>5. Pricing & Payments</h3>
            <p style={textStyle}>All prices displayed or quoted are subject to change without prior notice.</p>
            <p style={textStyle}>Payments may be collected through:</p>
            <ul style={listStyle}>
              <li>Razorpay</li>
              <li>UPI</li>
              <li>Net Banking</li>
              <li>Credit Cards</li>
              <li>Debit Cards</li>
              <li>Bank Transfer</li>
              <li>Other approved payment methods</li>
            </ul>
            <p style={textStyle}>Unless otherwise agreed in writing, advance payment may be required before commencement of services.</p>
            <p style={textStyle}>Invoices shall be issued in accordance with applicable Indian laws.</p>

            <h3 style={sectionHeadingStyle}>6. Payment Gateway</h3>
            <p style={textStyle}>Online payments are processed through authorized third-party payment service providers.</p>
            <p style={textStyle}>Walk The Plan does not store your complete debit card, credit card, CVV, UPI PIN, or internet banking credentials.</p>
            <p style={textStyle}>Payment processing is governed by the respective payment gateway's terms and privacy policy.</p>

            <h3 style={sectionHeadingStyle}>7. Scope of Services</h3>
            <p style={textStyle}>Walk The Plan provides visualization services based solely on the information supplied by the client.</p>
            <p style={textStyle}>Deliverables depend upon:</p>
            <ul style={listStyle}>
              <li>Architectural drawings</li>
              <li>Dimensions</li>
              <li>CAD files</li>
              <li>Layouts</li>
              <li>Site information</li>
              <li>Interior references</li>
              <li>Specifications provided by the client</li>
            </ul>
            <p style={textStyle}>Any changes requested after project confirmation may require additional time and additional charges.</p>

            <h3 style={sectionHeadingStyle}>8. Client Responsibilities</h3>
            <p style={textStyle}>The client agrees to:</p>
            <ul style={listStyle}>
              <li>Provide accurate project information.</li>
              <li>Submit complete architectural drawings.</li>
              <li>Verify all submitted dimensions.</li>
              <li>Obtain all necessary permissions and approvals before engaging our services.</li>
              <li>Attend scheduled walkthrough sessions on time.</li>
            </ul>
            <p style={textStyle}>Walk The Plan shall not be responsible for inaccuracies arising from incorrect or incomplete information supplied by the client.</p>

            <h3 style={sectionHeadingStyle}>9. Project Changes</h3>
            <p style={textStyle}>Any modification requested after project preparation has commenced may result in:</p>
            <ul style={listStyle}>
              <li>Additional charges;</li>
              <li>Revised timelines; or</li>
              <li>A new booking requirement.</li>
            </ul>
            <p style={textStyle}>The Company reserves the right to determine whether requested changes fall within the original scope of work.</p>

            <h3 style={sectionHeadingStyle}>10. Intellectual Property</h3>
            <p style={textStyle}>
              Unless otherwise agreed in writing, all website content, branding, logos, graphics, designs, software, documents, videos, presentations, and other intellectual property remain the exclusive property of Walk The Plan Private Limited.
            </p>
            <p style={textStyle}>
              Users shall not reproduce, distribute, copy, modify, publish, or commercially exploit any material without prior written permission.
            </p>

            <h3 style={sectionHeadingStyle}>11. Client Materials</h3>
            <p style={textStyle}>The client retains ownership of architectural drawings and project documents submitted to Walk The Plan.</p>
            <p style={textStyle}>By submitting such materials, the client grants Walk The Plan a limited, non-exclusive licence to use them solely for providing the requested services.</p>

            <h3 style={sectionHeadingStyle}>12. Limitation of Services</h3>
            <p style={textStyle}>Walk The Plan provides visualization and experiential services only.</p>
            <p style={textStyle}>The Company:</p>
            <ul style={listStyle}>
              <li>does not undertake construction;</li>
              <li>does not certify structural safety;</li>
              <li>does not provide engineering approvals;</li>
              <li>does not guarantee construction outcomes.</li>
            </ul>
            <p style={textStyle}>
              Actual construction, workmanship, materials, execution, and project implementation remain the responsibility of the respective architect, engineer, contractor, builder, or project owner.
            </p>

            <h3 style={sectionHeadingStyle}>13. Limitation of Liability</h3>
            <p style={textStyle}>To the maximum extent permitted by applicable law, Walk The Plan shall not be liable for:</p>
            <ul style={listStyle}>
              <li>construction errors;</li>
              <li>architectural design defects;</li>
              <li>site execution issues;</li>
              <li>project delays caused by third parties;</li>
              <li>indirect or consequential losses;</li>
              <li>loss of profits or business opportunities.</li>
            </ul>
            <p style={textStyle}>Our total liability shall not exceed the amount actually paid by the client for the specific service giving rise to the claim.</p>

            <h3 style={sectionHeadingStyle}>14. Cancellation & Refunds</h3>
            <p style={textStyle}>
              Bookings, cancellations, rescheduling, and refunds shall be governed by the Company's <strong>Refund & Cancellation Policy</strong>.
            </p>

            <h3 style={sectionHeadingStyle}>15. Website Usage</h3>
            <p style={textStyle}>Users agree not to:</p>
            <ul style={listStyle}>
              <li>misuse the website;</li>
              <li>attempt unauthorized access to systems;</li>
              <li>upload malicious software or harmful code;</li>
              <li>interfere with website security;</li>
              <li>use the website for unlawful purposes.</li>
            </ul>
            <p style={textStyle}>Walk The Plan reserves the right to suspend or terminate access for violations of these Terms.</p>

            <h3 style={sectionHeadingStyle}>16. Third-Party Links</h3>
            <p style={textStyle}>Our website may contain links to third-party websites or services.</p>
            <p style={textStyle}>Walk The Plan is not responsible for the content, privacy practices, security, or policies of such external websites.</p>

            <h3 style={sectionHeadingStyle}>17. Force Majeure</h3>
            <p style={textStyle}>Walk The Plan shall not be liable for any delay or failure in performance caused by events beyond its reasonable control, including but not limited to:</p>
            <ul style={listStyle}>
              <li>natural disasters;</li>
              <li>floods;</li>
              <li>fire;</li>
              <li>war;</li>
              <li>civil unrest;</li>
              <li>government restrictions;</li>
              <li>pandemics;</li>
              <li>power failures;</li>
              <li>internet outages; or</li>
              <li>other unforeseen events.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>18. Confidentiality</h3>
            <p style={textStyle}>Walk The Plan shall use reasonable efforts to maintain the confidentiality of project-related information shared by clients.</p>
            <p style={textStyle}>However, the Company shall not be responsible for information that:</p>
            <ul style={listStyle}>
              <li>is publicly available;</li>
              <li>was lawfully obtained from another source; or</li>
              <li>is required to be disclosed by law or a competent authority.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>19. Privacy</h3>
            <p style={textStyle}>Your use of our website and services is also governed by our <strong>Privacy Policy</strong>, which forms an integral part of these Terms.</p>

            <h3 style={sectionHeadingStyle}>20. Changes to These Terms</h3>
            <p style={textStyle}>Walk The Plan reserves the right to modify or update these Terms at any time.</p>
            <p style={textStyle}>Revised Terms shall become effective immediately upon publication on the website unless otherwise stated.</p>
            <p style={textStyle}>Continued use of our website or services after such changes constitutes acceptance of the updated Terms.</p>

            <h3 style={sectionHeadingStyle}>21. Governing Law & Jurisdiction</h3>
            <p style={textStyle}>These Terms shall be governed by and construed in accordance with the laws of India.</p>
            <p style={textStyle}>Any dispute arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts at <strong>Gurugram, Haryana</strong>.</p>

            <h3 style={sectionHeadingStyle}>22. Contact Information</h3>
            <p style={textStyle}>
              <strong>Walk The Plan Private Limited</strong><br /><br />
              Building No. 328, Sector 19, Udyog Vihar, Phase IV,<br />
              Gurugram, Haryana – 122015, India<br /><br />
              <strong>Email:</strong> <a href="mailto:info@walktheplan.in" style={{ color: 'var(--accent-orange)' }}>info@walktheplan.in</a><br />
              <strong>Website:</strong> <a href="https://walktheplan.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>https://walktheplan.in</a>
            </p>
          </div>
        )}

        {/* REFUND & CANCELLATION POLICY TAB */}
        {activeTab === 'refund' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>Refund & Cancellation Policy</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span><strong>Effective Date:</strong> 01 August 2026</span>
                <span><strong>Last Updated:</strong> 01 August 2026</span>
              </div>
            </div>

            <h3 style={sectionHeadingStyle}>1. Introduction</h3>
            <p style={textStyle}>
              This Refund & Cancellation Policy ("Policy") governs all bookings, payments, cancellations, rescheduling requests, and refunds for services offered by <strong>Walk The Plan Private Limited</strong> ("Walk The Plan", "Company", "we", "our", or "us").
            </p>
            <p style={textStyle}>
              By booking any service or making any payment through our website or offline channels, you agree to this Policy.
            </p>

            <h3 style={sectionHeadingStyle}>2. Nature of Our Services</h3>
            <p style={textStyle}>
              Walk The Plan provides professional architectural visualization and immersive experience services, including but not limited to:
            </p>
            <ul style={listStyle}>
              <li>AR-Based 1:1 Floor Plan Projection</li>
              <li>Real-Scale Home Walkthroughs</li>
              <li>Virtual Reality (VR) Experiences</li>
              <li>Bare Shell Visualization</li>
              <li>Interior Visualization</li>
              <li>Architectural Presentation Services</li>
              <li>Project Demonstrations</li>
              <li>Consultation Services</li>
            </ul>
            <p style={textStyle}>
              As these are customized, appointment-based, and project-specific services, each booking involves dedicated planning, scheduling, technical preparation, and resource allocation.
            </p>

            <h3 style={sectionHeadingStyle}>3. Booking Confirmation</h3>
            <p style={textStyle}>A booking is considered confirmed only after:</p>
            <ul style={listStyle}>
              <li>Required project information has been received;</li>
              <li>The requested schedule has been approved by Walk The Plan; and</li>
              <li>The applicable advance payment has been successfully received.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>4. Cancellation by the Client</h3>
            <p style={textStyle}>Clients may request cancellation by contacting Walk The Plan through the official communication channels.</p>
            <p style={textStyle}>Cancellation requests are subject to the following conditions:</p>
            <ul style={listStyle}>
              <li>Cancellation requests submitted <strong>before any project preparation or scheduling has commenced</strong> may be considered on a case-by-case basis.</li>
              <li>Once project preparation, technical setup, scheduling, visualization work, or resource allocation has begun, cancellation may not be eligible for a refund.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>5. Refund Policy</h3>
            <p style={textStyle}>
              Due to the customized nature of our services, <strong>payments made towards confirmed bookings are generally non-refundable</strong>.
            </p>
            <p style={textStyle}>
              However, Walk The Plan may, at its sole discretion, approve a full or partial refund in exceptional circumstances, including but not limited to:
            </p>
            <ul style={listStyle}>
              <li>Duplicate payment;</li>
              <li>Incorrect payment due to a verified technical error;</li>
              <li>Payment received without a valid booking;</li>
              <li>Service cancellation initiated by Walk The Plan where no suitable rescheduling option is available.</li>
            </ul>
            <p style={textStyle}>Approved refunds, if any, will be processed through the original mode of payment.</p>

            <h3 style={sectionHeadingStyle}>6. Rescheduling</h3>
            <p style={textStyle}>Clients may request rescheduling of a confirmed booking by contacting Walk The Plan in advance.</p>
            <p style={textStyle}>Rescheduling is subject to:</p>
            <ul style={listStyle}>
              <li>Availability of preferred dates;</li>
              <li>Operational feasibility; and</li>
              <li>Approval by Walk The Plan.</li>
            </ul>
            <p style={textStyle}>Additional charges may apply if rescheduling requires significant changes to project preparation, travel, technical arrangements, or resource allocation.</p>
            <p style={textStyle}>Repeated rescheduling requests may be treated as a new booking.</p>

            <h3 style={sectionHeadingStyle}>7. Additional Sessions</h3>
            <p style={textStyle}>
              Any additional walkthrough, repeat projection, revised visualization, extended session, or supplementary service requested beyond the original booking shall be treated as a separate service and may attract additional charges.
            </p>

            <h3 style={sectionHeadingStyle}>8. Client Responsibility</h3>
            <p style={textStyle}>The client is responsible for providing complete and accurate:</p>
            <ul style={listStyle}>
              <li>Architectural drawings;</li>
              <li>CAD files;</li>
              <li>Floor plans;</li>
              <li>Measurements;</li>
              <li>Project specifications; and</li>
              <li>Other information necessary for service delivery.</li>
            </ul>
            <p style={textStyle}>Walk The Plan shall not be responsible for delays, additional costs, or inaccuracies resulting from incorrect or incomplete information provided by the client.</p>

            <h3 style={sectionHeadingStyle}>9. Cancellation by Walk The Plan</h3>
            <p style={textStyle}>Walk The Plan reserves the right to cancel or postpone a booking due to circumstances including, but not limited to:</p>
            <ul style={listStyle}>
              <li>Technical failures;</li>
              <li>Safety concerns;</li>
              <li>Unavailability of key resources;</li>
              <li>Natural disasters;</li>
              <li>Government restrictions;</li>
              <li>Force majeure events; or</li>
              <li>Other circumstances beyond our reasonable control.</li>
            </ul>
            <p style={textStyle}>Where Walk The Plan cancels a confirmed booking and rescheduling is not feasible, the client may be offered an appropriate refund or an alternative appointment at the Company's discretion.</p>

            <h3 style={sectionHeadingStyle}>10. Failed or Interrupted Payments</h3>
            <p style={textStyle}>If a payment fails but the amount is debited from your account:</p>
            <ul style={listStyle}>
              <li>Please allow sufficient time for the banking system to process the transaction.</li>
              <li>If the amount is successfully received by Walk The Plan, the booking will be confirmed.</li>
              <li>If the transaction fails and the payment is not received by Walk The Plan, the refund shall be governed by the policies of the respective bank or payment gateway.</li>
            </ul>
            <p style={textStyle}>For payment-related assistance, please contact us with your transaction details.</p>

            <h3 style={sectionHeadingStyle}>11. Refund Processing Timeline</h3>
            <p style={textStyle}>Where a refund has been approved by Walk The Plan, it will generally be processed within <strong>7 to 10 business days</strong>.</p>
            <p style={textStyle}>The actual credit timeline may vary depending on your bank, payment service provider, or card issuer.</p>

            <h3 style={sectionHeadingStyle}>12. Non-Refundable Situations</h3>
            <p style={textStyle}>Unless otherwise determined by Walk The Plan, refunds will generally not be available in the following situations:</p>
            <ul style={listStyle}>
              <li>Change of mind after booking confirmation;</li>
              <li>Failure to attend a scheduled session without prior notice;</li>
              <li>Delay caused by incomplete or incorrect project information;</li>
              <li>Requests made after project preparation has commenced;</li>
              <li>Services already delivered, in whole or in part;</li>
              <li>Repeat walkthroughs or additional sessions requested by the client.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>13. Dispute Resolution</h3>
            <p style={textStyle}>Any dispute relating to cancellations or refunds should first be communicated to Walk The Plan through our official support channels.</p>
            <p style={textStyle}>We will make reasonable efforts to resolve genuine concerns in a fair and timely manner.</p>

            <h3 style={sectionHeadingStyle}>14. Governing Law</h3>
            <p style={textStyle}>This Refund & Cancellation Policy shall be governed by the laws of India.</p>
            <p style={textStyle}>Any dispute arising out of this Policy shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Gurugram, Haryana</strong>.</p>

            <h3 style={sectionHeadingStyle}>15. Contact Us</h3>
            <p style={textStyle}>For any questions regarding cancellations or refunds, please contact:</p>
            <p style={textStyle}>
              <strong>Walk The Plan Private Limited</strong><br /><br />
              Building No. 328, Sector 19, Udyog Vihar, Phase IV,<br />
              Gurugram, Haryana – 122015, India<br /><br />
              <strong>Email:</strong> <a href="mailto:info@walktheplan.in" style={{ color: 'var(--accent-orange)' }}>info@walktheplan.in</a><br />
              <strong>Website:</strong> <a href="https://walktheplan.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>https://walktheplan.in</a>
            </p>
          </div>
        )}

        {/* SHIPPING & DELIVERY POLICY TAB */}
        {activeTab === 'shipping' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '0.5rem' }}>Shipping & Delivery Policy</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span><strong>Effective Date:</strong> 01 August 2026</span>
                <span><strong>Last Updated:</strong> 01 August 2026</span>
              </div>
            </div>

            <h3 style={sectionHeadingStyle}>1. Introduction</h3>
            <p style={textStyle}>
              This Shipping & Delivery Policy ("Policy") explains how <strong>Walk The Plan Private Limited</strong> ("Walk The Plan", "Company", "we", "our", or "us") delivers its services after a booking or payment is successfully completed.
            </p>
            <p style={textStyle}>
              By making a booking or payment through our website or other authorized channels, you agree to this Policy.
            </p>

            <h3 style={sectionHeadingStyle}>2. Nature of Our Services</h3>
            <p style={textStyle}>
              Walk The Plan provides professional architectural visualization and immersive experience services, including but not limited to:
            </p>
            <ul style={listStyle}>
              <li>AR-Based 1:1 Floor Plan Projection</li>
              <li>Real-Scale Home Walkthroughs</li>
              <li>Virtual Reality (VR) Experiences</li>
              <li>Bare Shell Visualization</li>
              <li>Interior Visualization</li>
              <li>Architectural Presentation Services</li>
              <li>Project Demonstration Services</li>
              <li>Consultation Services</li>
            </ul>
            <p style={textStyle}>
              These are <strong>service-based offerings</strong>, and <strong>no physical goods or products are shipped</strong> to customers unless specifically agreed in writing.
            </p>

            <h3 style={sectionHeadingStyle}>3. Service Delivery</h3>
            <p style={textStyle}>
              After successful booking and payment, our team will contact you using the details provided during the booking process to:
            </p>
            <ul style={listStyle}>
              <li>Confirm your booking.</li>
              <li>Collect project drawings and required documents.</li>
              <li>Verify project information.</li>
              <li>Schedule the walkthrough or visualization session.</li>
              <li>Share any further instructions required for service delivery.</li>
            </ul>
            <p style={textStyle}>
              The exact delivery timeline depends on the complexity of the project, availability of required information, and mutually agreed schedule.
            </p>

            <h3 style={sectionHeadingStyle}>4. Delivery Method</h3>
            <p style={textStyle}>Our services may be delivered through one or more of the following methods:</p>
            <ul style={listStyle}>
              <li>At Walk The Plan Experience Centre or Studio.</li>
              <li>At a mutually agreed project location (where applicable).</li>
              <li>Through online meetings or virtual consultations.</li>
              <li>By electronic communication, including email or other approved digital platforms.</li>
            </ul>
            <p style={textStyle}>The applicable delivery method will be communicated to the client during the booking process.</p>

            <h3 style={sectionHeadingStyle}>5. Project Documents</h3>
            <p style={textStyle}>Clients are responsible for providing complete and accurate:</p>
            <ul style={listStyle}>
              <li>Architectural drawings;</li>
              <li>CAD/DWG files;</li>
              <li>PDF layouts;</li>
              <li>Measurements;</li>
              <li>Site plans;</li>
              <li>Interior references; and</li>
              <li>Any other information required for execution of the booked service.</li>
            </ul>
            <p style={textStyle}>Delays in providing the required documents may result in corresponding delays in service delivery.</p>

            <h3 style={sectionHeadingStyle}>6. Delivery Timelines</h3>
            <p style={textStyle}>Service timelines vary depending on:</p>
            <ul style={listStyle}>
              <li>Project size and complexity;</li>
              <li>Accuracy and completeness of client information;</li>
              <li>Technical requirements;</li>
              <li>Scheduling availability; and</li>
              <li>Operational considerations.</li>
            </ul>
            <p style={textStyle}>Any timelines communicated by Walk The Plan are estimates and may change due to unforeseen circumstances.</p>

            <h3 style={sectionHeadingStyle}>7. Delays</h3>
            <p style={textStyle}>
              While Walk The Plan makes every reasonable effort to deliver services within the agreed timeframe, delays may occur due to circumstances beyond our reasonable control, including:
            </p>
            <ul style={listStyle}>
              <li>Force majeure events;</li>
              <li>Technical issues;</li>
              <li>Government restrictions;</li>
              <li>Internet or power outages;</li>
              <li>Client-requested changes;</li>
              <li>Incomplete project information; or</li>
              <li>Other unforeseen operational factors.</li>
            </ul>
            <p style={textStyle}>Walk The Plan shall not be liable for delays arising from such circumstances.</p>

            <h3 style={sectionHeadingStyle}>8. No Physical Shipping</h3>
            <p style={textStyle}>Walk The Plan does <strong>not</strong> ship physical products as part of its standard business operations.</p>
            <p style={textStyle}>Accordingly:</p>
            <ul style={listStyle}>
              <li>No courier or postal delivery charges apply to our standard services.</li>
              <li>No shipment tracking number will be generated.</li>
              <li>No logistics or freight services are involved unless specifically agreed in writing.</li>
            </ul>

            <h3 style={sectionHeadingStyle}>9. Digital Communication</h3>
            <p style={textStyle}>
              Booking confirmations, invoices, quotations, appointment details, project updates, and other service-related communications may be sent via:
            </p>
            <ul style={listStyle}>
              <li>Email;</li>
              <li>Telephone;</li>
              <li>WhatsApp; or</li>
              <li>Other officially approved communication channels.</li>
            </ul>
            <p style={textStyle}>Clients are responsible for ensuring that the contact information provided is accurate and up to date.</p>

            <h3 style={sectionHeadingStyle}>10. Service Completion</h3>
            <p style={textStyle}>
              A service shall generally be considered delivered upon completion of the scheduled walkthrough, projection, consultation, visualization session, or other agreed deliverable.
            </p>
            <p style={textStyle}>
              Any additional services requested after completion may be treated as a separate engagement and may attract additional charges.
            </p>

            <h3 style={sectionHeadingStyle}>11. Contact Us</h3>
            <p style={textStyle}>For any questions regarding service delivery or bookings, please contact:</p>
            <p style={textStyle}>
              <strong>Walk The Plan Private Limited</strong><br /><br />
              Building No. 328, Sector 19, Udyog Vihar, Phase IV,<br />
              Gurugram, Haryana – 122015, India<br /><br />
              <strong>Email:</strong> <a href="mailto:info@walktheplan.in" style={{ color: 'var(--accent-orange)' }}>info@walktheplan.in</a><br />
              <strong>Website:</strong> <a href="https://walktheplan.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>https://walktheplan.in</a>
            </p>

            <h3 style={sectionHeadingStyle}>12. Governing Law</h3>
            <p style={textStyle}>This Shipping & Delivery Policy shall be governed by the laws of India.</p>
            <p style={textStyle}>Any dispute arising under this Policy shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Gurugram, Haryana</strong>.</p>
          </div>
        )}

        {/* Company Signature Banner */}
        <div style={companyFooterStyle}>
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Walk The Plan Private Limited
          </p>
          <p style={{ color: 'var(--accent-orange)', fontWeight: 600, fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>
            Experience Before You Build.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalTabbedPages;
