export const categoryTranslations: Record<string, { en: string; da: string }> = {
  'Painting': {
    en: 'Painting',
    da: 'Maleri',
  },
  'Carpentry': {
    en: 'Carpentry',
    da: 'Tømrerarbejde',
  },
  'Plumbing': {
    en: 'Plumbing',
    da: 'VVS',
  },
  'Electrical': {
    en: 'Electrical',
    da: 'El-arbejde',
  },
  'Flooring': {
    en: 'Flooring',
    da: 'Gulvlægning',
  },
  'Roofing': {
    en: 'Roofing',
    da: 'Tagarbejde',
  },
  'Windows & Doors': {
    en: 'Windows & Doors',
    da: 'Vinduer & Døre',
  },
  'Kitchen': {
    en: 'Kitchen',
    da: 'Køkken',
  },
  'Bathroom': {
    en: 'Bathroom',
    da: 'Badeværelse',
  },
  'Heating': {
    en: 'Heating',
    da: 'Opvarmning',
  },
  'Landscaping': {
    en: 'Landscaping',
    da: 'Haveanlæg',
  },
  'Cleaning': {
    en: 'Cleaning',
    da: 'Rengøring',
  },
};

export const subcategoryTranslations: Record<string, { en: string; da: string }> = {
  'Interior Painting': {
    en: 'Interior Painting',
    da: 'Indvendigt Maleri',
  },
  'Exterior Painting': {
    en: 'Exterior Painting',
    da: 'Udvendigt Maleri',
    },
  'Wallpapering': {
    en: 'Wallpapering',
    da: 'Tapetsering',
  },
  'Cabinet Installation': {
    en: 'Cabinet Installation',
    da: 'Skabsinstallation',
  },
  'Door Installation': {
    en: 'Door Installation',
    da: 'Dørinstallation',
  },
  'Deck Building': {
    en: 'Deck Building',
    da: 'Terrassebygning',
  },
  'Pipe Repair': {
    en: 'Pipe Repair',
    da: 'Rørreparation',
  },
  'Drain Cleaning': {
    en: 'Drain Cleaning',
    da: 'Afløbsrensning',
  },
  'Fixture Installation': {
    en: 'Fixture Installation',
    da: 'Armaturinstallation',
  },
  'Wiring': {
    en: 'Wiring',
    da: 'Ledningsføring',
  },
  'Lighting Installation': {
    en: 'Lighting Installation',
    da: 'Belysningsinstallation',
  },
  'Panel Upgrade': {
    en: 'Panel Upgrade',
    da: 'Panelopgradering',
  },
};

export function translateDbField(
  text: string,
  language: string,
  type: 'category' | 'subcategory'
): string {
  const translations = type === 'category' ? categoryTranslations : subcategoryTranslations;
  const translation = translations[text];
  
  if (!translation) {
    return text;
  }
  
  return language === 'da' ? translation.da : translation.en;
}
