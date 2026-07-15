const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Setting = require('../models/Setting');

require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté');
    
    await User.deleteMany();
    await Product.deleteMany();
    await Setting.deleteMany();
    
    await User.create({
      name: 'Admin Principal',
      email: 'admin@boutique.dz',
      password: 'admin123',
      role: 'admin',
      phone: '0550 00 00 00'
    });
    
    await User.insertMany([
      { name: 'Karim Benali', email: 'karim@boutique.dz', password: 'confirmer123', role: 'confirmer', phone: '0551 11 11 11', assignedWilayas: ['Alger','Blida','Boumerdès'], performance: { totalLeads:45, confirmed:32, noAnswer:8, notInterested:5, conversionRate:71 } },
      { name: 'Sarah Merabet', email: 'sarah@boutique.dz', password: 'confirmer123', role: 'confirmer', phone: '0552 22 22 22', assignedWilayas: ['Oran','Mostaganem','Mascara'], performance: { totalLeads:38, confirmed:24, noAnswer:9, notInterested:5, conversionRate:63 } },
      { name: 'Amine Kaci', email: 'amine@boutique.dz', password: 'confirmer123', role: 'confirmer', phone: '0553 33 33 33', assignedWilayas: ['Constantine','Annaba','Guelma'], performance: { totalLeads:52, confirmed:28, noAnswer:15, notInterested:9, conversionRate:54 } }
    ]);
    
    await Product.insertMany([
      { name: 'Sneakers Premium Air', description: 'Sneakers légères avec technologie d\'amorti avancée.', price: 4500, oldPrice: 6500, stock: 24, category: 'Chaussures', images: ['👟'], features: ['Semelle amortissante','Matière respirante','Design tendance'], salesCount: 89 },
      { name: 'Veste Hiver Élégante', description: 'Veste chaude avec doublure polaire.', price: 6900, oldPrice: 9900, stock: 12, category: 'Vêtements', images: ['🧥'], features: ['Doublure polaire','Capuche amovible','Imperméable'], salesCount: 64 },
      { name: 'Sac Cuir Premium', description: 'Sac en cuir véritable avec finitions haut de gamme.', price: 3200, oldPrice: 4500, stock: 3, category: 'Accessoires', images: ['👜'], features: ['Cuir véritable','Finitions dorées','Bandoulière ajustable'], salesCount: 52 },
      { name: 'Montre Classique Gold', description: 'Montre élégante avec bracelet doré.', price: 2800, oldPrice: 3900, stock: 18, category: 'Montres', images: ['⌚'], features: ['Mouvement quartz','Verre saphir','Étanche 30m'], salesCount: 41 }
    ]);
    
    await Setting.create({
      brandName: 'Ma Boutique Algérienne',
      brandLogo: '👕',
      brandDescription: 'Boutique de vêtements premium en Algérie',
      contactPhone: '0550 12 34 56',
      delivery: { freeWilayas: ['Alger','Oran','Constantine'], deliveryFee: 500, estimatedDays: '24-48h' }
    });
    
    console.log('✅ Seed terminé !');
    console.log('Admin: admin@boutique.dz / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

seedData();