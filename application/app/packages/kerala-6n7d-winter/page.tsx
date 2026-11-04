import React from "react";
import Link from "next/link";
import DynamicPricingCalculator from "@/components/DynamicPricingCalculator";

export default function KeralaPackageDetailPage() {
  const itineraryDays = [
    {
      day: "Day 1",
      title: "Arrival in Cochin & Scenic Drive to Munnar",
      route: "Cochin to Munnar (130 Kms / approx. 4 hrs)",
      desc: "Welcome to God's Own Country! On arrival at Cochin Airport (COK) or Ernakulam Railway Station, meet your professional chauffeur. Board your private sanitized vehicle and begin the picturesque hill journey towards Munnar. En route, stop at the mesmerizing Cheeyappara and Valara Waterfalls amidst rolling rubber and spice plantations. Arrive in Munnar, check in at your selected resort, and enjoy a restful evening breathing the refreshing mountain air.",
      stay: "Munnar",
      meals: "Welcome Drink & Breakfast (CPAI)",
    },
    {
      day: "Day 2",
      title: "Munnar Tea Hills & Eravikulam Wildlife Exploration",
      route: "Munnar Local Sightseeing",
      desc: "After breakfast, depart for full-day Munnar sightseeing. Visit Eravikulam National Park (Rajamalai), home to the endangered Nilgiri Tahr mountain goat. Proceed to the scenic Mattupetty Dam for speedboating against backdrop hills, test your voice at Echo Point, and take stunning photographs amidst Kundala Lake tea estates. Later, visit the Tata Tea Museum and Floriculture Rose Garden. Return to resort for overnight stay.",
      stay: "Munnar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 3",
      title: "Munnar to Thekkady & Periyar Spice Trails",
      route: "Munnar to Thekkady (90 Kms / approx. 3 hrs)",
      desc: "Enjoy breakfast overlooking misty peaks, check out and drive to Thekkady (Periyar). Arrive and check into your resort. In the afternoon, embark on an escorted Spice Plantation Walk to discover cardamom, cinnamon, pepper, and cloves. Optional evening activities include boating on Periyar Lake inside the wildlife sanctuary to spot wild elephants, or witnessing traditional Kalaripayattu martial arts and Kathakali cultural shows.",
      stay: "Thekkady",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 4",
      title: "Thekkady to Alleppey Venetian Backwaters",
      route: "Thekkady to Alleppey (140 Kms / approx. 4 hrs)",
      desc: "After breakfast, descend toward Alleppey, the famed Venice of the East. Check in at your backwater resort (or private luxury Houseboat if selected). Cruise along emerald palm-fringed canals, observe village life along the banks, and witness serene backwater paddy fields. Enjoy sunset reflecting across Vembanad Lake. Traditional Kerala evening dinner served.",
      stay: "Alleppey",
      meals: "Breakfast (or Full Board if Houseboat chosen)",
    },
    {
      day: "Day 5",
      title: "Alleppey to Kovalam & Poovar Island Coastal Excursion",
      route: "Alleppey to Kovalam / Poovar (160 Kms / approx. 4.5 hrs)",
      desc: "After breakfast, drive south to Kovalam, Kerala's premier seaside sanctuary. Check into your beachside resort. Later, visit Poovar Island where tranquil backwaters, rivers, and the Arabian Sea converge into golden sandbanks (boat cruise available). Relax along the crescent curves of Lighthouse Beach and Hawah Beach. Enjoy an evening stroll along seaside promenade cafes.",
      stay: "Kovalam / Poovar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 6",
      title: "Trivandrum Cultural Heritage & Padmanabhaswamy Temple",
      route: "Kovalam / Trivandrum Excursion",
      desc: "Morning dedicated to Trivandrum cultural exploration. Seek sacred blessings at the historic Shree Padmanabhaswamy Temple (strict traditional dress code applies). Visit the 19th-century Napier Museum, Sri Chitra Art Gallery, and Kuthiramalika Palace. Afternoon at leisure on Kovalam beach with optional rejuvenating Ayurvedic herbal therapies. Overnight in Kovalam.",
      stay: "Kovalam",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 7",
      title: "Departure from Trivandrum / Cochin Airport",
      route: "Transfer to Airport / Railway Station",
      desc: "Savor your final breakfast overlooking the Arabian Sea. Depending on your flight schedule, check out from the resort and transfer with your private chauffeur to Trivandrum International Airport (TRV) or Cochin Airport (COK). Board your flight home with joyful memories of your Kerala journey with Varni Holidays.",
      stay: "Departure",
      meals: "Breakfast",
    },
  ];

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-6">
      
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/packages" className="hover:text-primary transition-colors">Packages</Link>
        <span>/</span>
        <span className="font-bold text-primary">Kerala 6N/7D Grand Tour</span>
      </div>

      {/* Hero Showcase Card */}
      <section className="relative bg-surface-container p-4 md:p-6 rounded-[2.5rem] shadow-clay-hero border border-white/80 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Hero Artwork Frame */}
          <div className="lg:col-span-8 relative min-h-[460px] md:min-h-[520px] rounded-[2rem] overflow-hidden shadow-clay-card flex flex-col justify-between p-6 md:p-10 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center -z-10"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/45 to-transparent -z-10" />

            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-primary/75 backdrop-blur-md text-tertiary-fixed text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  Verified B2B Winter Rates
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/90 text-primary text-xs font-bold">
                  6 Nights / 7 Days
                </span>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-surface-cream-subtle/90 text-primary text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                Private Vehicle at Disposal
              </span>
            </div>

            {/* Bottom Title & Specs */}
            <div className="mt-auto pt-16">
              <span className="text-xs uppercase tracking-widest text-gold-light font-bold block mb-1">
                South India Flagship Itinerary • Ex-Cochin
              </span>
              <h1 className="font-headline text-3xl sm:text-5xl font-bold leading-tight mb-3">
                Scenic Kerala & Backwaters Grand Tour
              </h1>
              <p className="text-xs sm:text-sm text-surface-cream-subtle max-w-xl mb-6 leading-relaxed">
                Munnar misty tea plantations, Thekkady wildlife sanctuary, Alleppey backwaters, and Kovalam sun-kissed beaches with authentic Gujarati meal guidance.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#calculator"
                  className="px-6 py-3.5 rounded-full bg-gold-deep text-white text-xs font-bold clay-pill-button flex items-center gap-2 hover:brightness-110"
                >
                  <span>Configure Live Price</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </a>
                <a
                  href="https://wa.me/919898000000?text=Hi%20Varni%20Holidays,%20please%20send%20Kerala%206N7D%20Itinerary%20PDF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold hover:bg-white/30 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Request PDF Brochure</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column Highlights Widgets */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            
            {/* Climate & Best Time Widget */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] shadow-clay-card border border-white/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Climate & Seasonality
                </span>
                <span className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold-deep">
                  <span className="material-symbols-outlined text-[18px]">sunny</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-headline text-2xl font-bold text-primary">21°C - 27°C</span>
                <span className="text-xs text-secondary font-semibold">Winter Peak Season</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Rates valid 1 Oct 2026 to 31 Mar 2027. Peak surcharge applies 20 Dec 2026 to 10 Jan 2027.
              </p>
            </div>

            {/* Quick Price Matrix Glance */}
            <div className="bg-surface-cream-subtle p-5 rounded-[2rem] shadow-clay-inset space-y-3">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                Source Rack Rate Summary
              </span>
              <div className="space-y-1.5 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>2 Pax (AC Sedan):</span>
                  <span className="font-bold text-primary">From ₹27,400 / person</span>
                </div>
                <div className="flex justify-between">
                  <span>4 Pax (Innova Crysta):</span>
                  <span className="font-bold text-primary">From ₹24,500 / person</span>
                </div>
                <div className="flex justify-between">
                  <span>6 Pax (Innova Crysta):</span>
                  <span className="font-bold text-primary">From ₹20,700 / person</span>
                </div>
                <div className="flex justify-between">
                  <span>6 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">From ₹21,400 / person</span>
                </div>
                <div className="flex justify-between">
                  <span>8 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">From ₹19,400 / person</span>
                </div>
                <div className="flex justify-between">
                  <span>10 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">From ₹18,200 / person</span>
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant block pt-1 border-t border-surface-sand-tint">
                Includes AC vehicle 8am to 8pm, tolls, parking & taxes.
              </span>
            </div>

            {/* Gujarati Hospitality Trust Badge */}
            <div className="bg-surface-container-lowest p-4 rounded-[2rem] shadow-clay-card flex items-center gap-3 border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-gold-deep flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
              </div>
              <div>
                <span className="text-xs font-bold text-primary block">Jain & Swaminarayan Food</span>
                <span className="text-[11px] text-on-surface-variant">Coordinated at all hotel stops</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Highlights Bento */}
      <section className="mb-12">
        <h3 className="font-headline text-2xl font-bold text-primary mb-6">
          Curated Tour Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "landscape",
              title: "Munnar Tea Trails",
              desc: "Visit Mattupetty Dam, Echo Point, Kundala Lake, and Eravikulam National Park.",
            },
            {
              icon: "forest",
              title: "Periyar Wildlife",
              desc: "Spice plantation walk in Thekkady with optional Periyar boat safari and martial arts.",
            },
            {
              icon: "directions_boat",
              title: "Alleppey Backwaters",
              desc: "Tranquil lagoon cruise past coconut groves and village canals with traditional meals.",
            },
            {
              icon: "beach_access",
              title: "Kovalam & Poovar",
              desc: "Golden sand beaches, Poovar Island sea confluence, and Padmanabhaswamy temple darshan.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest p-5 rounded-3xl shadow-clay-card border border-white/80"
            >
              <div className="w-10 h-10 rounded-2xl bg-surface-cream-subtle flex items-center justify-center text-secondary mb-3 shadow-clay-inset">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <h4 className="font-headline text-base font-bold text-primary mb-1">{item.title}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Day-Wise Itinerary Accordion / List */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
              Day-by-Day Journey
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
              Complete Day-Wise Itinerary
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Vehicle at your disposal from 8:00 AM to 8:00 PM daily
          </span>
        </div>

        <div className="space-y-4">
          {itineraryDays.map((item, idx) => (
            <div
              key={item.day}
              className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 flex flex-col md:flex-row gap-6"
            >
              <div className="md:w-36 shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                <span className="px-3.5 py-1 rounded-full bg-primary-container text-white font-mono text-xs font-bold shadow-sm">
                  {item.day}
                </span>
                <span className="text-xs font-bold text-secondary">{item.stay}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-headline text-lg font-bold text-primary">{item.title}</h4>
                  <span className="text-[11px] font-semibold text-gold-deep bg-surface-cream-subtle px-2.5 py-0.5 rounded-full w-fit">
                    {item.meals}
                  </span>
                </div>
                <span className="text-xs font-semibold text-secondary block">{item.route}</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Inclusions & Exclusions */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Inclusions */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[32px] shadow-clay-card border border-white/80">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <h4 className="font-headline text-xl font-bold text-primary">Package Inclusions</h4>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>6 Nights accommodation on twin sharing basis in selected hotel category.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Continental Plan (Daily breakfast included at all hotels).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>All transfers and sightseeing by dedicated private vehicle as per itinerary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Chauffeur allowance, fuel charges, tolls, parking fees, and interstate permits.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>All applicable government service taxes and GST.</span>
              </li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[32px] shadow-clay-card border border-white/80">
            <div className="flex items-center gap-2 mb-4 text-error">
              <span className="material-symbols-outlined text-[22px]">cancel</span>
              <h4 className="font-headline text-xl font-bold text-primary">Package Exclusions</h4>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">✕</span>
                <span>Airfare or train tickets from your originating city to/from Cochin/Trivandrum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">✕</span>
                <span>Monument entry tickets, boating tickets, and National Park fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">✕</span>
                <span>Personal expenses (room service, laundry, telephone calls, tips).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">✕</span>
                <span>Vehicle usage beyond 8:00 PM (driver night bata applicable extra).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">✕</span>
                <span>Hill station AC charges (Munnar/Thekkady hotels are non-AC by default).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live Dynamic Pricing Engine Anchor */}
      <section id="calculator" className="scroll-mt-24">
        <div className="mb-6">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
            Dynamic Calculation Tool
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
            Instant Estimate & Direct Consultation Request
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Select your hotel category, vehicle group size, and custom supplements below to generate your authoritative pricing snapshot.
          </p>
        </div>

        <DynamicPricingCalculator />
      </section>
    </div>
  );
}

