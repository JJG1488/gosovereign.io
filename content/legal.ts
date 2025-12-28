// Legal content for Terms of Service and Privacy Policy pages

export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  effectiveDate: "January 1, 2025",
  lastUpdated: "December 2024",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using GoSovereign's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`,
    },
    {
      title: "2. Description of Service",
      content: `GoSovereign provides a platform for creating and deploying e-commerce stores. Our services include store configuration, hosting, payment processing integration, and related tools for online business management.`,
    },
    {
      title: "3. User Accounts",
      content: `You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.`,
    },
    {
      title: "4. Payment Terms",
      content: `Our services are offered at various pricing tiers. All payments are processed securely through Stripe. Prices are in USD unless otherwise stated. Refunds are handled on a case-by-case basis within 30 days of purchase.`,
    },
    {
      title: "5. Store Owner Responsibilities",
      content: `As a store owner, you are responsible for the content, products, and services you offer through your store. You must comply with all applicable laws and regulations, including consumer protection, privacy, and e-commerce laws in your jurisdiction.`,
    },
    {
      title: "6. Prohibited Uses",
      content: `You may not use our services to sell illegal products, engage in fraudulent activities, infringe on intellectual property rights, distribute malware, or violate any applicable laws. We reserve the right to terminate accounts that violate these terms.`,
    },
    {
      title: "7. Intellectual Property",
      content: `GoSovereign retains ownership of the platform, templates, and related intellectual property. You retain ownership of your store content, branding, and products. By using our templates, you receive a license to use them for your store.`,
    },
    {
      title: "8. Data and Privacy",
      content: `We collect and process data as described in our Privacy Policy. You are responsible for obtaining necessary consents from your customers for data collection and processing activities in your store.`,
    },
    {
      title: "9. Service Availability",
      content: `We strive to maintain high availability of our services but do not guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect service availability.`,
    },
    {
      title: "10. Limitation of Liability",
      content: `GoSovereign is not liable for indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability is limited to the amount you paid for our services in the 12 months preceding the claim.`,
    },
    {
      title: "11. Indemnification",
      content: `You agree to indemnify and hold GoSovereign harmless from any claims, damages, or expenses arising from your use of our services, your store content, or your violation of these terms.`,
    },
    {
      title: "12. Termination",
      content: `Either party may terminate this agreement at any time. Upon termination, your access to the platform will cease. You may download your store data before termination. We may terminate accounts that violate our terms immediately.`,
    },
    {
      title: "13. Changes to Terms",
      content: `We may update these terms from time to time. We will notify you of material changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the new terms.`,
    },
    {
      title: "14. Contact Information",
      content: `For questions about these terms, please contact us at support@gosovereign.io.`,
    },
  ],
};

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  effectiveDate: "January 1, 2025",
  lastUpdated: "December 2024",
  sections: [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly (name, email, payment information), information collected automatically (IP address, browser type, usage data), and information from third parties (payment processors, analytics services).`,
    },
    {
      title: "2. How We Use Your Information",
      content: `We use your information to provide and improve our services, process payments, communicate with you, ensure security, and comply with legal obligations. We do not sell your personal information to third parties.`,
    },
    {
      title: "3. Information Sharing",
      content: `We share information with service providers (Stripe, Vercel, Supabase) who help us operate our platform. We may also share information when required by law or to protect our rights and safety.`,
    },
    {
      title: "4. Data Storage and Security",
      content: `Your data is stored securely using industry-standard encryption. We use Supabase for database storage with row-level security. Payment information is handled directly by Stripe and never stored on our servers.`,
    },
    {
      title: "5. Cookies and Tracking",
      content: `We use essential cookies for authentication and site functionality. We may use analytics cookies to understand usage patterns. You can manage cookie preferences in your browser settings.`,
    },
    {
      title: "6. Third-Party Services",
      content: `Our platform integrates with third-party services including Stripe (payments), Vercel (hosting), Supabase (database), and Resend (email). Each service has its own privacy policy governing their data practices.`,
    },
    {
      title: "7. Your Rights",
      content: `You have the right to access, correct, or delete your personal information. You can export your data or request account deletion by contacting us. We will respond to requests within 30 days.`,
    },
    {
      title: "8. Data Retention",
      content: `We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance or legitimate business purposes.`,
    },
    {
      title: "9. Children's Privacy",
      content: `Our services are not intended for children under 13. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.`,
    },
    {
      title: "10. International Users",
      content: `Our services are operated from the United States. If you access our services from outside the US, your information may be transferred to and processed in the US or other countries.`,
    },
    {
      title: "11. Changes to Policy",
      content: `We may update this privacy policy from time to time. We will notify you of material changes via email or through our platform. Your continued use constitutes acceptance of the updated policy.`,
    },
    {
      title: "12. Contact Us",
      content: `For privacy-related questions or to exercise your rights, contact us at privacy@gosovereign.io.`,
    },
  ],
};
