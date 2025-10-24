import { PrismaClient, SymptomSeverity, DiseaseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Disease data based on diseases.md
const diseasesData = [
  // Communicable Diseases
  {
    name: 'Tuberculosis',
    category: DiseaseCategory.communicable,
    description: 'A bacterial infection that primarily affects the lungs',
    symptoms: [
      { name: 'Persistent Cough', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Chest Pain', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Blood in Sputum', severity: SymptomSeverity.severe, isCommon: false },
      { name: 'Fatigue', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Weight Loss', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Night Sweats', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Loss of Appetite', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Acute Bloody Diarrhea',
    category: DiseaseCategory.communicable,
    description: 'Infectious diarrhea with blood in stool',
    symptoms: [
      { name: 'Bloody Diarrhea', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Abdominal Cramping', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Fever', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Nausea', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Vomiting', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Dehydration', severity: SymptomSeverity.severe, isCommon: false },
    ]
  },
  {
    name: 'Dengue',
    category: DiseaseCategory.communicable,
    description: 'Mosquito-borne viral infection causing fever and flu-like symptoms',
    symptoms: [
      { name: 'High Fever', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Severe Headache', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Pain Behind Eyes', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Joint/Muscle Pain', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Skin Rash', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Mild Bleeding', severity: SymptomSeverity.severe, isCommon: false },
      { name: 'Nausea/Vomiting', severity: SymptomSeverity.moderate, isCommon: true },
    ]
  },
  {
    name: 'Measles',
    category: DiseaseCategory.communicable,
    description: 'Highly contagious viral infection causing fever and rash',
    symptoms: [
      { name: 'High Fever', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Measles Rash', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Runny Nose', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Red Watery Eyes', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Cough', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'White Spots in Mouth', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Influenza',
    category: DiseaseCategory.communicable,
    description: 'Viral infection affecting respiratory system',
    symptoms: [
      { name: 'Fever', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Cough', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Sore Throat', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Body Aches', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Headache', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Fatigue', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Runny Nose', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Chicken Pox',
    category: DiseaseCategory.communicable,
    description: 'Viral infection causing itchy skin rash and blisters',
    symptoms: [
      { name: 'Itchy Skin Rash', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Fluid-filled Blisters', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Fever', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Headache', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Fatigue', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'HIV',
    category: DiseaseCategory.communicable,
    description: 'Human Immunodeficiency Virus infection',
    symptoms: [
      { name: 'Flu-like Symptoms', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Swollen Lymph Nodes', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Rash', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Fever', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Fatigue', severity: SymptomSeverity.moderate, isCommon: true },
    ]
  },
  {
    name: 'STI (Sexually Transmitted Infections)',
    category: DiseaseCategory.communicable,
    description: 'Infections spread through sexual contact',
    symptoms: [
      { name: 'Genital Discharge', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Burning During Urination', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Genital Sores', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Pelvic Pain', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  {
    name: 'Rabies',
    category: DiseaseCategory.communicable,
    description: 'Viral infection transmitted through animal bites',
    symptoms: [
      { name: 'Fever', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Headache', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Anxiety', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Difficulty Swallowing', severity: SymptomSeverity.severe, isCommon: false },
      { name: 'Fear of Water', severity: SymptomSeverity.severe, isCommon: false },
    ]
  },
  {
    name: 'Soil Transmitted Helminthiasis',
    category: DiseaseCategory.communicable,
    description: 'Parasitic worm infections from contaminated soil',
    symptoms: [
      { name: 'Abdominal Pain', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Diarrhea', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Weight Loss', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Anemia', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  
  // Non-Communicable Diseases
  {
    name: 'Hypertension',
    category: DiseaseCategory.non_communicable,
    description: 'High blood pressure condition',
    symptoms: [
      { name: 'Headaches', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Dizziness', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Chest Pain', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Shortness of Breath', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  {
    name: 'Diabetes Mellitus',
    category: DiseaseCategory.non_communicable,
    description: 'Chronic condition affecting blood sugar regulation',
    symptoms: [
      { name: 'Frequent Urination', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Excessive Thirst', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Unexplained Weight Loss', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Fatigue', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Blurred Vision', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Slow Healing Wounds', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  {
    name: 'Breast Cancer',
    category: DiseaseCategory.non_communicable,
    description: 'Malignant tumor in breast tissue',
    symptoms: [
      { name: 'Breast Lump', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Breast Pain', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Nipple Discharge', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Skin Changes', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  {
    name: 'Cervical Cancer',
    category: DiseaseCategory.non_communicable,
    description: 'Cancer of the cervix',
    symptoms: [
      { name: 'Abnormal Vaginal Bleeding', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Pelvic Pain', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Pain During Intercourse', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Unusual Vaginal Discharge', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Cataract',
    category: DiseaseCategory.non_communicable,
    description: 'Clouding of the eye lens',
    symptoms: [
      { name: 'Blurred Vision', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Sensitivity to Light', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Difficulty Seeing at Night', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Seeing Halos', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Mental Disorders (all types)',
    category: DiseaseCategory.non_communicable,
    description: 'Various mental health conditions',
    symptoms: [
      { name: 'Mood Changes', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Anxiety', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Depression', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Sleep Problems', severity: SymptomSeverity.mild, isCommon: false },
      { name: 'Concentration Difficulties', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Acute Febrile Disorders',
    category: DiseaseCategory.non_communicable,
    description: 'Fever-causing conditions',
    symptoms: [
      { name: 'High Fever', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Chills', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Body Aches', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Headache', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  },
  {
    name: 'Chronic Kidney Disease',
    category: DiseaseCategory.non_communicable,
    description: 'Progressive loss of kidney function',
    symptoms: [
      { name: 'Fatigue', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Swelling in Legs', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Shortness of Breath', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Changes in Urination', severity: SymptomSeverity.mild, isCommon: true },
    ]
  },
  {
    name: 'Lung Disease',
    category: DiseaseCategory.non_communicable,
    description: 'Various conditions affecting lung function',
    symptoms: [
      { name: 'Shortness of Breath', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Persistent Cough', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Chest Pain', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Wheezing', severity: SymptomSeverity.mild, isCommon: false },
    ]
  },
  {
    name: 'Asthma',
    category: DiseaseCategory.non_communicable,
    description: 'Chronic respiratory condition',
    symptoms: [
      { name: 'Wheezing', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Shortness of Breath', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Chest Tightness', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Coughing', severity: SymptomSeverity.mild, isCommon: true },
    ]
  },
  {
    name: 'COPD (Chronic Obstructive Pulmonary Disease)',
    category: DiseaseCategory.non_communicable,
    description: 'Progressive lung disease',
    symptoms: [
      { name: 'Chronic Cough', severity: SymptomSeverity.moderate, isCommon: true },
      { name: 'Shortness of Breath', severity: SymptomSeverity.severe, isCommon: true },
      { name: 'Excess Mucus', severity: SymptomSeverity.mild, isCommon: true },
      { name: 'Wheezing', severity: SymptomSeverity.moderate, isCommon: false },
      { name: 'Fatigue', severity: SymptomSeverity.moderate, isCommon: false },
    ]
  }
];

export async function seedDiseases() {
  console.log('🌱 Starting disease and symptom seeding...');

  try {
    // Create all symptoms first
    console.log('Creating symptoms...');
    const allSymptoms = new Set<string>();
    diseasesData.forEach(disease => {
      disease.symptoms.forEach(symptom => {
        allSymptoms.add(symptom.name);
      });
    });

    const symptomRecords = await Promise.all(
      Array.from(allSymptoms).map(async (symptomName) => {
        return prisma.symptom.upsert({
          where: { name: symptomName },
          update: {},
          create: {
            name: symptomName,
            // severity removed - now stored per disease in DiseaseSymptom
          }
        });
      })
    );

    console.log(`✅ Created ${symptomRecords.length} symptoms`);

    // Create diseases and link with symptoms
    console.log('Creating diseases...');
    for (const diseaseData of diseasesData) {
      const disease = await prisma.disease.upsert({
        where: { name: diseaseData.name },
        update: {},
        create: {
          name: diseaseData.name,
          category: diseaseData.category,
          description: diseaseData.description,
        }
      });

      // Link symptoms to disease
      for (const symptomData of diseaseData.symptoms) {
        const symptom = await prisma.symptom.findUnique({
          where: { name: symptomData.name }
        });

        if (symptom) {
          await prisma.diseaseSymptom.upsert({
            where: {
              diseaseId_symptomId: {
                diseaseId: disease.id,
                symptomId: symptom.id,
              }
            },
            update: {
              isCommon: symptomData.isCommon,
              severity: symptomData.severity  // Update severity per disease
            },
            create: {
              diseaseId: disease.id,
              symptomId: symptom.id,
              isCommon: symptomData.isCommon,
              severity: symptomData.severity  // Store disease-specific severity
            }
          });
        }
      }

      console.log(`✅ Created disease: ${disease.name}`);
    }

    console.log('🎉 Disease seeding completed successfully!');
    
    // Print summary
    const diseaseCount = await prisma.disease.count();
    const symptomCount = await prisma.symptom.count();
    const connectionCount = await prisma.diseaseSymptom.count();
    
    console.log(`📊 Summary:
    - Diseases: ${diseaseCount}
    - Symptoms: ${symptomCount}  
    - Disease-Symptom connections: ${connectionCount}`);

  } catch (error) {
    console.error('❌ Error seeding diseases:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDiseases()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
