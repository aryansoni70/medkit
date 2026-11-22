import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MedKit Development Seed (Indore & National)...');

  // Clean existing data for deterministic test environment
  await prisma.stockAuditLog.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.pharmacyDocument.deleteMany();
  await prisma.pharmacyInventory.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create System Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@medkit.in',
      passwordHash: adminPasswordHash,
      phone: '+91 98100 00001',
      role: 'ADMIN'
    }
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'customer@medkit.in',
      passwordHash,
      phone: '+91 98200 12345',
      role: 'CUSTOMER'
    }
  });

  const pharmacyOwners = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Dr. Suresh Gupta',
        email: 'apollo.vijaynagar@medkit.in',
        passwordHash,
        phone: '+91 731 255 1101',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Manish Verma',
        email: 'medplus.palasia@medkit.in',
        passwordHash,
        phone: '+91 731 405 2233',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rajendra Patidar',
        email: 'noble.bhawarkua@medkit.in',
        passwordHash,
        phone: '+91 731 246 8899',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sunil Agrawal',
        email: 'dawabazar.indore@medkit.in',
        passwordHash,
        phone: '+91 731 252 7700',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Anand Shrivastava',
        email: 'sanjivani.geetabhawan@medkit.in',
        passwordHash,
        phone: '+91 731 249 5544',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Deepak Joshi',
        email: 'wellness.annapurna@medkit.in',
        passwordHash,
        phone: '+91 731 278 9911',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Vikas Chouhan',
        email: 'lifeline.mr10@medkit.in',
        passwordHash,
        phone: '+91 731 498 7766',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Pravin Jain',
        email: 'shreeji.rajwada@medkit.in',
        passwordHash,
        phone: '+91 731 253 4422',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rohit Khandelwal',
        email: 'chhappan.chemist@medkit.in',
        passwordHash,
        phone: '+91 731 254 3388',
        role: 'PHARMACY'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ramesh Patel',
        email: 'pending.chemist@medkit.in',
        passwordHash,
        phone: '+91 731 299 4455',
        role: 'PHARMACY'
      }
    })
  ]);

  // 2. Create Verified Pharmacies across Indore and Delhi
  const pharmacies = await Promise.all([
    // 0: Apollo Vijay Nagar, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[0].id,
        name: 'Apollo Pharmacy - Scheme 54, Vijay Nagar',
        address: 'UG-4, Scheme No. 54, Near Brilliant Convention Centre, Vijay Nagar',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452010',
        latitude: 22.7533,
        longitude: 75.8937,
        phone: '+91 731 255 1101',
        email: 'vijaynagar.apollo@medkit.in',
        openingHours: '24 Hours Open',
        licenseNumber: 'MP-IND-20B-102938/2021',
        verificationStatus: 'VERIFIED',
        rating: 4.9
      }
    }),

    // 1: MedPlus Old Palasia, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[1].id,
        name: 'MedPlus - Old Palasia',
        address: 'Shop 3-4, Industry House Complex, A.B. Road, Old Palasia',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452001',
        latitude: 22.7244,
        longitude: 75.8839,
        phone: '+91 731 405 2233',
        email: 'palasia.medplus@medkit.in',
        openingHours: '07:30 AM - 11:30 PM',
        licenseNumber: 'MP-IND-20B-482910/2020',
        verificationStatus: 'VERIFIED',
        rating: 4.7
      }
    }),

    // 2: Noble Chemist Bhawarkua, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[2].id,
        name: 'Noble Chemist & Super Store - Bhawarkua',
        address: '14/2, Tower Square, Bhawarkua Main Road, Near Bholaram Ustad Marg',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452014',
        latitude: 22.6926,
        longitude: 75.8676,
        phone: '+91 731 246 8899',
        email: 'bhawarkua.noble@medkit.in',
        openingHours: '08:00 AM - 12:00 AM',
        licenseNumber: 'MP-IND-20B-998822/2022',
        verificationStatus: 'VERIFIED',
        rating: 4.8
      }
    }),

    // 3: Indore Dawa Bazar Central Chemist, Chhoti Gwaltoli
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[3].id,
        name: 'Indore Dawa Bazar Central Chemist',
        address: 'Shop 11-12, Ground Floor, Dawa Bazar Complex, R.N.T. Marg',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452001',
        latitude: 22.7150,
        longitude: 75.8650,
        phone: '+91 731 252 7700',
        email: 'central.dawabazar@medkit.in',
        openingHours: '09:00 AM - 10:00 PM',
        licenseNumber: 'MP-IND-20B-771122/2019',
        verificationStatus: 'VERIFIED',
        rating: 4.9
      }
    }),

    // 4: Sanjivani Medical Store Geeta Bhawan, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[4].id,
        name: 'Sanjivani Medical Store - Geeta Bhawan Square',
        address: '18, Geeta Bhawan Square, Near Manoramaganj, A.B. Road',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452001',
        latitude: 22.7167,
        longitude: 75.8828,
        phone: '+91 731 249 5544',
        email: 'geetabhawan.sanjivani@medkit.in',
        openingHours: '24 Hours Open',
        licenseNumber: 'MP-IND-20B-665544/2020',
        verificationStatus: 'VERIFIED',
        rating: 4.6
      }
    }),

    // 5: Wellness Forever Annapurna Road, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[5].id,
        name: 'Wellness Forever 24x7 - Annapurna Road',
        address: 'Plot 22, Opp. Dussehra Maidan, Annapurna Main Road',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452009',
        latitude: 22.6974,
        longitude: 75.8322,
        phone: '+91 731 278 9911',
        email: 'annapurna.wellness@medkit.in',
        openingHours: '24 Hours Open',
        licenseNumber: 'MP-IND-20B-334411/2023',
        verificationStatus: 'VERIFIED',
        rating: 4.8
      }
    }),

    // 6: Lifeline Chemist MR-10 / Bapat Square, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[6].id,
        name: 'Lifeline Chemist - MR-10 & Bapat Square',
        address: 'Shop 5, Silver Mall, Near Bapat Square, Sukhlia, MR-10',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452010',
        latitude: 22.7661,
        longitude: 75.8753,
        phone: '+91 731 498 7766',
        email: 'bapat.lifeline@medkit.in',
        openingHours: '08:00 AM - 11:00 PM',
        licenseNumber: 'MP-IND-20B-552233/2021',
        verificationStatus: 'VERIFIED',
        rating: 4.7
      }
    }),

    // 7: Shreeji Pharmacy Rajwada, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[7].id,
        name: 'Shreeji Pharmacy & Medical Store - Rajwada',
        address: '45, M.G. Road, Near Rajwada Palace & Sarafa',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452002',
        latitude: 22.7185,
        longitude: 75.8550,
        phone: '+91 731 253 4422',
        email: 'rajwada.shreeji@medkit.in',
        openingHours: '08:30 AM - 10:30 PM',
        licenseNumber: 'MP-IND-20B-887766/2022',
        verificationStatus: 'VERIFIED',
        rating: 4.6
      }
    }),

    // 8: Chhappan Chemist & Healthcare - New Palasia, Indore
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[8].id,
        name: 'Chhappan Chemist & Healthcare - New Palasia',
        address: '12, Near 56 Dukan (Chhappan Dukan), New Palasia',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452001',
        latitude: 22.7225,
        longitude: 75.8785,
        phone: '+91 731 254 3388',
        email: 'chhappan.chemist@medkit.in',
        openingHours: '09:00 AM - 11:30 PM',
        licenseNumber: 'MP-IND-20B-114477/2023',
        verificationStatus: 'VERIFIED',
        rating: 4.8
      }
    }),

    // 9: Pending Verification Pharmacy in Indore (for admin demo approvals)
    prisma.pharmacy.create({
      data: {
        ownerId: pharmacyOwners[9].id,
        name: 'Patel Medicose - Sudama Nagar, Indore',
        address: 'Sector E, Near Footi Kothi, Sudama Nagar',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452009',
        latitude: 22.6890,
        longitude: 75.8280,
        phone: '+91 731 299 4455',
        email: 'sudamanagar.patel@medkit.in',
        openingHours: '09:00 AM - 10:00 PM',
        licenseNumber: 'MP-IND-20B-991133/2024',
        verificationStatus: 'PENDING',
        rating: 4.3
      }
    })
  ]);

  // 3. Indian Medicine Catalogue (Verified data modelled on ABDM, CDSCO, and NPPA)
  const medicineCatalogue = [
    // Pain Relief / Antipyretic
    {
      registryCode: 'IN-CDSCO-00101',
      brandName: 'Dolo 650',
      genericName: 'Paracetamol',
      activeIngredients: JSON.stringify(['Paracetamol IP 650mg']),
      strength: '650 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Micro Labs Ltd',
      packSize: '15 Tablets in a strip',
      prescriptionCategory: 'OTC',
      category: 'Pain relief',
      description: 'Widely recommended for fever, headache, body ache, and mild to moderate pain relief.'
    },
    {
      registryCode: 'IN-CDSCO-00102',
      brandName: 'Calpol 500',
      genericName: 'Paracetamol',
      activeIngredients: JSON.stringify(['Paracetamol IP 500mg']),
      strength: '500 mg',
      dosageForm: 'Tablet',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
      packSize: '15 Tablets in a strip',
      prescriptionCategory: 'OTC',
      category: 'Pain relief',
      description: 'Used for reducing fever and relieving mild to moderate headache and muscular aches.'
    },
    {
      registryCode: 'IN-CDSCO-00103',
      brandName: 'Combiflam',
      genericName: 'Ibuprofen + Paracetamol',
      activeIngredients: JSON.stringify(['Ibuprofen IP 400mg', 'Paracetamol IP 325mg']),
      strength: '400mg + 325mg',
      dosageForm: 'Tablet',
      manufacturer: 'Sanofi India Ltd',
      packSize: '20 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Pain relief',
      description: 'Dual-action NSAID and analgesic for rapid relief from acute inflammation, dental, and joint pain.'
    },
    {
      registryCode: 'IN-CDSCO-00104',
      brandName: 'Meftal-Spas',
      genericName: 'Mefenamic Acid + Dicyclomine',
      activeIngredients: JSON.stringify(['Mefenamic Acid IP 250mg', 'Dicyclomine Hydrochloride IP 10mg']),
      strength: '250mg + 10mg',
      dosageForm: 'Tablet',
      manufacturer: 'Blue Cross Laboratories Ltd',
      packSize: '10 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Pain relief',
      description: 'Relief of abdominal spasm, menstrual cramps, colic pain, and intestinal spasms.'
    },

    // Antibiotics & Anti-Infectives
    {
      registryCode: 'IN-CDSCO-00201',
      brandName: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Clavulanic Acid',
      activeIngredients: JSON.stringify(['Amoxicillin IP 500mg', 'Clavulanic Acid IP 125mg']),
      strength: '500mg + 125mg',
      dosageForm: 'Tablet',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
      packSize: '10 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H1',
      category: 'Antibiotics',
      description: 'Broad-spectrum antibacterial for respiratory tract, ENT, skin, and urinary tract infections.'
    },
    {
      registryCode: 'IN-CDSCO-00202',
      brandName: 'Azithral 500',
      genericName: 'Azithromycin',
      activeIngredients: JSON.stringify(['Azithromycin Dihydrate IP 500mg']),
      strength: '500 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Alembic Pharmaceuticals Ltd',
      packSize: '5 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H1',
      category: 'Antibiotics',
      description: 'Macrolide antibiotic indicated for community-acquired pneumonia, sinusitis, and throat infections.'
    },
    {
      registryCode: 'IN-CDSCO-00203',
      brandName: 'Ciplox 500',
      genericName: 'Ciprofloxacin',
      activeIngredients: JSON.stringify(['Ciprofloxacin Hydrochloride IP 500mg']),
      strength: '500 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Cipla Ltd',
      packSize: '10 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H1',
      category: 'Antibiotics',
      description: 'Fluoroquinolone antibacterial agent indicated for complicated enteric, bone, and urinary infections.'
    },

    // Gastrointestinal & Digestive Health
    {
      registryCode: 'IN-CDSCO-00301',
      brandName: 'Pan-D',
      genericName: 'Pantoprazole + Domperidone',
      activeIngredients: JSON.stringify(['Pantoprazole Sodium IP 40mg (Gastro-resistant)', 'Domperidone IP 30mg (Prolonged release)']),
      strength: '40mg + 30mg',
      dosageForm: 'Capsule',
      manufacturer: 'Alkem Laboratories Ltd',
      packSize: '15 Capsules in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Digestive health',
      description: 'Combination PPI and prokinetic agent for gastroesophageal reflux disease (GERD) and hyperacidity.'
    },
    {
      registryCode: 'IN-CDSCO-00302',
      brandName: 'Omez 20',
      genericName: 'Omeprazole',
      activeIngredients: JSON.stringify(['Omeprazole IP 20mg']),
      strength: '20 mg',
      dosageForm: 'Capsule',
      manufacturer: 'Dr. Reddy’s Laboratories Ltd',
      packSize: '20 Capsules in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Digestive health',
      description: 'Proton-pump inhibitor for gastric and duodenal ulcers, Zollinger-Ellison syndrome, and erosive esophagitis.'
    },
    {
      registryCode: 'IN-CDSCO-00303',
      brandName: 'Digene Gel Mint Flavour',
      genericName: 'Magnesium Hydroxide + Aluminium Hydroxide + Simethicone',
      activeIngredients: JSON.stringify(['Magnesium Hydroxide IP 185mg', 'Aluminium Hydroxide Gel IP 830mg', 'Simethicone IP 50mg']),
      strength: '200ml Bottle',
      dosageForm: 'Syrup',
      manufacturer: 'Abbott Healthcare Pvt Ltd',
      packSize: '200ml Oral Suspension',
      prescriptionCategory: 'OTC',
      category: 'Digestive health',
      description: 'Scientifically proven antacid and antiflatulent suspension for immediate heartburn and gas relief.'
    },

    // Respiratory & Allergy
    {
      registryCode: 'IN-CDSCO-00401',
      brandName: 'Allegra 120mg',
      genericName: 'Fexofenadine Hydrochloride',
      activeIngredients: JSON.stringify(['Fexofenadine Hydrochloride IP 120mg']),
      strength: '120 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Sanofi India Ltd',
      packSize: '10 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Respiratory',
      description: 'Non-sedating second-generation antihistamine for seasonal allergic rhinitis and chronic urticaria.'
    },
    {
      registryCode: 'IN-CDSCO-00402',
      brandName: 'Montair-LC',
      genericName: 'Levocetirizine + Montelukast',
      activeIngredients: JSON.stringify(['Levocetirizine Dihydrochloride IP 5mg', 'Montelukast Sodium IP 10mg']),
      strength: '5mg + 10mg',
      dosageForm: 'Tablet',
      manufacturer: 'Cipla Ltd',
      packSize: '10 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Respiratory',
      description: 'Dual anti-allergy and leukotriene receptor antagonist for seasonal allergic asthma and rhinitis.'
    },
    {
      registryCode: 'IN-CDSCO-00403',
      brandName: 'Asthalin Inhaler 100mcg',
      genericName: 'Salbutamol',
      activeIngredients: JSON.stringify(['Salbutamol Sulphate IP 100mcg per actuation']),
      strength: '100 mcg',
      dosageForm: 'Inhaler',
      manufacturer: 'Cipla Ltd',
      packSize: '200 Metered Doses Canister',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Respiratory',
      description: 'Fast-acting bronchodilator for relieving bronchospasm in asthma and chronic obstructive airway disease.'
    },

    // Vitamins & Nutritional Supplements
    {
      registryCode: 'IN-CDSCO-00501',
      brandName: 'Becosules Z',
      genericName: 'B-Complex Forte with Vitamin C and Zinc',
      activeIngredients: JSON.stringify(['Thiamine IP 10mg', 'Riboflavin IP 10mg', 'Pyridoxine IP 3mg', 'Vitamin C IP 150mg', 'Zinc Sulphate 41.4mg']),
      strength: 'Standard Forte',
      dosageForm: 'Capsule',
      manufacturer: 'Pfizer Ltd',
      packSize: '20 Capsules in a strip',
      prescriptionCategory: 'OTC',
      category: 'Vitamins and supplements',
      description: 'Essential multivitamin complex for fatigue recovery, oral ulcers, immunity, and tissue regeneration.'
    },
    {
      registryCode: 'IN-CDSCO-00502',
      brandName: 'Shelcal 500',
      genericName: 'Calcium Carbonate + Vitamin D3',
      activeIngredients: JSON.stringify(['Elemental Calcium 500mg', 'Vitamin D3 IP 250 IU']),
      strength: '500 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Torrent Pharmaceuticals Ltd',
      packSize: '15 Tablets in a strip',
      prescriptionCategory: 'OTC',
      category: 'Vitamins and supplements',
      description: 'High bioavailable elemental calcium with Vitamin D3 for bone mineral density and joint strength.'
    },
    {
      registryCode: 'IN-CDSCO-00503',
      brandName: 'Neurobion Forte',
      genericName: 'Vitamin B1 + B6 + B12',
      activeIngredients: JSON.stringify(['Vitamin B1 10mg', 'Vitamin B6 3mg', 'Vitamin B12 15mcg', 'Nicotinamide 45mg']),
      strength: 'Standard',
      dosageForm: 'Tablet',
      manufacturer: 'Procter & Gamble Health Ltd',
      packSize: '30 Tablets in a strip',
      prescriptionCategory: 'OTC',
      category: 'Vitamins and supplements',
      description: 'Neurotropic B vitamins support healthy nerve conduction and alleviate tingling and numbness.'
    },

    // First Aid & Wound Care
    {
      registryCode: 'IN-CDSCO-00601',
      brandName: 'Betadine 10% Ointment',
      genericName: 'Povidone-Iodine',
      activeIngredients: JSON.stringify(['Povidone-Iodine IP 10% w/w']),
      strength: '10% w/w',
      dosageForm: 'Ointment',
      manufacturer: 'Win-Medicare Pvt Ltd',
      packSize: '20g Tube',
      prescriptionCategory: 'OTC',
      category: 'First aid',
      description: 'Topical microbicidal antiseptic ointment for prevention and treatment of wound infections, cuts, and burns.'
    },
    {
      registryCode: 'IN-CDSCO-00602',
      brandName: 'Electral ORS Powder',
      genericName: 'Oral Rehydration Salts IP (WHO Formulation)',
      activeIngredients: JSON.stringify(['Sodium Chloride IP 2.6g', 'Potassium Chloride IP 1.5g', 'Sodium Citrate IP 2.9g', 'Dextrose Anhydrous IP 13.5g']),
      strength: '21.8g Sachet',
      dosageForm: 'Powder',
      manufacturer: 'FDC Ltd',
      packSize: '21.8g Sachet (dilute in 1 Litre water)',
      prescriptionCategory: 'OTC',
      category: 'First aid',
      description: 'Standard WHO recommended oral rehydration formulation for rapid electrolyte and fluid replenishment.'
    },

    // Cardiovascular & Chronic Care
    {
      registryCode: 'IN-CDSCO-00701',
      brandName: 'Telma 40',
      genericName: 'Telmisartan',
      activeIngredients: JSON.stringify(['Telmisartan IP 40mg']),
      strength: '40 mg',
      dosageForm: 'Tablet',
      manufacturer: 'Glenmark Pharmaceuticals Ltd',
      packSize: '30 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Cardiovascular',
      description: 'Angiotensin II receptor antagonist (ARB) for management of essential hypertension.'
    },
    {
      registryCode: 'IN-CDSCO-00702',
      brandName: 'Glycomet 500 SR',
      genericName: 'Metformin Hydrochloride',
      activeIngredients: JSON.stringify(['Metformin Hydrochloride IP 500mg (Sustained Release)']),
      strength: '500 mg SR',
      dosageForm: 'Tablet',
      manufacturer: 'USV Pvt Ltd',
      packSize: '20 Tablets in a strip',
      prescriptionCategory: 'SCHEDULE_H',
      category: 'Diabetes',
      description: 'First-line biguanide oral antihyperglycemic for type 2 diabetes mellitus control.'
    }
  ];

  const createdMedicines = [];
  for (const item of medicineCatalogue) {
    const med = await prisma.medicine.create({
      data: item
    });
    createdMedicines.push(med);
  }

  console.log(`✅ Seeded ${createdMedicines.length} standard Indian medicine catalogue records`);

  // 4. Create Pharmacy Inventories across stores in Indore with real prices and stock status
  // medIdx 0 = Dolo 650, 1 = Calpol 500, 2 = Combiflam, 3 = Meftal-Spas, 4 = Augmentin 625, 5 = Azithral 500...
  const inventorySetup = [
    // 0: Apollo Vijay Nagar, Indore
    { pharmacyIdx: 0, medIdx: 0, qty: 95, price: 30.00, mrp: 33.50, hoursAgo: 1 }, // Dolo 650 (Fresh)
    { pharmacyIdx: 0, medIdx: 1, qty: 60, price: 14.00, mrp: 16.00, hoursAgo: 2 }, // Calpol 500
    { pharmacyIdx: 0, medIdx: 2, qty: 45, price: 41.50, mrp: 45.00, hoursAgo: 1 }, // Combiflam
    { pharmacyIdx: 0, medIdx: 4, qty: 30, price: 195.00, mrp: 215.00, hoursAgo: 3 }, // Augmentin 625
    { pharmacyIdx: 0, medIdx: 5, qty: 25, price: 110.00, mrp: 125.00, hoursAgo: 2 }, // Azithral 500
    { pharmacyIdx: 0, medIdx: 7, qty: 50, price: 180.00, mrp: 205.00, hoursAgo: 1 }, // Pan-D
    { pharmacyIdx: 0, medIdx: 10, qty: 35, price: 210.00, mrp: 225.00, hoursAgo: 2 }, // Allegra 120
    { pharmacyIdx: 0, medIdx: 12, qty: 20, price: 160.00, mrp: 175.00, hoursAgo: 1 }, // Asthalin Inhaler
    { pharmacyIdx: 0, medIdx: 13, qty: 80, price: 48.00, mrp: 52.00, hoursAgo: 2 }, // Becosules Z
    { pharmacyIdx: 0, medIdx: 17, qty: 150, price: 21.00, mrp: 23.50, hoursAgo: 1 }, // Electral ORS

    // 1: MedPlus Old Palasia, Indore
    { pharmacyIdx: 1, medIdx: 0, qty: 110, price: 28.50, mrp: 33.50, hoursAgo: 1 }, // Dolo 650 (Best Price)
    { pharmacyIdx: 1, medIdx: 1, qty: 85, price: 13.50, mrp: 16.00, hoursAgo: 1 }, // Calpol 500
    { pharmacyIdx: 1, medIdx: 2, qty: 30, price: 42.00, mrp: 45.00, hoursAgo: 3 }, // Combiflam
    { pharmacyIdx: 1, medIdx: 4, qty: 40, price: 192.00, mrp: 215.00, hoursAgo: 2 }, // Augmentin 625
    { pharmacyIdx: 1, medIdx: 5, qty: 30, price: 112.00, mrp: 125.00, hoursAgo: 1 }, // Azithral 500
    { pharmacyIdx: 1, medIdx: 7, qty: 65, price: 178.00, mrp: 205.00, hoursAgo: 2 }, // Pan-D
    { pharmacyIdx: 1, medIdx: 9, qty: 40, price: 135.00, mrp: 150.00, hoursAgo: 4 }, // Digene Gel
    { pharmacyIdx: 1, medIdx: 14, qty: 75, price: 122.00, mrp: 140.00, hoursAgo: 2 }, // Shelcal 500
    { pharmacyIdx: 1, medIdx: 17, qty: 100, price: 20.00, mrp: 23.50, hoursAgo: 1 }, // Electral
    { pharmacyIdx: 1, medIdx: 18, qty: 45, price: 238.00, mrp: 270.00, hoursAgo: 2 }, // Telma 40

    // 2: Noble Chemist Bhawarkua, Indore
    { pharmacyIdx: 2, medIdx: 0, qty: 70, price: 29.00, mrp: 33.50, hoursAgo: 2 }, // Dolo 650
    { pharmacyIdx: 2, medIdx: 3, qty: 40, price: 47.00, mrp: 53.00, hoursAgo: 1 }, // Meftal-Spas
    { pharmacyIdx: 2, medIdx: 4, qty: 25, price: 198.00, mrp: 215.00, hoursAgo: 4 }, // Augmentin 625
    { pharmacyIdx: 2, medIdx: 6, qty: 50, price: 42.00, mrp: 48.00, hoursAgo: 2 }, // Ciplox 500
    { pharmacyIdx: 2, medIdx: 8, qty: 60, price: 61.00, mrp: 70.00, hoursAgo: 2 }, // Omez 20
    { pharmacyIdx: 2, medIdx: 11, qty: 35, price: 185.00, mrp: 205.00, hoursAgo: 3 }, // Montair-LC
    { pharmacyIdx: 2, medIdx: 13, qty: 90, price: 47.00, mrp: 52.00, hoursAgo: 1 }, // Becosules Z
    { pharmacyIdx: 2, medIdx: 16, qty: 40, price: 110.00, mrp: 125.00, hoursAgo: 2 }, // Betadine Ointment
    { pharmacyIdx: 2, medIdx: 17, qty: 120, price: 20.50, mrp: 23.50, hoursAgo: 1 }, // Electral
    { pharmacyIdx: 2, medIdx: 19, qty: 60, price: 43.00, mrp: 50.00, hoursAgo: 3 }, // Glycomet 500

    // 3: Indore Dawa Bazar Central Chemist, Chhoti Gwaltoli
    { pharmacyIdx: 3, medIdx: 0, qty: 200, price: 28.00, mrp: 33.50, hoursAgo: 1 }, // Dolo 650 (Wholesale rate)
    { pharmacyIdx: 3, medIdx: 1, qty: 150, price: 13.00, mrp: 16.00, hoursAgo: 1 }, // Calpol 500
    { pharmacyIdx: 3, medIdx: 2, qty: 100, price: 40.00, mrp: 45.00, hoursAgo: 2 }, // Combiflam
    { pharmacyIdx: 3, medIdx: 4, qty: 80, price: 188.00, mrp: 215.00, hoursAgo: 1 }, // Augmentin 625
    { pharmacyIdx: 3, medIdx: 5, qty: 60, price: 108.00, mrp: 125.00, hoursAgo: 1 }, // Azithral 500
    { pharmacyIdx: 3, medIdx: 7, qty: 90, price: 175.00, mrp: 205.00, hoursAgo: 2 }, // Pan-D
    { pharmacyIdx: 3, medIdx: 10, qty: 50, price: 205.00, mrp: 225.00, hoursAgo: 1 }, // Allegra 120
    { pharmacyIdx: 3, medIdx: 12, qty: 45, price: 158.00, mrp: 175.00, hoursAgo: 1 }, // Asthalin
    { pharmacyIdx: 3, medIdx: 14, qty: 120, price: 120.00, mrp: 140.00, hoursAgo: 1 }, // Shelcal 500
    { pharmacyIdx: 3, medIdx: 18, qty: 80, price: 235.00, mrp: 270.00, hoursAgo: 2 }, // Telma 40

    // 4: Sanjivani Geeta Bhawan, Indore
    { pharmacyIdx: 4, medIdx: 0, qty: 65, price: 29.50, mrp: 33.50, hoursAgo: 2 }, // Dolo 650
    { pharmacyIdx: 4, medIdx: 2, qty: 4, price: 43.00, mrp: 45.00, hoursAgo: 7 }, // Combiflam (Low Stock)
    { pharmacyIdx: 4, medIdx: 5, qty: 20, price: 114.00, mrp: 125.00, hoursAgo: 3 }, // Azithral 500
    { pharmacyIdx: 4, medIdx: 7, qty: 35, price: 182.00, mrp: 205.00, hoursAgo: 1 }, // Pan-D
    { pharmacyIdx: 4, medIdx: 9, qty: 25, price: 138.00, mrp: 150.00, hoursAgo: 2 }, // Digene Gel
    { pharmacyIdx: 4, medIdx: 13, qty: 45, price: 48.00, mrp: 52.00, hoursAgo: 3 }, // Becosules Z
    { pharmacyIdx: 4, medIdx: 16, qty: 30, price: 115.00, mrp: 125.00, hoursAgo: 1 }, // Betadine
    { pharmacyIdx: 4, medIdx: 17, qty: 80, price: 21.00, mrp: 23.50, hoursAgo: 2 }, // Electral

    // 5: Wellness Forever Annapurna Road, Indore
    { pharmacyIdx: 5, medIdx: 0, qty: 80, price: 31.00, mrp: 33.50, hoursAgo: 1 }, // Dolo 650
    { pharmacyIdx: 5, medIdx: 1, qty: 40, price: 14.50, mrp: 16.00, hoursAgo: 2 }, // Calpol 500
    { pharmacyIdx: 5, medIdx: 4, qty: 30, price: 200.00, mrp: 215.00, hoursAgo: 2 }, // Augmentin 625
    { pharmacyIdx: 5, medIdx: 5, qty: 25, price: 115.00, mrp: 125.00, hoursAgo: 1 }, // Azithral 500
    { pharmacyIdx: 5, medIdx: 10, qty: 20, price: 215.00, mrp: 225.00, hoursAgo: 2 }, // Allegra 120
    { pharmacyIdx: 5, medIdx: 12, qty: 15, price: 165.00, mrp: 175.00, hoursAgo: 1 }, // Asthalin
    { pharmacyIdx: 5, medIdx: 15, qty: 50, price: 38.00, mrp: 42.00, hoursAgo: 2 }, // Neurobion Forte
    { pharmacyIdx: 5, medIdx: 18, qty: 35, price: 245.00, mrp: 270.00, hoursAgo: 3 }, // Telma 40

    // 6: Lifeline Chemist MR-10 / Bapat Square, Indore
    { pharmacyIdx: 6, medIdx: 0, qty: 85, price: 29.50, mrp: 33.50, hoursAgo: 1 }, // Dolo 650
    { pharmacyIdx: 6, medIdx: 2, qty: 35, price: 42.00, mrp: 45.00, hoursAgo: 2 }, // Combiflam
    { pharmacyIdx: 6, medIdx: 4, qty: 25, price: 195.00, mrp: 215.00, hoursAgo: 3 }, // Augmentin 625
    { pharmacyIdx: 6, medIdx: 7, qty: 40, price: 180.00, mrp: 205.00, hoursAgo: 2 }, // Pan-D
    { pharmacyIdx: 6, medIdx: 11, qty: 30, price: 188.00, mrp: 205.00, hoursAgo: 2 }, // Montair-LC
    { pharmacyIdx: 6, medIdx: 14, qty: 55, price: 125.00, mrp: 140.00, hoursAgo: 1 }, // Shelcal 500
    { pharmacyIdx: 6, medIdx: 17, qty: 90, price: 21.00, mrp: 23.50, hoursAgo: 1 }, // Electral

    // 7: Shreeji Pharmacy Rajwada, Indore
    { pharmacyIdx: 7, medIdx: 0, qty: 50, price: 30.00, mrp: 33.50, hoursAgo: 2 }, // Dolo 650
    { pharmacyIdx: 7, medIdx: 3, qty: 30, price: 48.00, mrp: 53.00, hoursAgo: 1 }, // Meftal-Spas
    { pharmacyIdx: 7, medIdx: 6, qty: 40, price: 43.00, mrp: 48.00, hoursAgo: 2 }, // Ciplox 500
    { pharmacyIdx: 7, medIdx: 8, qty: 50, price: 62.00, mrp: 70.00, hoursAgo: 3 }, // Omez 20
    { pharmacyIdx: 7, medIdx: 13, qty: 70, price: 48.00, mrp: 52.00, hoursAgo: 2 }, // Becosules Z
    { pharmacyIdx: 7, medIdx: 16, qty: 35, price: 112.00, mrp: 125.00, hoursAgo: 1 }, // Betadine
    { pharmacyIdx: 7, medIdx: 19, qty: 45, price: 44.00, mrp: 50.00, hoursAgo: 2 }, // Glycomet 500

    // 8: Chhappan Chemist New Palasia, Indore
    { pharmacyIdx: 8, medIdx: 0, qty: 75, price: 29.00, mrp: 33.50, hoursAgo: 1 }, // Dolo 650
    { pharmacyIdx: 8, medIdx: 1, qty: 50, price: 14.00, mrp: 16.00, hoursAgo: 1 }, // Calpol 500
    { pharmacyIdx: 8, medIdx: 4, qty: 35, price: 194.00, mrp: 215.00, hoursAgo: 2 }, // Augmentin 625
    { pharmacyIdx: 8, medIdx: 5, qty: 25, price: 110.00, mrp: 125.00, hoursAgo: 1 }, // Azithral 500
    { pharmacyIdx: 8, medIdx: 10, qty: 30, price: 208.00, mrp: 225.00, hoursAgo: 2 }, // Allegra 120
    { pharmacyIdx: 8, medIdx: 17, qty: 110, price: 21.00, mrp: 23.50, hoursAgo: 1 }, // Electral

    // 9: Pending Patel Medicose Sudama Nagar (for admin demo)
    { pharmacyIdx: 9, medIdx: 0, qty: 30, price: 30.50, mrp: 33.50, hoursAgo: 12 },
    { pharmacyIdx: 9, medIdx: 1, qty: 20, price: 14.50, mrp: 16.00, hoursAgo: 12 }
  ];

  let totalInventoriesCreated = 0;
  for (const item of inventorySetup) {
    const pharmacy = pharmacies[item.pharmacyIdx];
    const medicine = createdMedicines[item.medIdx];
    const updatedDate = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);

    let stockStatus = 'IN_STOCK';
    if (item.qty === 0) stockStatus = 'OUT_OF_STOCK';
    else if (item.qty <= 5) stockStatus = 'LOW_STOCK';

    await prisma.pharmacyInventory.create({
      data: {
        pharmacyId: pharmacy.id,
        medicineId: medicine.id,
        quantity: item.qty,
        price: item.price,
        mrp: item.mrp,
        stockStatus,
        createdAt: updatedDate,
        updatedAt: updatedDate
      }
    });

    // Create corresponding audit log
    await prisma.stockAuditLog.create({
      data: {
        pharmacyId: pharmacy.id,
        medicineId: medicine.id,
        previousQuantity: Math.max(0, item.qty - 10),
        newQuantity: item.qty,
        previousPrice: item.price,
        newPrice: item.price,
        updatedBy: 'seed@medkit.in',
        createdAt: updatedDate
      }
    });

    totalInventoriesCreated++;
  }

  console.log(`✅ Seeded ${totalInventoriesCreated} inventory listings with verified stock status and audit logs`);

  // 5. Seed an active test reservation in Indore
  await prisma.reservation.create({
    data: {
      customerId: customerUser.id,
      pharmacyId: pharmacies[0].id,
      medicineId: createdMedicines[0].id,
      quantity: 2,
      status: 'CONFIRMED',
      expiresAt: new Date(Date.now() + 90 * 60 * 1000) // expires in 90 mins
    }
  });

  console.log(`✅ Seeded test reservation for Apollo Vijay Nagar, Indore`);
  console.log(`🎉 MedKit development dataset ready!`);
  console.log(`--------------------------------------------------------`);
  console.log(`🔑 Admin Login:      admin@medkit.in    / admin123`);
  console.log(`🔑 Pharmacy Login:   apollo.vijaynagar@medkit.in / password123`);
  console.log(`🔑 Customer Login:   customer@medkit.in / password123`);
  console.log(`--------------------------------------------------------`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
