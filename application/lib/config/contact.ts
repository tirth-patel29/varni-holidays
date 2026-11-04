/**
 * VARNI HOLIDAYS - Canonical Central Business Contact Configuration
 * 
 * STRICT BUSINESS POLICY:
 * This is the single source of truth for all customer-facing business contact details.
 * No component, template, or page should independently hardcode company contact info.
 */

export const COMPANY_CONTACT = {
  businessName: 'VARNI HOLIDAYS',
  legalName: 'Varni Holidays Pvt. Ltd.',
  tagline: 'Your Gateway to Joyful Holidays',

  phone: {
    display: '+91 63570 50505',
    tel: 'tel:+916357050505',
    cleanDigits: '6357050505',
    canonical: '+916357050505',
  },

  whatsapp: {
    display: '+91 63570 50505',
    canonical: '916357050505',
    url: 'https://wa.me/916357050505',
    buildUrl: (message?: string) =>
      message
        ? `https://wa.me/916357050505?text=${encodeURIComponent(message)}`
        : 'https://wa.me/916357050505',
  },

  email: {
    primary: 'varniinternational7@gmail.com',
    mailto: 'mailto:varniinternational7@gmail.com',
  },

  address: {
    full: '317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Vivekanand Wadi / Sardarganj, Anand, Gujarat 388120 (Near Panchal Hall)',
    building: '317, 3rd Floor, Narayan Empire',
    street: 'Anand - Vidyanagar Road, Vivekanand Wadi / Sardarganj',
    landmark: 'Near Panchal Hall',
    city: 'Anand',
    state: 'Gujarat',
    postalCode: '388120',
    country: 'India',
    countryCode: 'IN',
  },

  hours: {
    display: 'Mon - Sat: 9:30 AM - 8:00 PM',
    detailed: 'Monday to Saturday: 9:30 AM – 8:00 PM IST',
    sunday: 'Sunday: Closed / Prior Appointment Only',
  },

  gstin: '24AAACV1234P1Z5',
} as const;

export type CompanyContact = typeof COMPANY_CONTACT;

/**
 * Generates JSON-LD schema for LocalBusiness / TravelAgency SEO structured data
 */
export function getTravelAgencyJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: COMPANY_CONTACT.businessName,
    alternateName: COMPANY_CONTACT.legalName,
    description:
      'Bespoke holiday curation, domestic and international tour packages, flight consultation and visa assistance crafted with genuine Gujarat hospitality from Anand.',
    url: 'https://varni-holidays.vercel.app',
    telephone: COMPANY_CONTACT.phone.display,
    email: COMPANY_CONTACT.email.primary,
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        '317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Vivekanand Wadi / Sardarganj (Near Panchal Hall)',
      addressLocality: COMPANY_CONTACT.address.city,
      addressRegion: COMPANY_CONTACT.address.state,
      postalCode: COMPANY_CONTACT.address.postalCode,
      addressCountry: COMPANY_CONTACT.address.countryCode,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:30',
        closes: '20:00',
      },
    ],
    priceRange: '₹₹₹',
  };
}

