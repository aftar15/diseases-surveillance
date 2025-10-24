const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple disease data for seeding from diseases.md
const diseases = [
  // Communicable Diseases
  { name: 'Tuberculosis', category: 'communicable' },
  { name: 'Acute Bloody Diarrhea', category: 'communicable' },
  { name: 'Dengue', category: 'communicable' },
  { name: 'Measles', category: 'communicable' },
  { name: 'Influenza', category: 'communicable' },
  { name: 'Chicken Pox', category: 'communicable' },
  { name: 'HIV', category: 'communicable' },
  { name: 'STI (Sexually Transmitted Infections)', category: 'communicable' },
  { name: 'Rabies', category: 'communicable' },
  { name: 'Soil Transmitted Helminthiasis', category: 'communicable' },
  
  // Non-Communicable Diseases
  { name: 'Hypertension', category: 'non_communicable' },
  { name: 'Diabetes Mellitus', category: 'non_communicable' },
  { name: 'Breast Cancer', category: 'non_communicable' },
  { name: 'Cervical Cancer', category: 'non_communicable' },
  { name: 'Cataract', category: 'non_communicable' },
  { name: 'Mental Disorders (all types)', category: 'non_communicable' },
  { name: 'Acute Febrile Disorders', category: 'non_communicable' },
  { name: 'Chronic Kidney Disease', category: 'non_communicable' },
  { name: 'Lung Disease', category: 'non_communicable' },
  { name: 'Asthma', category: 'non_communicable' },
  { name: 'COPD (Chronic Obstructive Pulmonary Disease)', category: 'non_communicable' },
];

// Common symptoms for different disease categories
const communicableSymptoms = [
  { name: 'High Fever', severity: 'severe' },
  { name: 'Cough', severity: 'moderate' },
  { name: 'Headache', severity: 'moderate' },
  { name: 'Fatigue', severity: 'mild' },
  { name: 'Body Aches', severity: 'moderate' },
  { name: 'Nausea', severity: 'mild' },
  { name: 'Vomiting', severity: 'moderate' },
  { name: 'Diarrhea', severity: 'moderate' },
  { name: 'Skin Rash', severity: 'mild' },
  { name: 'Sore Throat', severity: 'mild' },
];

const nonCommunicableSymptoms = [
  { name: 'Chronic Pain', severity: 'moderate' },
  { name: 'Shortness of Breath', severity: 'moderate' },
  { name: 'Chest Pain', severity: 'moderate' },
  { name: 'Dizziness', severity: 'mild' },
  { name: 'Blurred Vision', severity: 'moderate' },
  { name: 'Frequent Urination', severity: 'mild' },
  { name: 'Excessive Thirst', severity: 'mild' },
  { name: 'Weight Loss', severity: 'moderate' },
  { name: 'Swelling', severity: 'moderate' },
  { name: 'Mood Changes', severity: 'moderate' },
];

// Dengue-specific symptoms (to maintain compatibility)
const dengueSymptoms = [
  { name: 'High Fever', severity: 'severe' },
  { name: 'Severe Headache', severity: 'severe' },
  { name: 'Pain Behind Eyes', severity: 'moderate' },
  { name: 'Joint/Muscle Pain', severity: 'moderate' },
  { name: 'Skin Rash', severity: 'mild' },
  { name: 'Mild Bleeding', severity: 'severe' },
  { name: 'Nausea/Vomiting', severity: 'moderate' },
];

async function seedSimpleDiseases() {
  console.log('🌱 Starting simple disease seeding...');

  try {
    // Create all symptoms first
    console.log('Creating symptoms...');
    const allSymptoms = [...communicableSymptoms, ...nonCommunicableSymptoms, ...dengueSymptoms];
    
    // Remove duplicates based on name
    const uniqueSymptoms = allSymptoms.filter((symptom, index, self) => 
      index === self.findIndex(s => s.name === symptom.name)
    );

    for (const symptom of uniqueSymptoms) {
      await prisma.symptom.upsert({
        where: { name: symptom.name },
        update: {},
        create: {
          name: symptom.name,
          severity: symptom.severity,
        }
      });
    }

    console.log(`✅ Created ${uniqueSymptoms.length} symptoms`);

    // Create diseases
    console.log('Creating diseases...');
    for (const disease of diseases) {
      const createdDisease = await prisma.disease.upsert({
        where: { name: disease.name },
        update: {},
        create: {
          name: disease.name,
          category: disease.category,
          description: `${disease.category === 'communicable' ? 'Communicable' : 'Non-communicable'} disease: ${disease.name}`,
        }
      });

      // Link symptoms to diseases based on category
      let symptomsToLink = [];
      
      if (disease.name === 'Dengue') {
        // Special case for dengue to maintain existing functionality
        symptomsToLink = dengueSymptoms.map(s => s.name);
      } else if (disease.category === 'communicable') {
        // Randomly assign 3-5 communicable symptoms
        const shuffled = communicableSymptoms.sort(() => 0.5 - Math.random());
        symptomsToLink = shuffled.slice(0, Math.floor(Math.random() * 3) + 3).map(s => s.name);
      } else {
        // Randomly assign 3-5 non-communicable symptoms
        const shuffled = nonCommunicableSymptoms.sort(() => 0.5 - Math.random());
        symptomsToLink = shuffled.slice(0, Math.floor(Math.random() * 3) + 3).map(s => s.name);
      }

      // Link symptoms to disease
      for (const symptomName of symptomsToLink) {
        const symptom = await prisma.symptom.findUnique({
          where: { name: symptomName }
        });

        if (symptom) {
          await prisma.diseaseSymptom.upsert({
            where: {
              diseaseId_symptomId: {
                diseaseId: createdDisease.id,
                symptomId: symptom.id,
              }
            },
            update: {},
            create: {
              diseaseId: createdDisease.id,
              symptomId: symptom.id,
              isCommon: Math.random() > 0.5, // Randomly mark as common
            }
          });
        }
      }

      console.log(`✅ Created disease: ${disease.name} with ${symptomsToLink.length} symptoms`);
    }

    console.log('🎉 Disease seeding completed successfully!');
    
    // Print summary
    const diseaseCount = await prisma.disease.count();
    const symptomCount = await prisma.symptom.count();
    const connectionCount = await prisma.diseaseSymptom.count();
    
    console.log(`📊 Summary:
    - Diseases: ${diseaseCount}
    - Symptoms: ${symptomCount}  
    - Disease-Symptom connections: ${connectionCount}
    
    🔍 Disease Categories:
    - Communicable: ${diseases.filter(d => d.category === 'communicable').length}
    - Non-communicable: ${diseases.filter(d => d.category === 'non_communicable').length}`);

  } catch (error) {
    console.error('❌ Error seeding diseases:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedSimpleDiseases()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedSimpleDiseases };
