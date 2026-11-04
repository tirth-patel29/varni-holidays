import React from "react";
import Link from "next/link";
import FlightSearchSection from "@/components/FlightSearchSection";
import DynamicPricingCalculator from "@/components/DynamicPricingCalculator";
import VisaEnquirySection from "@/components/VisaEnquirySection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      
      {/* ==================================================== */}
      {/* SECTION 1: HERO & TACTILE CLAY VISUAL SHOWCASE       */}
      {/* ==================================================== */}
      <section className="relative w-full max-w-[1380px] mx-auto px-4 md:px-8 pt-4 pb-12">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-12 left-1/4 w-96 h-96 rounded-full bg-ocean-mist-soft/60 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-gold-light/40 blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Editorial Storytelling */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Greeting Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container shadow-clay-card w-fit mb-4">
              <span className="text-lg">✨</span>
              <span className="text-xs font-bold text-primary tracking-wide">
                Namaste, Explorer
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-deep animate-pulse ml-1" />
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl lg:text-[54px] font-bold text-primary leading-tight tracking-tight mb-4">
              Your Next Journey <br className="hidden sm:inline" />
              <span className="italic font-normal text-secondary font-serif">Begins Here</span>
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant mb-6 max-w-xl leading-relaxed">
              Discover extraordinary destinations, thoughtfully curated itineraries, and seamless international escapes crafted with genuine Gujarat hospitality from Anand.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <a
                href="#packages"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white text-xs font-bold clay-pill-button hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">explore</span>
                <span>Explore Kerala 6N7D</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>

              <a
                href="https://wa.me/919898000000?text=Hello%20Varni%20Holidays,%20I%20want%20to%20plan%20a%20vacation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold clay-pill-secondary"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">chat_bubble</span>
                <span>Plan With An Expert</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-container-low shadow-clay-inset">
              <div className="flex flex-col items-center text-center p-1">
                <span className="font-headline text-lg sm:text-xl font-bold text-primary">18k+</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Happy Voyagers</span>
              </div>
              <div className="flex flex-col items-center text-center p-1 border-x border-surface-sand-tint">
                <span className="font-headline text-lg sm:text-xl font-bold text-gold-deep">4.9★</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Gujarat Rating</span>
              </div>
              <div className="flex flex-col items-center text-center p-1">
                <span className="font-headline text-lg sm:text-xl font-bold text-secondary">100%</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Custom Crafted</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tactile Clay Visual Artwork */}
          <div className="lg:col-span-7 relative">
            <div className="relative bg-surface-container-lowest p-3 sm:p-5 rounded-[42px] shadow-clay-hero border border-white/90">
              <div className="relative h-[420px] sm:h-[480px] w-full rounded-[34px] overflow-hidden group">
                {/* Visual Imagery */}
                <img
                  src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80"
                  alt="Scenic Kerala Backwaters Houseboat and lush tea hills in Munnar"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />

                {/* Hand-drawn style sticker */}
                <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <span className="font-headline text-secondary italic text-xs font-semibold">
                    God&apos;s Own Country 🌴
                  </span>
                </div>

                {/* Card Editorial Info */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-md">
                    <span className="text-[10px] uppercase tracking-widest text-gold-light font-bold drop-shadow">
                      FEATURED DOMESTIC TOUR
                    </span>
                    <h3 className="font-headline text-2xl sm:text-3xl text-white drop-shadow-md leading-none mt-1">
                      Kerala Backwaters & Munnar Hills
                    </h3>
                    <p className="text-xs text-surface-container-low/90 mt-1 line-clamp-2">
                      Munnar emerald tea gardens, Thekkady wildlife, private Alleppey backwaters, and Poovar sea beach.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-white/90 text-primary font-bold">
                        6 Nights / 7 Days
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gold-deep text-white font-bold">
                        From ₹20,700 / person
                      </span>
                    </div>
                  </div>

                  <a
                    href="#packages"
                    className="self-start sm:self-end inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary text-xs font-bold shadow-clay-card hover:bg-gold-light transition-all shrink-0"
                  >
                    <span>Price Calculator</span>
                    <span className="material-symbols-outlined text-[16px]">east</span>
                  </a>
                </div>
              </div>

              {/* Overlapping Floating Weather Badge */}
              <div className="absolute -top-5 -right-3 sm:-right-4 bg-surface-container-lowest p-3 rounded-[24px] shadow-clay-floating border border-white/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/60 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[24px]">wb_sunny</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-lg font-bold text-primary leading-none">24°C</span>
                    <span className="text-[11px] text-secondary font-bold">Pleasant</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] text-secondary">location_on</span>
                    Munnar, Kerala
                  </span>
                </div>
              </div>

              {/* Floating Departure Badge */}
              <div className="hidden sm:flex absolute -bottom-6 right-6 bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-[22px] shadow-clay-floating border border-white/80 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-gold-deep">
                  <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                    Direct Group Flight
                  </span>
                  <span className="text-xs font-bold text-primary block leading-tight">
                    Ahmedabad & Mumbai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 2: FLIGHT SEARCH & ENQUIRY MODULE            */}
      {/* ==================================================== */}
      <FlightSearchSection />

      {/* ==================================================== */}
      {/* SECTION 3: KERALA 6N7D & DYNAMIC PRICING ENGINE      */}
      {/* ==================================================== */}
      <section id="packages" className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
            Verified Supplier Pricing
          </span>
          <h2 className="font-headline text-3xl font-bold text-primary">
            Kerala 6 Nights / 7 Days Grand Tour
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2">
            Ex-Cochin • 2N Munnar + 1N Thekkady + 1N Alleppey + 2N Kovalam • CPAI Breakfast Included
          </p>
        </div>

        <DynamicPricingCalculator />
      </section>

      {/* ==================================================== */}
      {/* SECTION 4: VISA ASSISTANCE MODULE                   */}
      {/* ==================================================== */}
      <VisaEnquirySection />

      {/* ==================================================== */}
      {/* SECTION 5: POPULAR DESTINATIONS                      */}
      {/* ==================================================== */}
      <section id="destinations" className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
              Curated Escapes
            </span>
            <h2 className="font-headline text-3xl font-bold text-primary">
              Trending Travel Destinations
            </h2>
          </div>
          <Link
            href="/destinations"
            className="text-xs font-bold text-secondary inline-flex items-center gap-1 hover:underline"
          >
            <span>View All Destinations</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Kashmir Valley",
              image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
              desc: "Srinagar houseboats, Gulmarg snow gondolas, and saffron meadows of Pahalgam.",
              duration: "6N / 7D",
              price: "From ₹22,500",
            },
            {
              title: "Swiss Alps & Paris",
              image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
              desc: "Mount Titlis cable cars, Lake Lucerne cruises, and Eiffel Tower summit tours.",
              duration: "8N / 9D",
              price: "From ₹1,65,000",
            },
            {
              title: "Bali Tropical Retreat",
              image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
              desc: "Ubud pool villas, Nusa Penida sea cliffs, and authentic Balinese temple sunsets.",
              duration: "6N / 7D",
              price: "From ₹48,000",
            },
            {
              title: "Dubai & Desert Safari",
              image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
              desc: "Burj Khalifa observatory, dune bashing safaris, and luxury marina yacht dinners.",
              duration: "5N / 6D",
              price: "From ₹42,000",
            },
            {
              title: "Tamil Nadu Temple Tour",
              image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
              desc: "Madurai Meenakshi, Rameshwaram sacred bathing ghats, and Kanyakumari confluence.",
              duration: "5N / 6D",
              price: "From ₹19,800",
            },
            {
              title: "Andaman Emerald Islands",
              image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80",
              desc: "Radhanagar white sands, Cellular Jail light show, and coral reef scuba diving.",
              duration: "5N / 6D",
              price: "From ₹28,500",
            },
          ].map((dest) => (
            <div
              key={dest.title}
              className="group bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-clay-card border border-white/80 hover:-translate-y-1 transition-all"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-primary shadow-sm">
                  {dest.duration}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-headline text-xl font-bold text-white leading-tight">
                    {dest.title}
                  </h3>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-between">
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                  {dest.desc}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-surface-sand-tint">
                  <span className="text-xs font-bold text-secondary">{dest.price}</span>
                  <a
                    href="#flights"
                    className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:text-secondary"
                  >
                    <span>Enquire</span>
                    <span className="material-symbols-outlined text-[16px]">east</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 6: WHY CHOOSE US / THE VARNI STANDARD        */}
      {/* ==================================================== */}
      <section className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-12">
        <div className="bg-surface-cream-subtle/70 p-8 sm:p-12 rounded-[40px] shadow-clay-card border border-white/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
              The Varni Standard
            </span>
            <h2 className="font-headline text-3xl font-bold text-primary">
              Crafted with Gujarat Hospitality
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-2">
              We understand family food preferences, NRI travel logistics, and the peace of mind of having a local team standing behind your holiday.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/70">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-gold-deep flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">restaurant</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-primary mb-2">
                100% Veg & Pure Jain Meals
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pre-arranged vegetarian and Jain catering throughout Kerala, South India, and international itineraries. Kitchen arrangements for elders.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/70">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-gold-deep flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-primary mb-2">
                24x7 Anand Tour Manager
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Direct WhatsApp contact with your designated tour coordinator from flight takeoff until return home. No automated chatbots.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/70">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-gold-deep flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-primary mb-2">
                Complete Transparent Pricing
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                All vehicle tolls, interstate road permits, parking fees, driver batas, and statutory GST taxes clearly accounted for. Zero surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 7: CUSTOM VACATION CONSULTATION CTA          */}
      {/* ==================================================== */}
      <section className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-8 mb-8">
        <div className="bg-primary-container text-white p-8 sm:p-12 rounded-[40px] shadow-clay-floating relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light block mb-2">
              Bespoke Holiday Planning
            </span>
            <h2 className="font-headline text-2xl sm:text-4xl font-bold leading-tight mb-4">
              Planning a Family Reunion, NRI Homecoming, or Honeymoon?
            </h2>
            <p className="text-xs sm:text-sm text-surface-sand-tint mb-6 leading-relaxed">
              Drop by our Anand office on Vidyanagar Road or send us your travel dates. We will curate a custom itinerary with vehicle, hotel, and meal preferences.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919898000000?text=Hello%20Varni%20Holidays,%20I%20need%20a%20tailor-made%20holiday%20proposal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gold-deep text-white text-xs font-bold clay-pill-button hover:brightness-110"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="tel:+912692245890"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold hover:bg-white/25 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>Call Anand Office: (02692) 245-890</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

