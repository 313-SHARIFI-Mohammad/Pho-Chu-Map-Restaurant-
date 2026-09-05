import LegalLayout from "../components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Good To Know"
      title="Terms & Conditions"
      updated="September 5, 2026"
      sections={[
        {
          title: "1. Acceptance of Terms",
          content:
            "By accessing the Pho Chu Map website or placing an order, you agree to these Terms & Conditions. If you do not agree, please do not use our website or services.",
        },
        {
          title: "2. Orders",
          content: [
            "All orders are subject to confirmation. We may decline or cancel an order in cases such as suspected fraud, inaccurate information, or operational constraints.",
            "Prices displayed include GST and are in Australian dollars (AUD).",
            "A delivery fee applies to delivery orders and is shown clearly at checkout.",
            "Payment is collected at the point of order. Card payments are processed by our payment provider and are not stored by us.",
          ],
        },
        {
          title: "3. Reservations",
          content:
            "Table reservations are confirmed subject to availability. If you are running more than 15 minutes late for a reservation, please call us so we can hold your table, otherwise it may be released.",
        },
        {
          title: "4. Delivery",
          content: [
            "We aim to deliver within the estimated time, but times may vary due to traffic, weather, or order volume.",
            "Please check your order on arrival and report any issues immediately.",
            "Allergy and dietary information can be requested - please advise us of any allergies when placing your order.",
            "Our delivery service covers a specific area around Parafield Gardens. If your address is outside this area, we may not be able to fulfil your order.",
          ],
        },
        {
          title: "5. Menu & Pricing",
          content:
            "Menu items, pricing, and availability may change without notice. We make every effort to keep menu information accurate and up to date. Occasionally, a specific dish may be unavailable or substituted if an ingredient is not available.",
        },
        {
          title: "6. Allergens & Dietary Needs",
          content:
            "Our kitchen handles common allergens including gluten, nuts, shellfish, egg, and soy. While we take care to minimise cross-contact, we cannot guarantee that any dish is completely free of allergens. Please inform us of your dietary needs before ordering.",
        },
        {
          title: "7. Limitation of Liability",
          content:
            "To the maximum extent permitted by law, Pho Chu Map is not liable for indirect or consequential loss arising from use of this website, delay, or failure of delivery that is outside our reasonable control. Nothing in these terms limits your rights under Australian consumer law.",
        },
        {
          title: "8. Website Use",
          content:
            "You agree not to misuse this website, attempt to interfere with its operation, or use its content for unauthorised commercial purposes. All content is the property of Pho Chu Map and may not be reproduced without permission.",
        },
        {
          title: "9. Changes to These Terms",
          content:
            "We may update these Terms & Conditions from time to time. Changes take effect when published on this page. Continued use of our website after changes means you accept the updated terms.",
        },
        {
          title: "10. Contact Us",
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