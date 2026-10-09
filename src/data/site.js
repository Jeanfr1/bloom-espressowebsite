// Single source for business facts. The Vite plugin writes these into the
// built HTML so they work without JavaScript.
// Source: 07-integracao/config.json + 06-roteiros/03-secoes-copy-en.md
// (transcribed from the café's own Facebook page, website and menu screenshots).
// TODO(bloom): reconfirm hours, supplier and the deep menu/order URL before launch.

export const site = {
  name: 'Bloom Espresso',
  concept: 'Morning, in bloom.',
  locality: 'Pimlico, Townsville',
  address: {
    street: '49 French Street',
    locality: 'Pimlico',
    region: 'QLD',
    postcode: '4812',
    country: 'Australia',
    full: '49 French Street, Pimlico QLD 4812, Australia',
  },
  email: 'coffee@bloomespresso.com.au',
  // bloomespresso.com.au answered 404 at its host on 2026-10-09 (home page and
  // every Square Online path), so no button links to it: "View current menu"
  // scrolls to #menu and price/gift-card questions go to the email.
  // TODO(bloom): when the official site or its order page is back and tested,
  // point the #menu buttons and the mailto CTAs in index.html at it again.
  website: 'https://www.bloomespresso.com.au/',
  // Address search. TODO(bloom): swap for the Google Maps place link (cid).
  directionsHref:
    'https://www.google.com/maps/search/?api=1&query=49%20French%20Street%20Pimlico%20QLD%204812',
  hours: [
    { days: 'Monday – Friday', short: 'Mon – Fri', open: '6:00am', close: '12:00pm', schema: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '06:00', closes: '12:00' },
    { days: 'Saturday – Sunday', short: 'Sat – Sun', open: '7:00am', close: '12:00pm', schema: ['Sa', 'Su'], opens: '07:00', closes: '12:00' },
  ],
  supplier: 'Serving Bear Bones Coffee from Brisbane.',
};

// Illustrative diagrams only: schematic layers, never Bloom's recipe or ratios.
export const drinks = [
  { id: 'espresso', name: 'Espresso', layers: ['Espresso'] },
  { id: 'flat-white', name: 'Flat White', layers: ['Espresso', 'Steamed milk'] },
  { id: 'latte', name: 'Latte', layers: ['Espresso', 'Steamed milk', 'Foam'] },
  { id: 'iced-latte', name: 'Iced Latte', layers: ['Espresso', 'Milk', 'Ice'] },
];

// Names from the supplied menu screenshots. No prices or stock.
export const menu = {
  categories: ['Coffee', 'Iced drinks', 'Food', 'Retail', 'Gift cards'],
  featured: ['Espresso', 'Flat White', 'Latte', 'Cappuccino', 'Long Black', 'Piccolo', 'Magic', 'Iced Latte'],
  food: ['Croissant', 'Banana Bread', 'Bacon & Egg Muffin', 'Bircher Muesli', 'Carrot Cake', 'Honey Bear Brownie', 'Muffin', 'Raisin Toast', 'Toastie', 'Melting Moment'],
};
