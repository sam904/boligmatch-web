import { useTranslation } from 'react-i18next';
import { translateDbField } from '../lib/dbTranslations';

export function useDbTranslation() {
  const { i18n } = useTranslation();
  
  const translateCategory = (name: string) => {
    return translateDbField(name, i18n.language, 'category');
  };
  
  const translateSubCategory = (name: string) => {
    return translateDbField(name, i18n.language, 'subcategory');
  };
  
  return { translateCategory, translateSubCategory };
}
