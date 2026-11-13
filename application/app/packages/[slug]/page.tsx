import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TOUR_PACKAGES_CATALOGUE } from '@/lib/quotations/catalogue';
import { resolveDestinationTheme } from '@/lib/themes/registry';
import DestinationPackageView from '@/components/themes/DestinationPackageView';

interface PackagePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return TOUR_PACKAGES_CATALOGUE.map((pkg) => ({
    slug: pkg.slug,
  }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const pkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === params.slug);
  if (!pkg) return { title: 'Package Not Found — Varni Holidays' };

  const theme = resolveDestinationTheme(pkg.destination);

  return {
    title: `${pkg.title} (${pkg.durationNights}N/${pkg.durationDays}D) — Varni Holidays`,
    description: `${pkg.overview} Book with verified chauffeur, curated hotels, and authentic Gujarati meal guidance from Anand.`,
    openGraph: {
      title: `${pkg.title} | ${theme.name} Holiday Package`,
      description: pkg.overview,
      images: [{ url: theme.hero.image }],
    },
  };
}

export default function PackageDetailPage({ params }: PackagePageProps) {
  const pkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === params.slug);

  if (!pkg) {
    notFound();
  }

  const theme = resolveDestinationTheme(pkg.destination);

  return <DestinationPackageView packageItem={pkg} theme={theme} />;
}
