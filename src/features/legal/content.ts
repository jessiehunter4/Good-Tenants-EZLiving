/**
 * The legal pages' text.
 *
 * Carried across from `comingsoonhomrentals-com/src/pages/Privacy.tsx` and
 * `Terms.tsx`, which are the substantive ones — EZ Living Irvine's `/legal` was
 * three short paragraphs, and its fair housing paragraph is folded in below.
 *
 * The words are the business's, not mine, with one class of change: the site is
 * named as this one, and every reference to the separate sites is a reference
 * to the merged app. THE DATES AND THE SUBSTANCE HAVE NOT BEEN REVIEWED BY A
 * LAWYER FOR THE MERGED PRODUCT, and the merge changed what data is collected
 * and who can see it — so this needs a read before launch, not after.
 */
export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: readonly string[] };

export type LegalSection = {
  heading: string;
  blocks: readonly LegalBlock[];
};

/** The date the source pages carried. Update when the text is next reviewed. */
export const LEGAL_EFFECTIVE_DATE = "January 7, 2025";

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    heading: "Introduction",
    blocks: [
    { kind: "p", text: "Good Tenants EZ Living (\"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our website and services." },
    ],
  },
  {
    heading: "Information We Collect",
    blocks: [
    { kind: "p", text: "We may collect the following types of information:" },
    {
      kind: "ul",
      items: [
      "Contact Information: Name, email address, phone number, and mailing address.",
      "Pre-Qualification Data: Household income, credit score estimates, move-in timeline, pet information, and rental preferences.",
      "Pre-Screening Data: Credit reports, background check results, income verification documents, and rental history (when applicable).",
      "Booking and Usage Data: Showing appointments, property views, saved listings, and interactions with our platform.",
      "Device and Technical Data: IP address, browser type, device information, and usage patterns."
      ],
    },
    ],
  },
  {
    heading: "How We Use Your Information",
    blocks: [
    { kind: "p", text: "We use your information to:" },
    {
      kind: "ul",
      items: [
      "Match you with suitable rental properties based on your qualifications and preferences.",
      "Facilitate showing appointments and communications between tenants, landlords, and real estate professionals.",
      "Process pre-qualification and pre-screening requests.",
      "Send you updates about properties, appointments, and services you have requested.",
      "Improve our platform, services, and user experience.",
      "Comply with legal obligations and protect against fraud."
      ],
    },
    ],
  },
  {
    heading: "Information Sharing",
    blocks: [
    { kind: "p", text: "We may share your information with:" },
    { kind: "p", text: "We do not sell your personal information to third parties for their marketing purposes." },
    {
      kind: "ul",
      items: [
      "Landlords and Property Managers: To facilitate rental inquiries, showings, and applications for properties you express interest in.",
      "Licensed Real Estate Professionals: To assist with your property search and rental process.",
      "Service Providers: Third-party vendors who help us operate our platform, including scheduling, communication, and payment processing services.",
      "Legal and Regulatory: When required by law or to protect our rights and the safety of our users."
      ],
    },
    ],
  },
  {
    heading: "Data Security",
    blocks: [
    { kind: "p", text: "We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security." },
    ],
  },
  {
    heading: "Your Rights",
    blocks: [
    { kind: "p", text: "You have the right to:" },
    { kind: "p", text: "To exercise these rights, please contact us using the information provided below." },
    {
      kind: "ul",
      items: [
      "Access: Request a copy of the personal information we hold about you.",
      "Correction: Request correction of inaccurate or incomplete information.",
      "Deletion: Request deletion of your personal information, subject to legal and contractual requirements."
      ],
    },
    ],
  },
  {
    heading: "Cookies and Tracking",
    blocks: [
    { kind: "p", text: "Our website may use cookies and similar technologies to improve your browsing experience, analyze usage patterns, and deliver relevant content. You can manage cookie preferences through your browser settings. Disabling cookies may affect some features of our platform." },
    ],
  },
  {
    heading: "Changes to This Policy",
    blocks: [
    { kind: "p", text: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically." },
    ],
  },
  {
    heading: "Fair Housing",
    blocks: [
      {
        kind: "p",
        text: "Good Tenants EZ Living supports Equal Housing Opportunity and complies with federal, state and local fair housing law. Listings describe the property, never the people who might live there, and copy is checked against that rule before it is published.",
      },
    ],
  },
] as const;

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    heading: "Description of Service",
    blocks: [
    { kind: "p", text: "Good Tenants EZ Living provides a platform that connects prospective tenants with upcoming and newly listed rental properties. Our services include property listings, tenant pre-qualification, pre-screening, and showing appointment scheduling. We operate under Jessie Hunter Broker DBA Good Tenants Services, a licensed California real estate broker." },
    ],
  },
  {
    heading: "Eligibility",
    blocks: [
    { kind: "p", text: "You must be at least 18 years of age to use our services. By using this website, you represent and warrant that you have the legal capacity to enter into these Terms of Service and to comply with all applicable laws." },
    ],
  },
  {
    heading: "No Guarantee of Rental Approval",
    blocks: [
    { kind: "p", text: "Pre-qualification and pre-screening through our platform are informational tools designed to help you understand your eligibility for rental properties. They do not guarantee approval by any landlord or property manager. Final rental decisions are made solely by property owners and their authorized representatives based on their own criteria." },
    ],
  },
  {
    heading: "User Responsibilities",
    blocks: [
    { kind: "p", text: "When using our services, you agree to:" },
    {
      kind: "ul",
      items: [
      "Provide accurate, current, and complete information during registration and pre-qualification.",
      "Keep your account credentials confidential and secure.",
      "Not misrepresent your identity, income, or any other information relevant to your rental application.",
      "Use the platform only for lawful purposes related to finding or renting residential property.",
      "Not interfere with or disrupt the operation of our website or services."
      ],
    },
    ],
  },
  {
    heading: "Pre-Qualification vs. Pre-Screening",
    blocks: [
    { kind: "p", text: "Our platform offers two levels of tenant preparation:" },
    { kind: "p", text: "Neither pre-qualification nor pre-screening guarantees rental approval." },
    {
      kind: "ul",
      items: [
      "Pre-Qualification: A basic assessment based on self-reported information including income, credit estimate, move timeline, and pet status. Pre-qualification is advisory and helps match you to suitable listings.",
      "Pre-Screening: A more comprehensive process that may include credit checks, background verification, income documentation, and rental history review. Pre-screening creates a reusable application package."
      ],
    },
    ],
  },
  {
    heading: "Limitation of Liability",
    blocks: [
    { kind: "p", text: "To the fullest extent permitted by law, Good Tenants EZ Living, its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, including but not limited to loss of rental opportunities, relocation costs, or decisions made based on information provided through our platform." },
    ],
  },
  {
    heading: "Third-Party Listings and Availability",
    blocks: [
    { kind: "p", text: "Property listings on our platform may be sourced from third parties, including MLS data and individual landlords. We do not own, manage, or control these properties. We make reasonable efforts to display accurate information, but we cannot guarantee the accuracy, completeness, or availability of any listing. Properties may be rented, withdrawn, or modified without notice." },
    ],
  },
  {
    heading: "Intellectual Property",
    blocks: [
    { kind: "p", text: "All content on this website, including text, graphics, logos, and software, is the property of Good Tenants EZ Living or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent." },
    ],
  },
  {
    heading: "Termination of Access",
    blocks: [
    { kind: "p", text: "We reserve the right to suspend or terminate your access to our platform at any time, with or without cause, if we believe you have violated these Terms of Service or engaged in conduct that may harm our platform, users, or reputation." },
    ],
  },
  {
    heading: "Governing Law",
    blocks: [
    { kind: "p", text: "These Terms of Service shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the appropriate courts located in California." },
    ],
  },
  {
    heading: "Changes to These Terms",
    blocks: [
    { kind: "p", text: "We may update these Terms of Service from time to time. Changes will be posted on this page with an updated effective date. Your continued use of our services after any changes constitutes acceptance of the revised terms." },
    ],
  },
] as const;
