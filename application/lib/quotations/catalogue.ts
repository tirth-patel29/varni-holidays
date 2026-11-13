/**
 * VARNI HOLIDAYS - Quotation Catalogue Data Sources
 * Single source of truth for tour packages and hotel collections
 * available for quotation auto-population.
 * 
 * STRICT ARCHITECTURE RULE:
 * Quotations clone information from this catalogue.
 * Quotation pricing edits MUST NEVER alter these base catalogue records.
 */

export interface TourPackageCatalogueItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  durationNights: number;
  durationDays: number;
  overview: string;
  defaultPriceInr: number;
  currency: string;
  hotelTiersAvailable: string[];
  vehicleTypesAvailable: string[];
  inclusions: string[];
  exclusions: string[];
  itineraryDays: Array<{
    dayNumber: number;
    title: string;
    description: string;
    meals: string;
    stayDestination: string;
  }>;
}

export interface HotelCatalogueItem {
  id: string;
  name: string;
  location: string;
  tier: string;
  rating: number;
  description: string;
  roomTypes: Array<{
    name: string;
    basePricePerNightInr: number;
    description: string;
  }>;
  mealPlansAvailable: Array<{
    code: 'EP' | 'CP' | 'MAP' | 'AP';
    label: string;
    pricePerPersonInr: number;
  }>;
  checkInTime: string;
  checkOutTime: string;
  perks: string[];
}

export const TOUR_PACKAGES_CATALOGUE: TourPackageCatalogueItem[] = [
  {
    id: 'kerala-6n7d-winter',
    slug: 'kerala-6n7d-winter',
    title: 'Scenic Kerala & Backwaters Grand Tour',
    destination: 'Kerala (Munnar, Thekkady, Alleppey, Kovalam)',
    durationNights: 6,
    durationDays: 7,
    overview:
      'Immerse in the emerald beauty of God\'s Own Country. From misty tea plantations in Munnar to spice plantations in Thekkady, an authentic private houseboat cruise in Alleppey backwaters, and golden beaches of Kovalam.',
    defaultPriceInr: 24500,
    currency: 'INR',
    hotelTiersAvailable: ['Standard (3-Star)', 'Deluxe (3-Star Premium)', 'Super Deluxe (4-Star)', 'Luxury (5-Star Heritage)'],
    vehicleTypesAvailable: ['AC Sedan (Etios / Dzire)', 'AC SUV (Innova Crysta)', '12-Seater AC Tempo Traveller'],
    inclusions: [
      'Accommodation for 6 Nights on double/twin sharing basis',
      'Daily breakfast at all hotels (CPAI Plan)',
      'All meals (Breakfast, Lunch, Evening Snacks & Dinner) during Houseboat stay',
      'Private AC vehicle for all transfers, sightseeing, and intercity travel',
      'Toll taxes, parking fees, interstate driver allowances, and fuel charges',
      'Complimentary spice plantation guided tour in Thekkady',
      'Assistance on arrival and departure at Cochin / Trivandrum Airport',
    ],
    exclusions: [
      'Airfare or train fare to/from Kerala',
      'Monument entrance fees, national park safaris, and activity tickets',
      'Personal expenses such as laundry, phone calls, room service, and tips',
      'Any optional watersports or Ayurvedic spa therapies',
      'Travel insurance (available upon request as optional add-on)',
      '5% GST applicable as per government regulations',
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: 'Arrival Cochin & Scenic Transfer to Munnar (130 km / 4 hrs)',
        description:
          'Warm welcome by our chauffeur at Cochin Airport/Railway Station. Drive through cascading Cheeyappara and Valara waterfalls. Check in at your Munnar tea plantation resort. Evening free to stroll through local tea markets.',
        meals: 'Breakfast included upon arrival check-in',
        stayDestination: 'Munnar',
      },
      {
        dayNumber: 2,
        title: 'Full Day Munnar Exploration & Tea Museum',
        description:
          'Visit Eravikulam National Park (home to the endangered Nilgiri Tahr), Mattupetty Dam, Echo Point, Kundala Lake, and the Tata Tea Museum. Experience a panoramic photo stop amidst lush undulating tea gardens.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Munnar',
      },
      {
        dayNumber: 3,
        title: 'Munnar to Thekkady Spice Sanctuary (90 km / 3 hrs)',
        description:
          'Scenic drive through the Western Ghats to Thekkady (Periyar). Check in to hotel. Afternoon guided spice plantation walk discovering cardamom, pepper, and cinnamon. Optional evening Periyar Lake boat safari and Kalaripayattu martial arts show.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Thekkady',
      },
      {
        dayNumber: 4,
        title: 'Thekkady to Alleppey Backwaters & Private Houseboat Cruise (140 km / 4 hrs)',
        description:
          'Journey to the Venice of the East. Board your traditional Kerala Kettuvallam (Houseboat) at 12:00 PM. Cruise along serene palm-fringed canals, paddy fields, and lagoons. Relish freshly prepared traditional Kerala lunch and dinner onboard.',
        meals: 'Breakfast, Lunch, Evening Tea & Snacks, Dinner (Full Board on Houseboat)',
        stayDestination: 'Alleppey (Houseboat)',
      },
      {
        dayNumber: 5,
        title: 'Alleppey to Kovalam Beach via Trivandrum (160 km / 4.5 hrs)',
        description:
          'Disembark houseboat after breakfast. Drive to Kovalam beach town. Enroute visit the sacred Padmanabhaswamy Temple and Napier Museum in Trivandrum. Evening at leisure on Lighthouse Beach watching the Arabian Sea sunset.',
        meals: 'Breakfast on houseboat',
        stayDestination: 'Kovalam',
      },
      {
        dayNumber: 6,
        title: 'Excursion to Kanyakumari (Southern Tip of India) & Return to Kovalam',
        description:
          'Day trip to Kanyakumari (90 km). Visit Vivekananda Rock Memorial, Thiruvalluvar Statue via ferry, and Gandhi Memorial Mandapam. Witness the confluence of the Indian Ocean, Arabian Sea, and Bay of Bengal. Return to Kovalam for night stay.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Kovalam',
      },
      {
        dayNumber: 7,
        title: 'Kovalam to Trivandrum Airport Departure',
        description:
          'Enjoy a relaxing morning at the beach. Check out from the resort and transfer to Trivandrum Airport (TRV) with cherished memories of your joyful Varni Holidays vacation.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Departure',
      },
    ],
  },
  {
    id: 'kashmir-valley-5n6d',
    slug: 'kashmir-valley-5n6d',
    title: 'Kashmir Paradise: Shikaras & Snow Valleys',
    destination: 'Kashmir (Srinagar, Gulmarg, Pahalgam)',
    durationNights: 5,
    durationDays: 6,
    overview:
      'Experience the heaven on earth. Enjoy romantic Shikara rides on Dal Lake, stay in a heritage wooden houseboat, ascend snow-clad peaks on the Gulmarg Gondola, and wander the lush pine meadows of Pahalgam.',
    defaultPriceInr: 26800,
    currency: 'INR',
    hotelTiersAvailable: ['Deluxe (3-Star)', 'Super Deluxe (4-Star Premium)', 'Luxury Heritage (5-Star)'],
    vehicleTypesAvailable: ['AC Sedan (Dzire / Etios)', 'AC Innova', 'Tempo Traveller'],
    inclusions: [
      'Accommodation for 5 Nights (1 Night Houseboat + 2 Nights Srinagar + 2 Nights Pahalgam)',
      'Daily breakfast and dinner (MAPAI Plan) at all hotels & houseboat',
      '1 Hour complimentary Shikara ride on world-famous Dal Lake',
      'All airport transfers and sightseeing by dedicated private vehicle',
      'Toll tax, parking charges, and driver allowances',
      'Assistance on arrival and departure at Srinagar International Airport',
    ],
    exclusions: [
      'Gondola cable car tickets in Gulmarg (Phase 1 & Phase 2)',
      'Pony rides or local union cabs in Pahalgam (Aru, Chandanwari, Betaab Valley)',
      'Air tickets to/from Srinagar',
      'Personal laundry, telephone calls, heater charges, and tips',
      '5% GST applicable as per government regulations',
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: 'Arrival Srinagar & Heritage Houseboat Check-in',
        description:
          'Arrive at Srinagar Sheikh ul-Alam Airport. Transfer to luxury Dal Lake houseboat. Evening relaxing 1-hour sunset Shikara ride exploring floating gardens and vibrant water bazaars.',
        meals: 'Dinner on houseboat',
        stayDestination: 'Srinagar (Houseboat)',
      },
      {
        dayNumber: 2,
        title: 'Srinagar Mughal Gardens & City Heritage',
        description:
          'Visit Nishat Bagh (Garden of Pleasure), Shalimar Bagh (Abode of Love), and Chashme Shahi. Afternoon visit Shankaracharya Temple offering breathtaking aerial vistas of Srinagar valley and Dal Lake.',
        meals: 'Breakfast & Dinner',
        stayDestination: 'Srinagar',
      },
      {
        dayNumber: 3,
        title: 'Day Excursion to Gulmarg Meadow of Flowers (55 km / 2 hrs)',
        description:
          'Scenic drive to Gulmarg. Experience the world\'s highest cable car Gondola ride up to Apharwat peak snowline. Enjoy snow activities or panoramic mountain views. Return to Srinagar in the evening.',
        meals: 'Breakfast & Dinner',
        stayDestination: 'Srinagar',
      },
      {
        dayNumber: 4,
        title: 'Srinagar to Pahalgam Valley of Shepherds (95 km / 3 hrs)',
        description:
          'Drive to picturesque Pahalgam along the Lidder River. Enroute visit saffron fields in Pampore and Avantipur ruins. Check in to riverside resort. Evening free to stroll in the cedar forests.',
        meals: 'Breakfast & Dinner',
        stayDestination: 'Pahalgam',
      },
      {
        dayNumber: 5,
        title: 'Pahalgam Betaab Valley & Baisaran Mini Switzerland',
        description:
          'Explore Betaab Valley and Aru Valley. Optional pony trek to Baisaran meadow surrounded by dense deodar pine woods. Relax beside the crystal waters of Lidder River.',
        meals: 'Breakfast & Dinner',
        stayDestination: 'Pahalgam',
      },
      {
        dayNumber: 6,
        title: 'Pahalgam to Srinagar Airport Departure',
        description:
          'After breakfast, drive to Srinagar Airport for your onward flight, carrying eternal memories of Kashmir with Varni Holidays.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Departure',
      },
    ],
  },
  {
    id: 'rajasthan-royal-7n8d',
    slug: 'rajasthan-royal-7n8d',
    title: 'Royal Rajasthan: Forts, Palaces & Sand Dunes',
    destination: 'Rajasthan (Jaipur, Jodhpur, Udaipur, Jaisalmer)',
    durationNights: 7,
    durationDays: 8,
    overview:
      'Step into the majestic land of kings. Experience the Pink City of Jaipur, golden Thar desert camel safaris in Jaisalmer, Sun City forts in Jodhpur, and the romantic lake palaces of Udaipur.',
    defaultPriceInr: 32500,
    currency: 'INR',
    hotelTiersAvailable: ['Deluxe Heritage (3-Star)', 'Super Deluxe Haveli (4-Star)', 'Royal Palace Luxury (5-Star)'],
    vehicleTypesAvailable: ['AC Sedan', 'AC Innova Crysta', 'AC Tempo Traveller'],
    inclusions: [
      'Accommodation for 7 Nights in heritage havelis, luxury palace hotels, and desert camp',
      'Daily breakfast at all hotels',
      'Buffet dinner with Rajasthani folk dance & music at Jaisalmer Desert Camp',
      'Camel ride and desert safari on Sam Sand Dunes',
      'Private AC vehicle for all transfers, sightseeing, and intercity journeys',
      'All toll taxes, parking fees, and driver allowances',
    ],
    exclusions: [
      'Monument entrance tickets and camera fees',
      'Jeep safari over dunes (optional add-on)',
      'Boat cruise on Lake Pichola (Udaipur)',
      'Air / train tickets to Jaipur / from Udaipur',
      'Personal expenses and tips',
      '5% GST applicable',
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: 'Arrival in Jaipur - The Pink City',
        description: 'Meet and greet at Jaipur Airport/Railway Station. Transfer to heritage hotel. Evening visit to Birla Temple and Chokhi Dhani ethnic village resort.',
        meals: 'Breakfast included next morning',
        stayDestination: 'Jaipur',
      },
      {
        dayNumber: 2,
        title: 'Full Day Jaipur Royalty Tour',
        description: 'Visit Amber Fort with optional elephant/jeep ride, photo stop at Jal Mahal, visit City Palace, Jantar Mantar observatory, and the iconic Hawa Mahal.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Jaipur',
      },
      {
        dayNumber: 3,
        title: 'Jaipur to Jodhpur (330 km / 6 hrs)',
        description: 'Drive across Rajasthan to the Blue City Jodhpur. Check in to hotel. Evening visit to the vibrant Clock Tower bazaar and local handicraft markets.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Jodhpur',
      },
      {
        dayNumber: 4,
        title: 'Jodhpur to Jaisalmer Golden City (280 km / 5 hrs)',
        description: 'Morning visit to the mighty Mehrangarh Fort and Jaswant Thada marble cenotaph. Afternoon drive across the Thar desert to Jaisalmer. Check in to desert camp.',
        meals: 'Breakfast & Traditional Rajasthani Camp Dinner',
        stayDestination: 'Jaisalmer (Desert Camp)',
      },
      {
        dayNumber: 5,
        title: 'Jaisalmer Golden Fort & Sam Sand Dunes Sunset',
        description: 'Visit the living Golden Fort (Sonar Qila), Patwon ki Haveli, and Gadisar Lake. Evening sunset camel safari over undulating Sam sand dunes followed by campfire folk dance.',
        meals: 'Breakfast & Dinner',
        stayDestination: 'Jaisalmer',
      },
      {
        dayNumber: 6,
        title: 'Jaisalmer to Udaipur via Ranakpur (490 km / 8 hrs)',
        description: 'Drive towards Udaipur, City of Lakes. Enroute visit the renowned 15th-century marble Jain Temples of Ranakpur with 1444 intricately carved pillars. Check in to Udaipur hotel.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Udaipur',
      },
      {
        dayNumber: 7,
        title: 'Udaipur Royal City Tour & Lake Pichola',
        description: 'Tour the sprawling City Palace complex overlooking Lake Pichola, Jagdish Temple, Saheliyon Ki Bari, and enjoy an evening sunset boat ride around Taj Lake Palace.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Udaipur',
      },
      {
        dayNumber: 8,
        title: 'Udaipur Airport Departure',
        description: 'Check out and transfer to Udaipur Maharana Pratap Airport (UDR) for flight back home.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Departure',
      },
    ],
  },
  {
    id: 'dubai-5n6d',
    slug: 'dubai-5n6d',
    title: 'Dubai Extravaganza: Desert Safari, Marina & Burj Khalifa',
    destination: 'Dubai, United Arab Emirates',
    durationNights: 5,
    durationDays: 6,
    overview:
      'Experience the futuristic wonder of Dubai. Features 124th floor Burj Khalifa observation deck, 4x4 dune bashing desert safari with BBQ dinner, luxury Dubai Marina dhow cruise, and Dubai Frame.',
    defaultPriceInr: 45000,
    currency: 'INR',
    hotelTiersAvailable: ['4-Star City Center', '5-Star Luxury Downtown', '5-Star Beachfront Marina'],
    vehicleTypesAvailable: ['Private AC Sedan', 'Private AC Van', 'Sharing Luxury Coach'],
    inclusions: [
      'Accommodation for 5 Nights at 4-Star / 5-Star Dubai hotel',
      'Daily international buffet breakfast',
      'Burj Khalifa 124th + 125th Floor At The Top non-prime admission ticket',
      '4x4 Desert Safari with dune bashing, camel rides, belly dance, and BBQ buffet dinner',
      'Dubai Marina Dhow Cruise with international dinner & live Tanoura dance show',
      'Half-day Dubai city tour with Dubai Frame tickets included',
      'Roundtrip airport transfers from Dubai International Airport (DXB)',
    ],
    exclusions: [
      'UAE Tourist Visa & OTB charges (available through our Visa desk)',
      'Tourism Dirham Fee payable directly at hotel check-in',
      'International airfares',
      'Lunches and meals not specified',
      '5% GST and 5% TCS as per RBI regulations',
    ],
    itineraryDays: [
      {
        dayNumber: 1,
        title: 'Arrival in Dubai & Marina Dhow Cruise Dinner',
        description: 'Arrive at DXB Airport. Luxury transfer to hotel. Evening pickup for Dubai Marina Dhow Cruise with dinner gliding past illuminated skyscrapers.',
        meals: 'Dinner on cruise',
        stayDestination: 'Dubai',
      },
      {
        dayNumber: 2,
        title: 'Half Day Dubai City Tour & Dubai Frame',
        description: 'Explore Dubai Creek, Al Fahidi Historical Neighbourhood, Jumeirah Mosque, Burj Al Arab photo stop, and visit the architectural marvel Dubai Frame.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Dubai',
      },
      {
        dayNumber: 3,
        title: 'Dubai Mall & Burj Khalifa 124th Floor Observatory',
        description: 'Visit the world-famous Dubai Mall. Ascend the world\'s tallest skyscraper Burj Khalifa to the 124th floor observation deck for 360-degree views. Watch the dancing fountain show.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Dubai',
      },
      {
        dayNumber: 4,
        title: 'Thrilling 4x4 Desert Safari with BBQ Dinner',
        description: 'Morning at leisure. Afternoon 4x4 Land Cruiser desert safari with red dune bashing, sandboarding, sunset photography, henna painting, and BBQ banquet.',
        meals: 'Breakfast & BBQ Dinner',
        stayDestination: 'Dubai',
      },
      {
        dayNumber: 5,
        title: 'Day at Leisure or Optional Abu Dhabi Grand Mosque Excursion',
        description: 'Free day for shopping at Gold Souk and Meena Bazaar, or optional full-day excursion to Abu Dhabi Sheikh Zayed Grand Mosque and Louvre Museum.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Dubai',
      },
      {
        dayNumber: 6,
        title: 'Departure from Dubai',
        description: 'Check out from hotel and private transfer to DXB Airport for your return flight.',
        meals: 'Breakfast at hotel',
        stayDestination: 'Departure',
      },
    ],
  },
];

export const HOTELS_CATALOGUE: HotelCatalogueItem[] = [
  {
    id: 'kerala-vembanad-resort',
    name: 'Vembanad Lakefront Luxury Retreat',
    location: 'Kumarakom / Alleppey, Kerala',
    tier: '5-Star Experiential Resort',
    rating: 4.9,
    description:
      'Sprawling over 18 acres of landscaped gardens along the tranquil shores of Lake Vembanad. Features private plunge pool villas, an Ayurvedic wellness sanctuary, and world-class culinary experiences.',
    roomTypes: [
      { name: 'Heritage Lake View Villa', basePricePerNightInr: 11500, description: 'Kerala architecture villa with outdoor veranda facing the serene lake waters.' },
      { name: 'Private Pool Pavilion', basePricePerNightInr: 17500, description: 'Exclusive secluded villa with personal plunge pool and open-air rain shower.' },
      { name: 'Superior Garden Cottage', basePricePerNightInr: 8500, description: 'Charming air-conditioned cottage nestled within tropical flora and spice plants.' },
    ],
    mealPlansAvailable: [
      { code: 'EP', label: 'Room Only (European Plan)', pricePerPersonInr: 0 },
      { code: 'CP', label: 'Bed & Breakfast (Continental Plan)', pricePerPersonInr: 950 },
      { code: 'MAP', label: 'Breakfast & Dinner (Modified American Plan)', pricePerPersonInr: 2200 },
      { code: 'AP', label: 'All Meals - Breakfast, Lunch, Dinner (American Plan)', pricePerPersonInr: 3400 },
    ],
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    perks: ['Complimentary sunset Shikara boat cruise', 'Traditional welcome tender coconut drink', '15% discount on Ayurvedic spa treatments', 'Free high-speed Wi-Fi throughout resort'],
  },
  {
    id: 'munnar-misty-cloud-lodge',
    name: 'Misty Cloud Plantation Hideaway',
    location: 'Munnar Hills, Kerala',
    tier: '4-Star Boutique Tea Lodge',
    rating: 4.8,
    description:
      'Perched at 5,400 feet amidst rolling organic tea plantations. Offers breathtaking sunrise vistas over the mist-covered Anamudi peaks and pure mountain tranquility.',
    roomTypes: [
      { name: 'Valley View Deluxe Room', basePricePerNightInr: 6800, description: 'Spacious room with private glass balcony offering 180-degree valley views.' },
      { name: 'Tea Plantation Suite', basePricePerNightInr: 9500, description: 'Expansive suite with separate living area, fireplace, and panoramic mountain windows.' },
    ],
    mealPlansAvailable: [
      { code: 'EP', label: 'Room Only', pricePerPersonInr: 0 },
      { code: 'CP', label: 'Complimentary Tea Valley Breakfast', pricePerPersonInr: 650 },
      { code: 'MAP', label: 'Breakfast & Chef Dinner Table', pricePerPersonInr: 1600 },
      { code: 'AP', label: 'Full Board All Meals', pricePerPersonInr: 2500 },
    ],
    checkInTime: '01:00 PM',
    checkOutTime: '11:00 AM',
    perks: ['Daily guided tea garden nature walks', 'Evening campfire with acoustic music', 'High-speed Wi-Fi', '24-hour hot water and room service'],
  },
  {
    id: 'udaipur-royal-heritage-palace',
    name: 'Royal Heritage Haveli & Palace',
    location: 'Udaipur, Rajasthan',
    tier: '5-Star Heritage Palace',
    rating: 4.9,
    description:
      'A restored 18th-century noble residence boasting jharokhas, marble courtyards, fountain gardens, and unforgettable views of Lake Pichola and the City Palace.',
    roomTypes: [
      { name: 'Royal Heritage Chamber', basePricePerNightInr: 13500, description: 'Elegantly appointed royal room with frescoed ceilings and antique furniture.' },
      { name: 'Lake View Maharaja Suite', basePricePerNightInr: 24000, description: 'Lavish suite featuring a private balcony directly overlooking Lake Pichola.' },
    ],
    mealPlansAvailable: [
      { code: 'EP', label: 'Room Only', pricePerPersonInr: 0 },
      { code: 'CP', label: 'Royal Buffet Breakfast', pricePerPersonInr: 1200 },
      { code: 'MAP', label: 'Breakfast & Palace Courtyard Dinner', pricePerPersonInr: 2800 },
      { code: 'AP', label: 'All Meals Palace Banquet', pricePerPersonInr: 4200 },
    ],
    checkInTime: '02:00 PM',
    checkOutTime: '12:00 PM',
    perks: ['Evening Rajasthani puppet and folk dance performance', 'Pure Vegetarian and Jain culinary section', 'Infinity courtyard pool access', 'Luggage assistance and valet parking'],
  },
  {
    id: 'dubai-marina-waterfront-tower',
    name: 'Marina Waterfront Tower & Suites',
    location: 'Dubai Marina, UAE',
    tier: '5-Star Contemporary Luxury',
    rating: 4.8,
    description:
      'Sophisticated luxury tower located on the vibrant Dubai Marina Promenade. Minutes from JBR The Beach, Dubai Marina Mall, and top international dining venues.',
    roomTypes: [
      { name: 'Deluxe Marina View Room', basePricePerNightInr: 14500, description: 'Modern king room with floor-to-ceiling windows overlooking mega yachts in Marina.' },
      { name: 'One-Bedroom Marina Suite', basePricePerNightInr: 21000, description: 'Full apartment-style suite with equipped kitchenette, lounge, and two balconies.' },
    ],
    mealPlansAvailable: [
      { code: 'EP', label: 'Room Only', pricePerPersonInr: 0 },
      { code: 'CP', label: 'International Buffet Breakfast', pricePerPersonInr: 1400 },
      { code: 'MAP', label: 'Half Board (Breakfast + Lunch or Dinner)', pricePerPersonInr: 3200 },
    ],
    checkInTime: '03:00 PM',
    checkOutTime: '12:00 PM',
    perks: ['Direct access to Dubai Marina promenade', 'Heated rooftop infinity pool overlooking Palm Jumeirah', '24/7 fitness center and sauna', 'Complimentary shuttle to JBR Beach and Mall'],
  },
  {
    id: 'bali-ayung-river-pool-villa',
    name: 'Ayung River Private Pool Villa',
    location: 'Ubud, Bali, Indonesia',
    tier: 'Luxury Pool Villa Resort',
    rating: 4.9,
    description:
      'Sanctuary nestled high above the holy Ayung River valley. Each villa features a private infinity pool, authentic Balinese thatched roof, and deep natural serenity.',
    roomTypes: [
      { name: 'One-Bedroom Riverfront Pool Villa', basePricePerNightInr: 16800, description: 'Enclosed private sanctuary with personal plunge pool overlooking rainforest canopy.' },
      { name: 'Valley Sanctuary Royal Villa', basePricePerNightInr: 26000, description: 'Expansive two-level villa with private sun deck, jacuzzi, and butler service.' },
    ],
    mealPlansAvailable: [
      { code: 'EP', label: 'Room Only', pricePerPersonInr: 0 },
      { code: 'CP', label: 'Daily Gourmet Balinese Breakfast (Floating Breakfast option)', pricePerPersonInr: 1100 },
      { code: 'MAP', label: 'Breakfast & 3-Course Riverside Dinner', pricePerPersonInr: 2600 },
      { code: 'AP', label: 'Full Board Culinary Experience', pricePerPersonInr: 3900 },
    ],
    checkInTime: '02:00 PM',
    checkOutTime: '12:00 PM',
    perks: ['Complimentary floating breakfast setup', 'Daily afternoon high tea with Balinese cakes', 'Hourly shuttle to Ubud Royal Palace center', 'Yoga pavilion and riverside meditation decks'],
  },
];

export function findPackageBySlug(slug: string): TourPackageCatalogueItem | undefined {
  return TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === slug || p.id === slug);
}

export function findHotelById(id: string): HotelCatalogueItem | undefined {
  return HOTELS_CATALOGUE.find((h) => h.id === id);
}

