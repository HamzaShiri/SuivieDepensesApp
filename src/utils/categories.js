/**
 * Catégories de dépenses définies avec leurs icônes Lucide, couleurs HSL/Hex et mots-clés arabe tunisien
 */

export const CATEGORIES = [
  {
    id: 'Nourriture',
    label: 'Nourriture',
    icon: 'Utensils',
    color: '#EF4444', // Red
    bgColor: '#FEE2E2',
    keywords: ['خبز', 'ماكلة', 'حوت', 'لحم', 'دجاج', 'خضرة', 'غلة', 'مغزة', 'عشاء', 'فطور', 'قهوة', 'مطعم', 'مكتبة', 'مركاز', 'بقالة', 'سوبرماركت', 'حليب', 'ماء', 'روز', 'كسكسي', 'شاورما', 'بيتزا']
  },
  {
    id: 'Transport',
    label: 'Transport',
    icon: 'Car',
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7',
    keywords: ['تاكسي', 'ترانسپور', 'كار', 'مترو', 'تران', 'مازوط', 'بنزين', 'essence', 'essence', 'اجرة', 'لوباج', 'louage', 'autoroute', 'péage', 'باركينغ', 'مأوى']
  },
  {
    id: 'Logement',
    label: 'Logement',
    icon: 'Home',
    color: '#3B82F6', // Blue
    bgColor: '#DBEAFE',
    keywords: ['كراء', 'loyer', 'دار', 'صيانة', 'دهينة', 'مفتاح', 'أثاث', 'طاولة', 'كرسي']
  },
  {
    id: 'Factures',
    label: 'Factures',
    icon: 'FileText',
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE',
    keywords: ['فاتورة', 'ضؤ', 'ماء', 'أنترنيت', 'steg', 'sonede', 'telecom', 'ooredoo', 'orange', 'شارج', 'recharge', 'تلفون', 'كارت']
  },
  {
    id: 'Santé',
    label: 'Santé',
    icon: 'Activity',
    color: '#10B981', // Emerald
    bgColor: '#D1FAE5',
    keywords: ['دواء', 'فرماسي', 'طبيب', 'سبيطار', 'حكيم', 'pharmacie', 'تحليل', 'اناليز', 'صحة', 'عصابة', 'ماسك']
  },
  {
    id: 'Éducation',
    label: 'Éducation',
    icon: 'GraduationCap',
    color: '#06B6D4', // Cyan
    bgColor: '#CFFAFE',
    keywords: ['قراية', 'كتوب', 'كراسات', 'مدرسة', 'جامعة', 'فورماسيون', 'etude', 'cours', 'فروض', 'ادوات', 'مكتبية']
  },
  {
    id: 'Shopping',
    label: 'Shopping',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    bgColor: '#FCE7F3',
    keywords: ['دبش', 'حوايج', 'صباط', 'سبرديلة', 'ساعة', 'مكياج', 'لبسة', 'shopping', 'شريت', 'مغازة']
  },
  {
    id: 'Divertissement',
    label: 'Divertissement',
    icon: 'Gamepad2',
    color: '#6366F1', // Indigo
    bgColor: '#E0E7FF',
    keywords: ['سينما', 'قهوة', 'تفريد', 'voyage', 'بحيرة', 'نزهة', 'العاب', 'نادي', 'جيم', 'gym', 'كرطوش']
  },
  {
    id: 'Autres',
    label: 'Autres',
    icon: 'MoreHorizontal',
    color: '#6B7280', // Gray
    bgColor: '#F3F4F6',
    keywords: ['حاجة', 'مصروف', 'خرجة', 'مصاريف']
  }
];

export const getCategoryById = (id) => {
  return CATEGORIES.find(c => c.id.toLowerCase() === (id || '').toLowerCase()) || CATEGORIES[CATEGORIES.length - 1];
};
