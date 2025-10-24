import { PrismaClient, SymptomSeverity, DiseaseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Simple disease data for seeding from diseases.md
const diseases = [
  // Communicable Diseases
  { name: 'Tuberculosis', category: DiseaseCategory.communicable },
  { name: 'Acute Bloody Diarrhea', category: DiseaseCategory.communicable },
  { name: 'Dengue', category: DiseaseCategory.communicable },
  { name: 'Measles', category: DiseaseCategory.communicable },
  { name: 'Influenza', category: DiseaseCategory.communicable },
  { name: 'Chicken Pox', category: DiseaseCategory.communicable },
  { name: 'HIV', category: DiseaseCategory.communicable },
  { name: 'STI (Sexually Transmitted Infections)', category: DiseaseCategory.communicable },
  { name: 'Rabies', category: DiseaseCategory.communicable },
  { name: 'Soil Transmitted Helminthiasis', category: DiseaseCategory.communicable },
  
  // Non-Communicable Diseases
  { name: 'Hypertension', category: DiseaseCategory.non_communicable },
  { name: 'Diabetes Mellitus', category: DiseaseCategory.non_communicable },
  { name: 'Breast Cancer', category: DiseaseCategory.non_communicable },
  { name: 'Cervical Cancer', category: DiseaseCategory.non_communicable },
  { name: 'Cataract', category: DiseaseCategory.non_communicable },
  { name: 'Mental Disorders (all types)', category: DiseaseCategory.non_communicable },
  { name: 'Acute Febrile Disorders', category: DiseaseCategory.non_communicable },
  { name: 'Chronic Kidney Disease', category: DiseaseCategory.non_communicable },
  { name: 'Lung Disease', category: DiseaseCategory.non_communicable },
  { name: 'Asthma', category: DiseaseCategory.non_communicable },
  { name: 'COPD (Chronic Obstructive Pulmonary Disease)', category: DiseaseCategory.non_communicable },
];

// Common symptoms for different disease categories
const communicableSymptoms = [
  { name: 'High Fever', severity: SymptomSeverity.severe },
  { name: 'Cough', severity: SymptomSeverity.moderate },
  { name: 'Headache', severity: SymptomSeverity.moderate },
  { name: 'Fatigue', severity: SymptomSeverity.mild },
  { name: 'Body Aches', severity: SymptomSeverity.moderate },
  { name: 'Nausea', severity: SymptomSeverity.mild },
  { name: 'Vomiting', severity: SymptomSeverity.moderate },
  { name: 'Diarrhea', severity: SymptomSeverity.moderate },
  { name: 'Skin Rash', severity: SymptomSeverity.mild },
  { name: 'Sore Throat', severity: SymptomSeverity.mild },
];

const nonCommunicableSymptoms = [
  { name: 'Chronic Pain', severity: SymptomSeverity.moderate },
  { name: 'Shortness of Breath', severity: SymptomSeverity.moderate },
  { name: 'Chest Pain', severity: SymptomSeverity.moderate },
  { name: 'Dizziness', severity: SymptomSeverity.mild },
  { name: 'Blurred Vision', severity: SymptomSeverity.moderate },
  { name: 'Frequent Urination', severity: SymptomSeverity.mild },
  { name: 'Excessive Thirst', severity: SymptomSeverity.mild },
  { name: 'Weight Loss', severity: SymptomSeverity.moderate },
  { name: 'Swelling', severity: SymptomSeverity.moderate },
  { name: 'Mood Changes', severity: SymptomSeverity.moderate },
];

// Dengue-specific symptoms (to maintain compatibility)
const dengueSymptoms = [
  { name: 'High Fever', severity: SymptomSeverity.severe },
  { name: 'Severe Headache', severity: SymptomSeverity.severe },
  { name: 'Pain Behind Eyes', severity: SymptomSeverity.moderate },
  { name: 'Joint/Muscle Pain', severity: SymptomSeverity.moderate },
  { name: 'Skin Rash', severity: SymptomSeverity.mild },
  { name: 'Mild Bleeding', severity: SymptomSeverity.severe },
  { name: 'Nausea/Vomiting', severity: SymptomSeverity.moderate },
];

export async function seedSimpleDiseases() {
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
          description: `${disease.category === DiseaseCategory.communicable ? 'Communicable' : 'Non-communicable'} disease: ${disease.name}`,
        }
      });

      // Link symptoms to diseases based on category
      let symptomsToLink = [];
      
      if (disease.name === 'Dengue') {
        // Special case for dengue to maintain existing functionality
        symptomsToLink = dengueSymptoms.map(s => s.name);
      } else if (disease.category === DiseaseCategory.communicable) {
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
    - Communicable: ${diseases.filter(d => d.category === DiseaseCategory.communicable).length}
    - Non-communicable: ${diseases.filter(d => d.category === DiseaseCategory.non_communicable).length}`);

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
