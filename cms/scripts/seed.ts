import { getPayload } from 'payload'
import config from '../src/payload.config.js'

// Ensure environment variables are available
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'my-super-secret-payload-development-key-for-local-testing-only-32-chars-minimum'
}

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable is required')
  process.exit(1)
}

// Team members data from the frontend
const teamMembers = [
  {
    name: 'Jeffery Mulee',
    role: 'Co-Founder & Outreach Lead',
    bio: "Jeffery Mulee is a co-founder who drives outreach and partnerships with schools and communities, expanding ChipuRobo's reach across Kenya and beyond. Currently pursuing International Business Administration at USIU Africa, Jeffery combines academic knowledge with practical experience to build meaningful relationships with educational institutions and create pathways for students to engage with technology.",
    order: 1,
    social: {
      linkedin: '#',
      github: '#',
      email: 'jeffery@chipurobo.com'
    }
  },
  {
    name: 'Cindy Gachuh',
    role: 'Co-Founder & Technology Integration',
    bio: "Cindy Gachuhi is a co-founder who contributes a student-centered perspective and technical insight to ChipuRobo, helping integrate emerging technologies and data-driven approaches into the organization's programs. As a Computer Science student at Strathmore University, Cindy bridges the gap between academic research and practical implementation, ensuring ChipuRobo's educational tools remain cutting-edge and effective.",
    order: 2,
    social: {
      linkedin: 'https://www.linkedin.com/in/jeffery-ngui-36969b168/',
      github: '#',
      email: 'cindy@chipurobo.com'
    }
  },
  {
    name: 'David Muguchia',
    role: 'Co-Founder & Financial Strategy',
    bio: "David Muguchia is a co-founder who oversees financial strategy to ensure the sustainability and growth of ChipuRobo initiatives. With his background in finance and strategic planning, David manages the organization's financial health while enabling expansion of educational outreach and impact. His expertise in merging financial strategy with technological solutions drives innovation and sustainable growth across all programs.",
    order: 3,
    social: {
      linkedin: 'https://www.linkedin.com/in/david-muguchia-082072224/',
      github: '#',
      email: 'dwightndungu@gmail.com'
    }
  },
  {
    name: 'Anthony Mwangi',
    role: 'Co-Founder & Mentor',
    bio: 'Anthony Mwangi is an experienced professional with over 20 years in Government & Regulatory Affairs, Public Policy, Communication, and Business Development. Anthony has significantly contributed to the transportation, ICT, aviation, and oil & gas industries. With a Master\'s Degree in Public Policy and Management from Strathmore Business School and extensive experience across various sectors, Anthony provides strategic mentorship and leadership to the advisory board.',
    order: 4,
    social: {
      linkedin: 'https://www.linkedin.com/in/anthony-mwangi1/',
      github: '#',
      email: 'anthony@chipurobo.com'
    }
  },
  {
    name: 'Ryan Muuo',
    role: 'Workshop Lead & Operations Manager',
    bio: 'Ryan serves as workshop lead and manages the base of operations for ChipuRobo. As a software engineer and STEM educator, Ryan oversees workshops, maintains equipment, develops hands-on curriculum, and mentors students in robotics and coding to deliver consistent, high-quality learning experiences across all programs.',
    order: 5,
    social: {
      linkedin: 'https://www.linkedin.com/in/ryan-muuo-1a889817a/',
      github: '#',
      email: 'ryanmuuo91@chipurobo.com'
    }
  },
  {
    name: 'Allan Kamau',
    role: 'Training Lead & AI Specialist',
    bio: "Allan Kamau serves as training lead, bringing fresh perspectives and technical expertise to ChipuRobo's educational programs. As a Computer Science student at Strathmore University and skilled full-stack developer with a passion for AI & robotics, Allan contributes to the development of innovative educational tools and leads training sessions that empower the next generation of tech enthusiasts.",
    order: 6,
    social: {
      linkedin: 'https://www.linkedin.com/in/allan-kamau-b47880308/',
      github: '#',
      email: 'allan@chipurobo.com'
    }
  },
  {
    name: 'Kevin Irungu',
    role: 'Co-Founder & STEM Training Expert',
    bio: 'Kevin Irungu is a seasoned STEM trainer and software development expert who co-founded ChipuRobo with a vision to make robotics and AI education accessible across Africa. With extensive experience in coding and educational technology, Kevin leads the team in designing programs that equip young people with real-world technology skills through hands-on learning experiences.',
    order: 7,
    social: {
      linkedin: 'https://www.linkedin.com/in/kevin-irungu-b63a6a97/',
      github: '#',
      email: 'kevin@chipurobo.com'
    }
  },
  {
    name: 'Davies Maina',
    role: 'Digital Marketing Specialist',
    bio: "Davies Maina is a Digital Marketing specialist focusing on Social Media Management, Content Creation, and Management. With years of experience, Davies helps businesses build their online presence and reach their target audience. He crafts tailored content strategies that drive engagement, boost brand awareness, and increase conversions through compelling copy, eye-catching graphics, and impactful videos.",
    order: 8,
    social: {
      linkedin: 'https://www.linkedin.com/in/davies-maina-3620b213b/',
      github: '#',
      email: 'davies@chipurobo.com'
    }
  }
]

// Basic site settings
const siteSettings = {
  siteName: 'ChipuRobo',
  siteDescription: 'Empowering young people through STEM education and robotics',
  siteUrl: 'https://chipurobo.com'
}

async function seed() {
  console.log('🌱 Starting seed process...')
  
  try {
    const payload = await getPayload({ config })
    
    console.log('✅ Connected to Payload')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    
    // Clear team members
    const existingTeamMembers = await payload.find({
      collection: 'team-members',
      limit: 1000,
    })
    
    for (const member of existingTeamMembers.docs) {
      await payload.delete({
        collection: 'team-members',
        id: member.id,
      })
    }
    
    console.log(`🗑️  Deleted ${existingTeamMembers.docs.length} existing team members`)

    // Seed team members
    console.log('👥 Seeding team members...')
    
    for (const member of teamMembers) {
      const createdMember = await payload.create({
        collection: 'team-members',
        data: member,
      })
      console.log(`✅ Created team member: ${createdMember.name}`)
    }

    // Seed site settings
    console.log('⚙️  Seeding site settings...')
    
    try {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: siteSettings,
      })
      console.log('✅ Updated site settings')
    } catch (error) {
      console.warn('⚠️  Could not update site settings:', error)
    }

    console.log('🎉 Seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// Auto-run the seed function
seed()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error during seed:', error)
    process.exit(1)
  })

export { seed }