import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { slugify } from '../src/common/slugify';
import { DEFAULT_PRODUCT_IMAGE } from '../src/common/images';

const prisma = new PrismaClient();

const categories = [
  'Bébé & Maman',
  'Compléments Alimentaires',
  'Hygiène',
  'Matériel Médical',
  'Hygiène Bucco-Dentaire',
  'Naturel & Bio',
  'Promotions',
];

type SeedProduct = {
  name: string;
  brand: string;
  category: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  howToUse: string[];
  precautions: string[];
};

const products: SeedProduct[] = [
  {
    name: 'Pack Soin Bébé Douceur',
    brand: 'Kenz Santé',
    category: 'Bébé & Maman',
    description: 'Un rituel doux pour accompagner la toilette quotidienne des bébés et garder la peau confortable.',
    fullDescription: 'Ce pack réunit les essentiels de soin pour bébé dans une routine simple, rassurante et agréable. Sa sélection aide à nettoyer, hydrater et protéger la peau fragile au quotidien, avec une expérience pensée pour les parents qui recherchent praticité et douceur.',
    price: 2450,
    originalPrice: 2900,
    badge: 'Nouveau',
    rating: 4.8,
    reviewCount: 42,
    ingredients: ['Formule douce', 'Agents hydratants', 'Parfum léger', 'Convient aux routines quotidiennes'],
    howToUse: ['Utiliser pendant la toilette quotidienne', 'Appliquer sur peau propre', 'Sécher délicatement après rinçage'],
    precautions: ['Usage externe uniquement', 'Eviter le contact avec les yeux', 'Tenir hors de portée des enfants'],
  },
  {
    name: 'Crème Réparatrice Maman',
    brand: 'Kenz Santé',
    category: 'Bébé & Maman',
    description: 'Une crème riche pour nourrir les zones sèches et apporter une sensation de confort durable.',
    fullDescription: 'Pensée pour les mamans, cette crème enveloppe la peau d’une texture généreuse et non agressive. Elle s’intègre facilement dans une routine après la douche ou avant le coucher pour aider la peau à retrouver souplesse et confort.',
    price: 1850,
    originalPrice: null,
    badge: null,
    rating: 4.7,
    reviewCount: 31,
    ingredients: ['Beurre nourrissant', 'Glycérine', 'Extrait apaisant', 'Texture riche'],
    howToUse: ['Appliquer sur peau propre', 'Masser jusqu’à absorption', 'Renouveler sur les zones sèches'],
    precautions: ['Ne pas appliquer sur peau irritée', 'Arrêter en cas de réaction', 'Usage externe uniquement'],
  },
  {
    name: 'Vitamine C + Zinc 30 Comprimés',
    brand: 'VitaPlus',
    category: 'Compléments Alimentaires',
    description: 'Une formule pratique pour soutenir les apports quotidiens en vitamine C et zinc.',
    fullDescription: 'Vitamine C + Zinc accompagne les périodes de fatigue passagère et complète une alimentation équilibrée. Son format de 30 comprimés facilite une prise régulière dans le cadre d’une routine bien-être.',
    price: 1650,
    originalPrice: 1900,
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 86,
    ingredients: ['Vitamine C', 'Zinc', 'Agents de compression', 'Arôme naturel'],
    howToUse: ['Prendre selon les indications de l’emballage', 'A avaler avec un grand verre d’eau', 'Utiliser dans le cadre d’une alimentation variée'],
    precautions: ['Ne remplace pas une alimentation équilibrée', 'Respecter la dose recommandée', 'Demander conseil en cas de grossesse ou traitement'],
  },
  {
    name: 'Magnésium B6 Energie',
    brand: 'VitaPlus',
    category: 'Compléments Alimentaires',
    description: 'Un complément pensé pour les journées chargées et les routines bien-être actives.',
    fullDescription: 'Magnésium B6 Energie associe magnésium et vitamine B6 dans une formule facile à intégrer au quotidien. Il convient aux personnes qui souhaitent compléter leurs apports nutritionnels pendant les périodes intenses.',
    price: 1350,
    originalPrice: null,
    badge: null,
    rating: 4.6,
    reviewCount: 57,
    ingredients: ['Magnésium', 'Vitamine B6', 'Cellulose microcristalline', 'Anti-agglomérant'],
    howToUse: ['Prendre avec de l’eau', 'De préférence pendant un repas', 'Suivre les recommandations indiquées'],
    precautions: ['Tenir hors de portée des enfants', 'Ne pas dépasser la dose conseillée', 'Demander avis médical si nécessaire'],
  },
  {
    name: 'Gel Lavant Antiseptique 500 ml',
    brand: 'CleanCare',
    category: 'Hygiène',
    description: 'Un gel lavant familial pour une sensation de peau propre et fraîche au quotidien.',
    fullDescription: 'Ce gel lavant grand format est adapté aux lavages fréquents des mains et du corps. Sa texture pratique mousse facilement et se rince rapidement, idéale pour la maison, le bureau ou les espaces de passage.',
    price: 790,
    originalPrice: 950,
    badge: 'Economique',
    rating: 4.5,
    reviewCount: 24,
    ingredients: ['Base lavante douce', 'Agents purifiants', 'Glycérine', 'Parfum frais'],
    howToUse: ['Appliquer sur peau mouillée', 'Faire mousser', 'Rincer abondamment'],
    precautions: ['Eviter les yeux', 'Usage externe uniquement', 'Ne pas avaler'],
  },
  {
    name: 'Solution Hydroalcoolique 250 ml',
    brand: 'CleanCare',
    category: 'Hygiène',
    description: 'Un format pratique pour garder les mains propres sans rinçage pendant la journée.',
    fullDescription: 'Cette solution hydroalcoolique accompagne les déplacements, le bureau et les sorties. Son flacon de 250 ml offre un bon équilibre entre capacité et facilité de transport.',
    price: 450,
    originalPrice: null,
    badge: null,
    rating: 4.4,
    reviewCount: 19,
    ingredients: ['Alcool', 'Eau purifiée', 'Glycérine', 'Agent parfumant'],
    howToUse: ['Déposer une petite quantité dans la paume', 'Frotter les mains jusqu’à séchage', 'Ne pas rincer'],
    precautions: ['Produit inflammable', 'Tenir loin de la chaleur', 'Eviter le contact avec les yeux'],
  },
  {
    name: 'Tensiomètre Digital Bras',
    brand: 'MediCheck',
    category: 'Matériel Médical',
    description: 'Un tensiomètre simple à lire pour suivre la tension à domicile avec plus de confort.',
    fullDescription: 'Le tensiomètre digital bras offre un affichage clair, une prise en main rapide et une mesure adaptée au suivi régulier à la maison. Il convient aux utilisateurs qui veulent un appareil pratique et lisible.',
    price: 6900,
    originalPrice: 7600,
    badge: 'Recommandé',
    rating: 4.8,
    reviewCount: 38,
    ingredients: ['Ecran digital', 'Brassard ajustable', 'Mémoire de mesure', 'Bouton de démarrage rapide'],
    howToUse: ['Installer le brassard sur le bras', 'Rester assis et détendu', 'Lancer la mesure puis lire le résultat'],
    precautions: ['Lire la notice avant utilisation', 'Ne remplace pas un avis médical', 'Conserver dans un endroit sec'],
  },
  {
    name: 'Thermomètre Infrarouge Sans Contact',
    brand: 'MediCheck',
    category: 'Matériel Médical',
    description: 'Une lecture rapide de la température, pratique pour toute la famille.',
    fullDescription: 'Ce thermomètre infrarouge sans contact est conçu pour une mesure rapide et hygiénique. Son format léger permet une utilisation facile à la maison, notamment avec les enfants.',
    price: 4200,
    originalPrice: null,
    badge: null,
    rating: 4.7,
    reviewCount: 44,
    ingredients: ['Capteur infrarouge', 'Ecran rétroéclairé', 'Mode sans contact', 'Signal sonore'],
    howToUse: ['Pointer vers la zone indiquée par la notice', 'Respecter la distance recommandée', 'Lire la température affichée'],
    precautions: ['Utiliser selon la notice', 'Nettoyer régulièrement la surface externe', 'Conserver à l’abri de l’humidité'],
  },
  {
    name: 'Dentifrice Protection Gencives',
    brand: 'SmileCare',
    category: 'Hygiène Bucco-Dentaire',
    description: 'Un dentifrice quotidien pour une bouche fraîche et une sensation de gencives protégées.',
    fullDescription: 'Sa formule accompagne le brossage quotidien et laisse une sensation durable de fraîcheur. Il est adapté aux routines matin et soir pour toute personne recherchant une hygiène bucco-dentaire régulière.',
    price: 650,
    originalPrice: null,
    badge: null,
    rating: 4.6,
    reviewCount: 27,
    ingredients: ['Fluor', 'Agents nettoyants', 'Arôme menthe', 'Silice douce'],
    howToUse: ['Brosser les dents pendant deux minutes', 'Utiliser matin et soir', 'Rincer après brossage'],
    precautions: ['Ne pas avaler', 'Superviser les enfants', 'Consulter un dentiste en cas de gêne persistante'],
  },
  {
    name: 'Brosse à Dents Souple Premium',
    brand: 'SmileCare',
    category: 'Hygiène Bucco-Dentaire',
    description: 'Des brins souples pour un brossage confortable et précis au quotidien.',
    fullDescription: 'Cette brosse à dents premium aide à nettoyer efficacement tout en restant douce avec les gencives. Son manche ergonomique améliore la prise en main pour une routine plus agréable.',
    price: 520,
    originalPrice: 650,
    badge: '-20%',
    rating: 4.5,
    reviewCount: 18,
    ingredients: ['Brins souples', 'Manche ergonomique', 'Tête compacte', 'Grip antidérapant'],
    howToUse: ['Utiliser avec un dentifrice adapté', 'Brosser sans pression excessive', 'Remplacer régulièrement la brosse'],
    precautions: ['Rincer après usage', 'Laisser sécher à l’air libre', 'Usage personnel uniquement'],
  },
  {
    name: 'Huile d’Argan Pure Bio',
    brand: 'BioNature',
    category: 'Naturel & Bio',
    description: 'Une huile végétale polyvalente pour nourrir la peau et sublimer les cheveux.',
    fullDescription: 'L’huile d’argan pure bio est appréciée pour sa texture soyeuse et son usage multi-zones. Quelques gouttes suffisent pour enrichir une routine visage, corps ou cheveux avec une touche naturelle.',
    price: 2200,
    originalPrice: null,
    badge: 'Bio',
    rating: 4.9,
    reviewCount: 63,
    ingredients: ['Huile d’argan pure', 'Origine végétale', 'Sans parfum ajouté', 'Texture légère'],
    howToUse: ['Appliquer quelques gouttes', 'Masser sur peau ou cheveux', 'Utiliser seule ou mélangée à une crème'],
    precautions: ['Tester sur une petite zone', 'Eviter le contact avec les yeux', 'Conserver à l’abri de la lumière'],
  },
  {
    name: 'Pack Promo Santé Essentiels',
    brand: 'Kenz Santé',
    category: 'Promotions',
    description: 'Une sélection d’essentiels à prix avantageux pour compléter votre pharmacie familiale.',
    fullDescription: 'Ce pack promotionnel réunit des produits utiles au quotidien dans une offre simple et économique. Il est pensé pour les foyers qui veulent garder sous la main les basiques de bien-être, hygiène et suivi familial.',
    price: 2990,
    originalPrice: 3800,
    badge: '-20%',
    rating: 4.8,
    reviewCount: 52,
    ingredients: ['Sélection hygiène', 'Produits bien-être', 'Format familial', 'Offre économique'],
    howToUse: ['Utiliser chaque produit selon son usage', 'Lire les indications sur les emballages', 'Ranger dans un endroit accessible et sec'],
    precautions: ['Respecter les consignes de chaque produit', 'Tenir hors de portée des enfants', 'Demander conseil en cas de doute'],
  },
];

function money(value: number) {
  return new Prisma.Decimal(value);
}

async function main() {
  const categoryByName = new Map<string, string>();

  for (const [index, name] of categories.entries()) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {
        slug: slugify(name),
        sortOrder: index + 1,
      },
      create: {
        name,
        slug: slugify(name),
        sortOrder: index + 1,
      },
    });
    categoryByName.set(category.name, category.id);
  }

  for (const product of products) {
    const categoryId = categoryByName.get(product.category);
    if (!categoryId) throw new Error(`Missing category: ${product.category}`);

    const existing = await prisma.product.findFirst({
      where: { name: product.name },
      select: { id: true },
    });

    const data = {
      name: product.name,
      brand: product.brand,
      categoryId,
      description: product.description,
      fullDescription: product.fullDescription,
      price: money(product.price),
      originalPrice: product.originalPrice == null ? null : money(product.originalPrice),
      badge: product.badge ?? null,
      rating: new Prisma.Decimal(product.rating),
      reviewCount: product.reviewCount,
      inStock: true,
      ingredients: product.ingredients,
      howToUse: product.howToUse,
      precautions: product.precautions,
    };

    const saved = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  console.log(`Default product image fallback: ${DEFAULT_PRODUCT_IMAGE}`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
