import LegalLayout from "../components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Your Privacy"
      title="Privacy Policy"
      updated="September 5, 2026"
      sections={[
        {
          title: "1. Introduction",
          content:
            "Pho Chu Map (\u201cwe\u201d, \u201cus\u201d) respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our website or place an order.",
        },
        {
          title: "2. Information We Collect",
          content: [
            "Details you provide when placing a delivery order, such as your name, phone number, email, and delivery address.",
            "Details you provide when making a table reservation, such as your name, phone number, and the number of guests.",
            "Payment method preference. We do not store or process card numbers - card payments are handled by our payment provider at checkout.",
            "Basic technical data such as your browser type and device, used to keep the website secure and improve performance.",
          ],
        },
        {
          title: "3. How We Use Your Information",
          content: [
            "To prepare, deliver, and confirm your orders.",
            "To process and confirm your table reservations.",
            "To contact you about your order or reservation if needed.",
            "To respond to your enquiries and provide customer support.",
            "To meet legal and regulatory obligations.",
          ],
        },
        {
          title: "4. Sharing Your Information",
          content:
            "We do not sell, trade, or rent your personal information to third parties. We may share your details with delivery partners solely for the purpose of delivering your order, and with payment providers to process your chosen payment method. These parties are required to protect your information and use it only for the service we provide to you.",
        },
        {
          title: "5. Data Retention",
          content:
            "We keep order and reservation records only as long as needed to provide our services, handle enquiries, and meet accounting and legal requirements. If you would like us to delete your personal information, contact us and we will action it where we are able to.",
        },
        {
          title: "6. Cookies",
          content:
            "Our website may use small data files (cookies) and browser storage to remember your cart and preferences so your experience is smoother. You can disable cookies in your browser settings, though some features may not work as intended.",
        },
        {
          title: "7. Your Rights",
          content:
            "Under the Australian Privacy Act 1988 (Cth), you may request access to, or correction of, the personal information we hold about you. Contact us using the details below and we will respond within a reasonable time.",
        },
        {
          title: "8. Contact Us",
          content: [
            "Pho Chu Map",
            "6/32 Catalina Ave, Parafield Gardens SA 5107, Australia",
            "Phone: +61 8 8285 5353",
            "Email: info@phochumap.com.au",
          ],
        },
      ]}
    />
  );
}