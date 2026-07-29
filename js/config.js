// ── Konfiguracja xinfill ──

export const CONFIG = {
  email: "xinfilleu@gmail.com",

  // Numer firmowy do zamówień druku (nie prywatny)
  phone: "+48 XXX XXX XXX",
  phoneTel: "+48XXXXXXXXX",

  seller: {
    name: "Jakub",
    brand: "xinfill",
    country: "Polska",
    // Uzupełnij pełny adres korespondencyjny (wymóg prawny przy sprzedaży B2C)
    address: "Polska — adres korespondencyjny podawany przy zamówieniu",
  },

  social: {
    instagram: "https://instagram.com/xinfill",
    facebook: "https://www.facebook.com/profile.php?id=61592881340390",
    youtube: "https://youtube.com/@xinfill",
    telegram: "https://t.me/xinfilleu",
    handle: "@xinfill",
    telegramHandle: "@xinfilleu",
  },

  ratesPer100g: {
    PLA: 20,
    PETG: 20,
    TPU: 25,
    ASA: 25,
    ASA_PREMIUM: 30,
  },

  minOrder: 25,

  /** Darmowa dostawa od tej kwoty produktów (PLN). */
  freeShippingThreshold: 150,

  /** Ceny produktów (PLN). null = do wyceny po zamówieniu — uzupełnij gdy ustalisz cennik. */
  productPrices: {
    gadget: {
      magnet: 30,
      headphone: 150,
      keychain: null,
      whistle: null,
      coaster: null,
      controller: null,
      collar: null,
      collar_nfc: null,
      collar_airtag: null,
      food: null,
    },
    model: {
      magnet: null,
      headphone: null,
      keychain: null,
      whistle: null,
      coaster: null,
      controller: null,
      collar: null,
      collar_nfc: null,
      collar_airtag: null,
      food: null,
    },
  },

  /** Opcje dostawy w koszyku (ceny orientacyjne, PLN). */
  deliveryOptions: [
    { id: "inpost_a", price: 16.49, labelKey: "cart.delivery.inpost_a" },
    { id: "inpost_b", price: 18.49, labelKey: "cart.delivery.inpost_b" },
    { id: "inpost_c", price: 20.49, labelKey: "cart.delivery.inpost_c" },
    { id: "dpd_pickup", price: 11, labelKey: "cart.delivery.dpd_pickup" },
    { id: "dpd_courier", price: 22, labelKey: "cart.delivery.dpd_courier" },
  ],

  /**
   * Płatności online — uzupełnij po założeniu konta (np. Stripe, Przelewy24).
   * stripePaymentLink: link do Stripe Payment Link z kwotą lub ogólny link do wpłaty.
   */
  payments: {
    enabled: false,
    stripePaymentLink: "",
    bankAccount: "",
  },
};
