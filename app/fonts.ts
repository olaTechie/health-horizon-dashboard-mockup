import localFont from 'next/font/local';

export const fraunces = localFont({
  src: '../public/fonts/Fraunces/Fraunces.ttf',
  variable: '--font-fraunces',
  display: 'swap',
});

export const inter = localFont({
  src: '../public/fonts/Inter/Inter.ttf',
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrains = localFont({
  src: '../public/fonts/JetBrainsMono/JetBrainsMono.ttf',
  variable: '--font-jetbrains',
  display: 'swap',
});
