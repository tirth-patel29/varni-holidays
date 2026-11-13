/**
 * VARNI HOLIDAYS — Verified Destination Photography & Visual Assets
 * Authentic high-resolution destination photography and gallery collections.
 */

export interface GalleryPhoto {
  url: string;
  title: string;
  location: string;
  caption: string;
}

export interface DestinationAssetBundle {
  fullPageBackground: string;
  heroImage: string;
  gallery: GalleryPhoto[];
  bannerImage: string;
  atmosphereIcon: string;
}

export const DESTINATION_ASSETS: Record<string, DestinationAssetBundle> = {
  kashmir: {
    fullPageBackground:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=85',
    heroImage:
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1920&q=85',
    bannerImage:
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=85',
    atmosphereIcon: 'ac_unit',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
        title: 'Dal Lake & Heritage Wooden Houseboats',
        location: 'Srinagar',
        caption: 'Traditional hand-carved cedar wood houseboats floating gracefully on serene Dal Lake.',
      },
      {
        url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
        title: 'Gulmarg Gondola & Apharwat Peak',
        location: 'Gulmarg (13,780 ft)',
        caption: 'Ascend into snowfields on Asia\'s longest cable car offering panoramic Himalayan horizons.',
      },
      {
        url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80',
        title: 'Pahalgam Pine Valley & Lidder River',
        location: 'Pahalgam',
        caption: 'Crystal mountain streams flowing through dense alpine cedar and deodar pine forests.',
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        title: 'Betaab Valley & Mini Switzerland',
        location: 'Anantnag District',
        caption: 'Rolling snow meadows flanked by steep Himalayan ridges and snow-melt rivers.',
      },
      {
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        title: 'Sunset Shikara Rides',
        location: 'Dal Lake',
        caption: 'Glide past floating lotus gardens, Char Chinar island, and watercraft bazaars at dusk.',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        title: 'Nishat Bagh Mughal Terraced Gardens',
        location: 'Srinagar',
        caption: 'Historic 12-terraced garden designed by Asif Khan in 1633 with cascading water fountains.',
      },
    ],
  },

  kerala: {
    fullPageBackground:
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=2000&q=85',
    heroImage:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=85',
    bannerImage:
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1600&q=85',
    atmosphereIcon: 'forest',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
        title: 'Munnar Rolling Tea Plantations',
        location: 'Munnar Hills (5,200 ft)',
        caption: 'Undulating emerald green tea carpet stretching across the mist-shrouded Western Ghats.',
      },
      {
        url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
        title: 'Alleppey Backwaters & Kettuvallam',
        location: 'Alleppey (Alappuzha)',
        caption: 'Tranquil palm-lined canals and lagoons traversed by traditional thatched-roof houseboats.',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        title: 'Periyar Wildlife & Spice Trails',
        location: 'Thekkady',
        caption: 'Aromatic cardamom, cinnamon, and pepper estates beside the protected Periyar Lake sanctuary.',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        title: 'Kovalam Lighthouse Beach & Crescent Bay',
        location: 'Kovalam',
        caption: 'Sun-drenched golden sands with gentle Arabian Sea waves and the striped heritage lighthouse.',
      },
      {
        url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        title: 'Athirapilly Cascading Waterfalls',
        location: 'Thrissur District',
        caption: 'The majestic 80-foot "Niagara of India" roaring through dense tropical rainforests.',
      },
      {
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        title: 'Fort Kochi Chinese Fishing Nets',
        location: 'Cochin',
        caption: 'Iconic cantilevered fishing nets silhouetted against historic colonial harbor sunsets.',
      },
    ],
  },

  rajasthan: {
    fullPageBackground:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=85',
    heroImage:
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1920&q=85',
    bannerImage:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85',
    atmosphereIcon: 'castle',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
        title: 'Amber Palace & Sheesh Mahal',
        location: 'Jaipur',
        caption: 'Opulent sandstone and marble hilltop fortress overlooking Maota Lake.',
      },
      {
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
        title: 'Sam Sand Dunes Camel Safari',
        location: 'Jaisalmer (Thar Desert)',
        caption: 'Golden rippled desert sands at sunset with traditional folk music around the campfire.',
      },
      {
        url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
        title: 'Lake Pichola & City Palace',
        location: 'Udaipur',
        caption: 'Romantic white marble palaces reflected in the tranquil waters of Lake Pichola.',
      },
    ],
  },

  goa: {
    fullPageBackground:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2000&q=85',
    heroImage:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=85',
    bannerImage:
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1600&q=85',
    atmosphereIcon: 'beach_access',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        title: 'Vagator Beach Sunsets',
        location: 'North Goa',
        caption: 'Red cliff headlands meeting the turquoise waters of the Arabian Sea.',
      },
      {
        url: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
        title: 'Old Goa Portuguese Heritage Cathedrals',
        location: 'Velha Goa',
        caption: '16th-century baroque architecture at the Basilica of Bom Jesus.',
      },
    ],
  },
};

export function getDestinationAssets(destinationId: string): DestinationAssetBundle {
  const key = destinationId.toLowerCase().trim();
  if (key in DESTINATION_ASSETS) {
    return DESTINATION_ASSETS[key];
  }
  return DESTINATION_ASSETS.kerala;
}
