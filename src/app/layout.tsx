import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Munsur Union Service | রাতইল ইউনিয়ন পরিষদ, কাশিয়ানী, গোপালগঞ্জ',
  description: 'গোপালগঞ্জ জেলার কাশিয়ানী উপজেলার রাতইল ইউনিয়ন পরিষদ ডিজিটাল সেবা কেন্দ্র - পরিচালনা: মোঃ মনসুর হোসেন। মোবাইল: +880 1571-214406। ডোমেইন: munsurunionservice.com।',
  keywords: [
    'munsurunionservice.com',
    'Munsur Union Service',
    'রাতইল ইউনিয়ন পরিষদ',
    'কাশিয়ানী উপজেলা',
    'গোপালগঞ্জ জেলা',
    'মোঃ মনসুর হোসেন',
    'জন্মনিবন্ধন অনুসন্ধান',
    'ডিজিটাল ইউনিয়ন সেবা'
  ],
  authors: [{ name: 'Md. Munsur Hossain' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Munsur Union Service | রাতইল ইউনিয়ন পরিষদ, কাশিয়ানী, গোপালগঞ্জ',
    description: 'রাতইল ইউনিয়ন পরিষদ ডিজিটাল সেবা কেন্দ্র - মোঃ মনসুর হোসেন। ফোন: +880 1571-214406।',
    url: 'https://munsurunionservice.com',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Munsur Union Service',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOffice',
    'name': 'Munsur Union Service - রাতইল ইউনিয়ন পরিষদ',
    'url': 'https://munsurunionservice.com',
    'telephone': '+8801571214406',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'রাতইল ইউনিয়ন পরিষদ ভবন',
      'addressLocality': 'কাশিয়ানী',
      'addressRegion': 'গোপালগঞ্জ',
      'addressCountry': 'BD',
    },
    'employee': {
      '@type': 'Person',
      'name': 'Md. Munsur Hossain',
    },
  };

  return (
    <html lang="bn">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
