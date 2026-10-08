import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'fr', 'ar'];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en'; // Fallback instead of 404
  }

  let messages;
  switch (locale) {
    case 'fr':
      messages = (await import('../../messages/fr.json')).default;
      break;
    case 'ar':
      messages = (await import('../../messages/ar.json')).default;
      break;
    case 'en':
    default:
      messages = (await import('../../messages/en.json')).default;
      break;
  }

  return {
    locale: locale as string,
    messages
  };
});
