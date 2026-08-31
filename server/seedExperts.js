const mongoose = require('mongoose');
const Expert = require('./models/Expert');
require('dotenv').config();

// Sample expert data
const sampleExperts = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@agriai.com",
    phone: "+91-9876543210",
    specialization: "Crop Science",
    experience: 15,
    qualifications: [
      {
        degree: "Ph.D. in Agricultural Sciences",
        institution: "Indian Agricultural Research Institute",
        year: 2008
      },
      {
        degree: "M.Sc. in Plant Breeding",
        institution: "Punjab Agricultural University",
        year: 2005
      }
    ],
    certifications: [
      {
        name: "Certified Crop Advisor",
        issuingBody: "International Society of Precision Agriculture",
        validUntil: new Date('2025-12-31')
      }
    ],
    bio: "Dr. Rajesh Kumar is a renowned crop scientist with 15 years of experience in sustainable agriculture. He specializes in rice and wheat cultivation, soil health management, and precision farming techniques. He has published over 50 research papers and has been instrumental in developing drought-resistant crop varieties.",
    languages: ["English", "Hindi", "Punjabi"],
    location: {
      state: "Punjab",
      district: "Ludhiana",
      pincode: "141001"
    },
    consultationTypes: [
      {
        type: "Video Call",
        price: 1500,
        duration: 60,
        isAvailable: true
      },
      {
        type: "Phone Call",
        price: 1000,
        duration: 45,
        isAvailable: true
      },
      {
        type: "In-Person",
        price: 2000,
        duration: 90,
        isAvailable: true
      }
    ],
    workingHours: {
      start: "09:00",
      end: "17:00",
      timezone: "Asia/Kolkata",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    rating: 4.8,
    totalConsultations: 150,
    totalReviews: 120,
    isVerified: true,
    isActive: true,
    isAvailable: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/rajesh-kumar-agri",
      website: "https://cropscienceexpert.com"
    }
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@agriai.com",
    phone: "+91-9876543211",
    specialization: "Soil Science",
    experience: 12,
    qualifications: [
      {
        degree: "Ph.D. in Soil Science",
        institution: "Banaras Hindu University",
        year: 2010
      },
      {
        degree: "M.Sc. in Environmental Science",
        institution: "Jawaharlal Nehru University",
        year: 2007
      }
    ],
    certifications: [
      {
        name: "Certified Soil Scientist",
        issuingBody: "Soil Science Society of America",
        validUntil: new Date('2024-12-31')
      }
    ],
    bio: "Dr. Priya Sharma is a leading soil scientist specializing in soil health assessment, nutrient management, and sustainable farming practices. She has worked extensively with farmers across India to improve soil fertility and reduce chemical inputs. Her research focuses on organic farming and soil conservation techniques.",
    languages: ["English", "Hindi", "Tamil"],
    location: {
      state: "Tamil Nadu",
      district: "Coimbatore",
      pincode: "641001"
    },
    consultationTypes: [
      {
        type: "Video Call",
        price: 1200,
        duration: 60,
        isAvailable: true
      },
      {
        type: "Chat",
        price: 500,
        duration: 30,
        isAvailable: true
      }
    ],
    workingHours: {
      start: "10:00",
      end: "18:00",
      timezone: "Asia/Kolkata",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    rating: 4.9,
    totalConsultations: 200,
    totalReviews: 180,
    isVerified: true,
    isActive: true,
    isAvailable: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/priya-sharma-soil",
      website: "https://soilhealthadvisor.com"
    }
  },
  {
    name: "Dr. Amit Patel",
    email: "amit.patel@agriai.com",
    phone: "+91-9876543212",
    specialization: "Plant Pathology",
    experience: 10,
    qualifications: [
      {
        degree: "Ph.D. in Plant Pathology",
        institution: "University of Agricultural Sciences",
        year: 2012
      },
      {
        degree: "M.Sc. in Plant Protection",
        institution: "Gujarat Agricultural University",
        year: 2009
      }
    ],
    certifications: [
      {
        name: "Certified Plant Pathologist",
        issuingBody: "American Phytopathological Society",
        validUntil: new Date('2025-06-30')
      }
    ],
    bio: "Dr. Amit Patel is an expert in plant disease diagnosis and management. He specializes in identifying crop diseases, developing treatment protocols, and implementing integrated pest management strategies. He has helped thousands of farmers save their crops from devastating diseases.",
    languages: ["English", "Hindi", "Gujarati"],
    location: {
      state: "Gujarat",
      district: "Anand",
      pincode: "388001"
    },
    consultationTypes: [
      {
        type: "Video Call",
        price: 1000,
        duration: 45,
        isAvailable: true
      },
      {
        type: "Phone Call",
        price: 800,
        duration: 30,
        isAvailable: true
      },
      {
        type: "In-Person",
        price: 1500,
        duration: 60,
        isAvailable: true
      }
    ],
    workingHours: {
      start: "08:00",
      end: "16:00",
      timezone: "Asia/Kolkata",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"]
    },
    rating: 4.7,
    totalConsultations: 180,
    totalReviews: 150,
    isVerified: true,
    isActive: true,
    isAvailable: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/amit-patel-plant-pathology"
    }
  },
  {
    name: "Dr. Sunita Reddy",
    email: "sunita.reddy@agriai.com",
    phone: "+91-9876543213",
    specialization: "Organic Farming",
    experience: 8,
    qualifications: [
      {
        degree: "Ph.D. in Organic Agriculture",
        institution: "University of Hyderabad",
        year: 2014
      },
      {
        degree: "M.Sc. in Sustainable Agriculture",
        institution: "Andhra Pradesh Agricultural University",
        year: 2011
      }
    ],
    certifications: [
      {
        name: "Certified Organic Inspector",
        issuingBody: "Organic Trade Association",
        validUntil: new Date('2024-12-31')
      }
    ],
    bio: "Dr. Sunita Reddy is a passionate advocate for organic farming and sustainable agriculture. She has extensive experience in organic certification, composting techniques, and natural pest control methods. She helps farmers transition from conventional to organic farming practices.",
    languages: ["English", "Hindi", "Telugu"],
    location: {
      state: "Telangana",
      district: "Hyderabad",
      pincode: "500001"
    },
    consultationTypes: [
      {
        type: "Video Call",
        price: 800,
        duration: 45,
        isAvailable: true
      },
      {
        type: "Chat",
        price: 300,
        duration: 20,
        isAvailable: true
      }
    ],
    workingHours: {
      start: "09:00",
      end: "17:00",
      timezone: "Asia/Kolkata",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    rating: 4.6,
    totalConsultations: 120,
    totalReviews: 100,
    isVerified: true,
    isActive: true,
    isAvailable: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/sunita-reddy-organic",
      website: "https://organicfarmingguide.com"
    }
  },
  {
    name: "Dr. Vikram Singh",
    email: "vikram.singh@agriai.com",
    phone: "+91-9876543214",
    specialization: "Agricultural Economics",
    experience: 18,
    qualifications: [
      {
        degree: "Ph.D. in Agricultural Economics",
        institution: "Indian Institute of Management",
        year: 2006
      },
      {
        degree: "M.Sc. in Economics",
        institution: "Delhi School of Economics",
        year: 2003
      }
    ],
    certifications: [
      {
        name: "Certified Agricultural Economist",
        issuingBody: "International Association of Agricultural Economists",
        validUntil: new Date('2025-12-31')
      }
    ],
    bio: "Dr. Vikram Singh is a leading agricultural economist with expertise in farm economics, market analysis, and agricultural policy. He helps farmers make informed decisions about crop selection, pricing strategies, and investment planning. He has authored several books on agricultural economics and rural development.",
    languages: ["English", "Hindi", "Punjabi"],
    location: {
      state: "Delhi",
      district: "New Delhi",
      pincode: "110001"
    },
    consultationTypes: [
      {
        type: "Video Call",
        price: 2000,
        duration: 90,
        isAvailable: true
      },
      {
        type: "In-Person",
        price: 2500,
        duration: 120,
        isAvailable: true
      }
    ],
    workingHours: {
      start: "10:00",
      end: "18:00",
      timezone: "Asia/Kolkata",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    rating: 4.9,
    totalConsultations: 300,
    totalReviews: 280,
    isVerified: true,
    isActive: true,
    isAvailable: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/vikram-singh-agri-economics",
      website: "https://agrieconomicsconsultant.com"
    }
  }
];

async function seedExperts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agriai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing experts
    await Expert.deleteMany({});
    console.log('🗑️  Cleared existing experts');

    // Insert sample experts
    const experts = await Expert.insertMany(sampleExperts);
    console.log(`✅ Inserted ${experts.length} experts`);

    console.log('🎉 Expert seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding experts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedExperts();
}

module.exports = seedExperts;













