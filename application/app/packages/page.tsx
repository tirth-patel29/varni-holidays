'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY_CONTACT } from "@/lib/config/contact";
import PackageEnquiryModal, { PackageModalInfo } from "@/components/PackageEnquiryModal";

const PACKAGES_LIST = [
  {
    slug: "karnataka-wayanad-6n7d",
    title: "Karnataka & Wayanad Hill Escapes",
    region: "South India",
    duration: "6N / 7D",
    price: "From ₹23,400",
    route: "Bangalore • Mysore • Coorg • Wayanad",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "tamil-nadu-temple-5n6d",
    title: "Tamil Nadu Divya Desam Temple Tour",
    region: "Pilgrimage",
    duration: "5N / 6D",
    price: "From ₹19,800",
    route: "Madurai • Rameshwaram • Kanyakumari • Trivandrum",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "andaman-white-sand-5n6d",
    title: "Andaman White Sand Island Odyssey",
    region: "Island Tropical",
    duration: "5N / 6D",
    price: "From ₹28,500",
    route: "Port Blair • Havelock • Neil Island",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "swiss-alps-paris-8n9d",
    title: "Swiss Alps & Romantic Paris",
    region: "International",
    duration: "8N / 9D",
    price: "From ₹1,65,000",
    route: "Zurich • Lucerne • Interlaken • Paris",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "bali-luxury-pool-villa-6n7d",
    title: "Bali Luxury Pool Villa Retreat",
    region: "International",
    duration: "6N / 7D",
    price: "From ₹48,000",
    route: "Ubud • Seminyak • Nusa Penida",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "dubai-abu-dhabi-5n6d",
    title: "Dubai & Abu Dhabi Extravaganza",
    region: "Middle East",
    duration: "5N / 6D",
    price: "From ₹42,000",
    route: "Dubai Marina • Desert Safari • Abu Dhabi Mosque",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function PackagesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageModalInfo | null>(null);

  const handleOpenEnquiry = (pkg: PackageModalInfo) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[16px]">luggage</span>
          <span>Verified Holiday Packages</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-5xl font-bold text-primary">
          Thoughtfully Crafted Holiday Packages
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
          From tranquil Kerala backwaters and alpine peaks to sacred temple corridors. All packages include pre-inspected accommodations, private sanitized vehicles, and 24x7 Anand tour support.
        </p>
      </div>

      {/* Featured Flagship Package Card */}
      <div className="bg-surface-container-lowest rounded-[36px] p-6 sm:p-8 shadow-clay-card border border-white/80 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-clay-card">
            <Image
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
              alt="Kerala Houseboat Backwaters"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-gold-deep text-white text-xs font-bold shadow-sm z-10">
              Flagship Winter Tour (1 Oct 2026 - 31 Mar 2027)
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md z-10">
              <span className="text-xs font-semibold">Ex-Cochin • 2N Munnar + 1N Thekkady + 1N Alleppey + 2N Kovalam</span>
              <span className="text-xs font-bold bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full">
                6N / 7D
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
                South India Signature
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-1">
                Scenic Kerala & Backwaters Grand Tour
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                Traverse misty tea hills in Munnar, encounter Periyar wildlife in Thekkady, relax on serene Alleppey backwaters, and explore golden sands in Kovalam and Poovar.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 bg-surface-cream-subtle rounded-xl shadow-clay-inset">
                  <span className="text-[10px] text-on-surface-variant block font-bold">Starting Rate</span>
                  <span className="font-bold text-primary">₹20,700 / Person</span>
                </div>
                <div className="p-2.5 bg-surface-cream-subtle rounded-xl shadow-clay-inset">
                  <span className="text-[10px] text-on-surface-variant block font-bold">Accommodation</span>
                  <span className="font-bold text-primary">5 Tiers (Standard to Luxury)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/packages/kerala-6n7d-winter"
                className="flex-1 py-3.5 rounded-full bg-primary text-white text-xs font-bold clay-pill-button flex items-center justify-center gap-2 text-center"
              >
                <span>View Full Itinerary & Pricing</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <button
                type="button"
                onClick={() =>
                  handleOpenEnquiry({
                    slug: "kerala-6n7d-winter",
                    title: "Scenic Kerala & Backwaters Grand Tour",
                    duration: "6N / 7D",
                    price: "₹20,700 / Person",
                    route: "Ex-Cochin • Munnar • Thekkady • Alleppey • Kovalam",
                  })
                }
                className="py-3.5 px-6 rounded-full bg-gold-deep hover:bg-gold-deep/90 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Request Quote</span>
              </button>
              <a
                href={COMPANY_CONTACT.whatsapp.buildUrl("Hi Varni Holidays, please send details for Kerala 6N7D package")}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-6 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold clay-pill-secondary flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-gold-deep text-[18px]">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Other Curated Packages Grid */}
      <div className="mb-6">
        <h3 className="font-headline text-2xl font-bold text-primary mb-6">
          More Curated Holiday Itineraries
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES_LIST.map((pkg) => (
            <div
              key={pkg.slug}
              className="bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-clay-card border border-white/80 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-primary shadow-sm z-10">
                    {pkg.duration}
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-[10px] font-bold text-white shadow-sm z-10">
                    {pkg.region}
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-headline text-lg font-bold text-primary mb-1">
                    {pkg.title}
                  </h4>
                  <p className="text-xs text-secondary font-medium mb-3">
                    {pkg.route}
                  </p>
                  <span className="text-xs font-bold text-primary block">
                    {pkg.price} <span className="text-[10px] text-on-surface-variant font-normal">/ person twin sharing</span>
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => handleOpenEnquiry(pkg)}
                  className="w-full py-2.5 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold clay-pill-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                >
                  <span>Request Custom Quote</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Enquiry Modal */}
      <PackageEnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPackage(null);
        }}
        packageInfo={selectedPackage}
      />
    </div>
  );
}
