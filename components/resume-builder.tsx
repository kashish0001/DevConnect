"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { ResumePreview } from "@/components/resume-preview"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Download, Plus, X, Wand2, Share, Save, Loader2, Sparkles, FileText, Copy } from "lucide-react"

interface Experience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  location: string
  graduationDate: string
  gpa?: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
}

interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
  }
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  projects: Project[]
}

export function ResumeBuilder() {
  const { user } = useAuth()
  const [activeTemplate, setActiveTemplate] = useState("modern")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newTech, setNewTech] = useState("")
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const [showImprovements, setShowImprovements] = useState(false)
  const [improvements, setImprovements] = useState<string[]>([])
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [coverLetterData, setCoverLetterData] = useState({
    jobTitle: "",
    companyName: "",
    content: "",
  })
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: user?.name || "John Developer",
      email: user?.email || "john@example.com",
      phone: "+1 (555) 123-4567",
      location: user?.location || "San Francisco, CA",
      website: user?.website || "https://johndev.com",
      linkedin: user?.linkedin || "linkedin.com/in/johndev",
      github: user?.github || "github.com/johndev",
    },
    summary:
      "Experienced Full Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Proven track record of delivering scalable web applications and leading cross-functional teams.",
    experience: [
      {
        id: "1",
        title: "Senior Full Stack Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "",
        current: true,
        description:
          "• Led development of microservices architecture serving 1M+ users\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Mentored 3 junior developers and conducted code reviews\n• Built responsive web applications using React, TypeScript, and Node.js",
      },
      {
        id: "2",
        title: "Full Stack Developer",
        company: "StartupXYZ",
        location: "Remote",
        startDate: "2020-03",
        endDate: "2021-12",
        current: false,
        description:
          "• Developed and maintained 5+ web applications using React and Express.js\n• Optimized database queries resulting in 40% performance improvement\n• Collaborated with design team to implement pixel-perfect UI components\n• Integrated third-party APIs and payment processing systems",
      },
    ],
    education: [
      {
        id: "1",
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        location: "Berkeley, CA",
        graduationDate: "2020-05",
        gpa: "3.8",
      },
    ],
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB", "GraphQL", "Jest"],
    projects: [
      {
        id: "1",
        name: "E-commerce Platform",
        description:
          "Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard.",
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
        url: "https://ecommerce-demo.com",
        github: "https://github.com/johndev/ecommerce",
      },
      {
        id: "2",
        name: "Task Management App",
        description:
          "Developed a collaborative task management application with real-time updates using Socket.io and React. Supports team collaboration and project tracking.",
        technologies: ["React", "Socket.io", "Express", "MongoDB"],
        url: "https://taskapp-demo.com",
        github: "https://github.com/johndev/taskapp",
      },
    ],
  })

  const templates = [
    { id: "modern", name: "Modern", description: "Clean and contemporary design", color: "blue" },
    { id: "classic", name: "Classic", description: "Traditional professional layout", color: "gray" },
    { id: "creative", name: "Creative", description: "Bold and eye-catching design", color: "purple" },
    { id: "minimal", name: "Minimal", description: "Simple and elegant layout", color: "green" },
    { id: "tech", name: "Tech Focus", description: "Optimized for tech roles", color: "indigo" },
  ]

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    })
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    })
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: "",
    }
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    })
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      github: "",
    }
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject],
    })
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)),
    })
  }

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((project) => project.id !== id),
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const addTechnology = (projectId: string) => {
    if (newTech.trim()) {
      const project = resumeData.projects.find((p) => p.id === projectId)
      if (project && !project.technologies.includes(newTech.trim())) {
        updateProject(projectId, "technologies", [...project.technologies, newTech.trim()])
        setNewTech("")
      }
    }
  }

  const removeTechnology = (projectId: string, tech: string) => {
    const project = resumeData.projects.find((p) => p.id === projectId)
    if (project) {
      updateProject(
        projectId,
        "technologies",
        project.technologies.filter((t) => t !== tech),
      )
    }
  }

  const optimizeWithAI = async () => {
    setIsOptimizing(true)
    try {
      // Check if we have AI SDK available and API key
      const hasAIAccess = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY

      if (hasAIAccess) {
        // Try AI optimization first
        try {
          const summaryPrompt = `Optimize this professional summary for a software developer resume. Make it more compelling and ATS-friendly while keeping it concise (2-3 sentences). Current summary: "${resumeData.summary}". Skills: ${resumeData.skills.join(", ")}. Experience: ${resumeData.experience.map((exp) => exp.title).join(", ")}`

          const { text: optimizedSummary } = await generateText({
            model: openai("gpt-4o"),
            prompt: summaryPrompt,
            system:
              "You are an expert resume writer. Provide only the optimized summary text without any additional formatting or explanations.",
          })

          // Optimize experience descriptions
          const optimizedExperience = await Promise.all(
            resumeData.experience.map(async (exp) => {
              if (exp.description.trim()) {
                const expPrompt = `Optimize this job description for a ${exp.title} role. Make it more impactful with quantified achievements and action verbs. Keep the bullet point format. Current description: "${exp.description}"`

                const { text: optimizedDesc } = await generateText({
                  model: openai("gpt-4o"),
                  prompt: expPrompt,
                  system:
                    "You are an expert resume writer. Provide only the optimized bullet points without any additional formatting or explanations. Keep the bullet point format with • symbols.",
                })

                return { ...exp, description: optimizedDesc }
              }
              return exp
            }),
          )

          setResumeData({
            ...resumeData,
            summary: optimizedSummary.trim(),
            experience: optimizedExperience,
          })
        } catch (aiError) {
          console.warn("AI optimization failed, using fallback:", aiError)
          // Fall back to rule-based optimization
          performFallbackOptimization()
        }
      } else {
        // Use fallback optimization when no AI access
        performFallbackOptimization()
      }
    } catch (error) {
      console.error("Optimization failed:", error)
      performFallbackOptimization()
    } finally {
      setIsOptimizing(false)
    }
  }

  const performFallbackOptimization = () => {
    // Rule-based optimization templates
    const optimizedSummary = generateOptimizedSummary()
    const optimizedExperience = optimizeExperienceDescriptions()

    setResumeData({
      ...resumeData,
      summary: optimizedSummary,
      experience: optimizedExperience,
    })
  }

  const generateOptimizedSummary = () => {
    const yearsOfExp = calculateYearsOfExperience()
    const topSkills = resumeData.skills.slice(0, 4).join(", ")
    const seniorityLevel = yearsOfExp >= 5 ? "Senior" : yearsOfExp >= 3 ? "Experienced" : "Skilled"

    const templates = [
      `${seniorityLevel} Full Stack Developer with ${yearsOfExp}+ years of expertise in ${topSkills}. Proven track record of delivering scalable web applications and driving technical innovation in fast-paced environments.`,
      `Results-driven Software Engineer with ${yearsOfExp}+ years of experience building high-performance applications using ${topSkills}. Passionate about clean code, system architecture, and mentoring development teams.`,
      `${seniorityLevel} Developer specializing in ${topSkills} with ${yearsOfExp}+ years of experience. Expert in full-stack development, cloud technologies, and agile methodologies with a focus on delivering exceptional user experiences.`,
    ]

    // Select template based on current summary length or randomly
    const templateIndex = resumeData.summary.length % templates.length
    return templates[templateIndex]
  }

  const calculateYearsOfExperience = () => {
    if (resumeData.experience.length === 0) return 3

    const totalMonths = resumeData.experience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate + "-01")
      const endDate = exp.current ? new Date() : new Date(exp.endDate + "-01")
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
      return total + Math.max(0, months)
    }, 0)

    return Math.max(1, Math.round(totalMonths / 12))
  }

  const optimizeExperienceDescriptions = () => {
    return resumeData.experience.map((exp) => {
      if (!exp.description.trim()) return exp

      // Rule-based optimization
      const optimizedDesc = exp.description

      // Add action verbs if missing
      const actionVerbs = [
        "Developed",
        "Implemented",
        "Led",
        "Designed",
        "Built",
        "Created",
        "Optimized",
        "Managed",
        "Collaborated",
        "Delivered",
        "Architected",
        "Maintained",
      ]

      const lines = optimizedDesc.split("\n").map((line) => {
        line = line.trim()
        if (!line.startsWith("•")) {
          line = "• " + line
        }

        // Ensure each bullet starts with an action verb
        const hasActionVerb = actionVerbs.some((verb) => line.toLowerCase().includes(verb.toLowerCase()))

        if (!hasActionVerb && line.length > 3) {
          const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)]
          line = line.replace("• ", `• ${randomVerb} `)
        }

        // Add quantification suggestions
        if (!line.match(/\d+/) && line.length > 10) {
          const quantifiers = ["5+", "10+", "50%", "3x", "99%", "24/7", "1M+"]
          const randomQuantifier = quantifiers[Math.floor(Math.random() * quantifiers.length)]

          if (line.includes("performance")) {
            line = line.replace("performance", `performance by ${randomQuantifier}`)
          } else if (line.includes("users")) {
            line = line.replace("users", `${randomQuantifier} users`)
          } else if (line.includes("applications")) {
            line = line.replace("applications", `${randomQuantifier} applications`)
          }
        }

        return line
      })

      return { ...exp, description: lines.join("\n") }
    })
  }

  const saveResume = async () => {
    setIsSaving(true)
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false)
      // TODO: Show success toast
    }, 1000)
  }

  const downloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Create a new window with the resume content
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Popup blocked")
      }

      // Get the resume preview content
      const resumeContent = document.querySelector(".resume-preview-content")?.innerHTML || ""

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resumeData.personalInfo.name} - Resume</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
                color: #000;
                line-height: 1.5;
              }
              .resume-content { max-width: 8.5in; margin: 0 auto; }
              @media print {
                body { margin: 0; padding: 0; }
                .resume-content { max-width: none; }
              }
              h1 { font-size: 2rem; margin-bottom: 0.5rem; }
              h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; color: #2563eb; }
              h3 { font-size: 1.1rem; margin: 1rem 0 0.25rem 0; }
              p { margin: 0.5rem 0; }
              .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
              .contact-item { display: flex; align-items: center; gap: 0.25rem; }
              .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
              .skill-tag { 
                background: #f3f4f6; 
                padding: 0.25rem 0.75rem; 
                border-radius: 9999px; 
                font-size: 0.875rem; 
              }
              .experience-item, .education-item, .project-item { 
                margin-bottom: 1.5rem; 
                page-break-inside: avoid;
              }
              .date-range { 
                font-weight: 600; 
                color: #6b7280; 
                font-size: 0.875rem; 
              }
              .company { color: #2563eb; font-weight: 600; }
              .description { white-space: pre-line; margin-top: 0.5rem; }
            </style>
          </head>
          <body>
            <div class="resume-content">
              ${generatePrintableHTML()}
            </div>
          </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    } catch (error) {
      console.error("PDF generation failed:", error)
      // Fallback: open print dialog for current page
      window.print()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generatePrintableHTML = () => {
    const { personalInfo, summary, experience, education, skills, projects } = resumeData

    return `
      <div>
        <h1>${personalInfo.name}</h1>
        <div class="contact-info">
          <span class="contact-item">📧 ${personalInfo.email}</span>
          <span class="contact-item">📱 ${personalInfo.phone}</span>
          <span class="contact-item">📍 ${personalInfo.location}</span>
          ${personalInfo.website ? `<span class="contact-item">🌐 ${personalInfo.website}</span>` : ""}
          ${personalInfo.linkedin ? `<span class="contact-item">💼 ${personalInfo.linkedin}</span>` : ""}
          ${personalInfo.github ? `<span class="contact-item">💻 ${personalInfo.github}</span>` : ""}
        </div>
        
        ${
          summary
            ? `
          <h2>Professional Summary</h2>
          <p>${summary}</p>
        `
            : ""
        }
        
        ${
          experience.length > 0
            ? `
          <h2>Experience</h2>
          ${experience
            .map(
              (exp) => `
            <div class="experience-item">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h3>${exp.title}</h3>
                  <p class="company">${exp.company} • ${exp.location}</p>
                </div>
                <span class="date-range">${formatDateRange(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        `
            : ""
        }
        
        ${
          projects.length > 0
            ? `
          <h2>Projects</h2>
          ${projects
            .map(
              (project) => `
            <div class="project-item">
              <h3>${project.name}</h3>
              <p>${project.description}</p>
              ${
                project.technologies.length > 0
                  ? `
                <div class="skills">
                  ${project.technologies.map((tech) => `<span class="skill-tag">${tech}</span>`).join("")}
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
        `
            : ""
        }
        
        ${
          education.length > 0
            ? `
          <h2>Education</h2>
          ${education
            .map(
              (edu) => `
            <div class="education-item">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h3>${edu.degree}</h3>
                  <p class="company">${edu.school} • ${edu.location}</p>
                  ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ""}
                </div>
                <span class="date-range">${formatDate(edu.graduationDate)}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        `
            : ""
        }
        
        ${
          skills.length > 0
            ? `
          <h2>Skills</h2>
          <div class="skills">
            ${skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
          </div>
        `
            : ""
        }
      </div>
    `
  }

  const shareResume = async () => {
    const shareData = {
      title: `${resumeData.personalInfo.name} - Resume`,
      text: `Check out ${resumeData.personalInfo.name}'s professional resume`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        // TODO: Show toast notification
        console.log("Resume link copied to clipboard!")
      }
    } catch (error) {
      console.error("Sharing failed:", error)
      // Final fallback: open share dialog
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`
      window.open(linkedinUrl, "_blank", "width=600,height=400")
    }
  }

  const suggestImprovements = async () => {
    const suggestions = []

    // Analyze resume completeness
    if (!resumeData.summary.trim()) {
      suggestions.push("Add a professional summary to introduce yourself effectively")
    }

    if (resumeData.experience.length === 0) {
      suggestions.push("Add work experience to showcase your professional background")
    }

    if (resumeData.skills.length < 5) {
      suggestions.push("Add more relevant skills to improve keyword matching")
    }

    if (resumeData.projects.length === 0) {
      suggestions.push("Include projects to demonstrate your practical experience")
    }

    // Analyze experience descriptions
    resumeData.experience.forEach((exp, index) => {
      if (!exp.description.trim()) {
        suggestions.push(`Add description for ${exp.title} position to highlight achievements`)
      } else {
        const hasNumbers = /\d+/.test(exp.description)
        if (!hasNumbers) {
          suggestions.push(`Add quantifiable metrics to ${exp.title} role (e.g., percentages, numbers, timeframes)`)
        }

        const hasActionVerbs = ["led", "developed", "implemented", "created", "managed", "built"].some((verb) =>
          exp.description.toLowerCase().includes(verb),
        )
        if (!hasActionVerbs) {
          suggestions.push(`Use stronger action verbs in ${exp.title} description`)
        }
      }
    })

    // Analyze contact information
    if (!resumeData.personalInfo.linkedin) {
      suggestions.push("Add LinkedIn profile to improve professional networking")
    }

    if (
      !resumeData.personalInfo.github &&
      resumeData.skills.some((skill) => ["javascript", "python", "react", "node", "git"].includes(skill.toLowerCase()))
    ) {
      suggestions.push("Add GitHub profile to showcase your code repositories")
    }

    // Analyze skills relevance
    const techSkills = resumeData.skills.filter((skill) =>
      ["javascript", "python", "react", "node", "aws", "docker", "sql"].includes(skill.toLowerCase()),
    )
    if (techSkills.length < 3) {
      suggestions.push("Add more technical skills relevant to your target role")
    }

    // Resume length analysis
    const totalContent =
      resumeData.summary.length +
      resumeData.experience.reduce((acc, exp) => acc + exp.description.length, 0) +
      resumeData.projects.reduce((acc, proj) => acc + proj.description.length, 0)

    if (totalContent < 500) {
      suggestions.push("Expand your resume content - aim for more detailed descriptions")
    } else if (totalContent > 2000) {
      suggestions.push("Consider condensing content - keep resume concise and focused")
    }

    setImprovements(suggestions.length > 0 ? suggestions : ["Your resume looks great! No major improvements needed."])
    setShowImprovements(true)
  }

  const generateCoverLetter = async () => {
    if (!coverLetterData.jobTitle || !coverLetterData.companyName) {
      return
    }

    setIsGeneratingCoverLetter(true)

    try {
      // Try AI generation first
      const hasAIAccess = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY

      if (hasAIAccess) {
        try {
          const prompt = `Write a professional cover letter for ${resumeData.personalInfo.name} applying for ${coverLetterData.jobTitle} at ${coverLetterData.companyName}. 
          
          Background:
          - Summary: ${resumeData.summary}
          - Skills: ${resumeData.skills.join(", ")}
          - Recent Experience: ${resumeData.experience[0]?.title} at ${resumeData.experience[0]?.company}
          
          Make it compelling, specific to the role, and professional. Include specific examples from their background.`

          const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt,
            system:
              "You are an expert career counselor. Write a compelling, professional cover letter that highlights the candidate's relevant experience and skills for the specific role.",
          })

          setCoverLetterData((prev) => ({ ...prev, content: text }))
        } catch (aiError) {
          console.warn("AI cover letter generation failed, using template:", aiError)
          generateTemplateCoverLetter()
        }
      } else {
        generateTemplateCoverLetter()
      }
    } catch (error) {
      console.error("Cover letter generation failed:", error)
      generateTemplateCoverLetter()
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const generateTemplateCoverLetter = () => {
    const template = `Dear Hiring Manager,

I am writing to express my strong interest in the ${coverLetterData.jobTitle} position at ${coverLetterData.companyName}. With my background in ${resumeData.skills.slice(0, 3).join(", ")} and proven experience in software development, I am excited about the opportunity to contribute to your team.

${resumeData.summary}

In my recent role as ${resumeData.experience[0]?.title || "Software Developer"} at ${resumeData.experience[0]?.company || "my previous company"}, I have:
${
  resumeData.experience[0]?.description
    .split("\n")
    .slice(0, 3)
    .map((line) => line.replace("•", "-"))
    .join("\n") ||
  "- Developed and maintained software applications\n- Collaborated with cross-functional teams\n- Delivered high-quality solutions on time"
}

I am particularly drawn to ${coverLetterData.companyName} because of your commitment to innovation and excellence in technology. I believe my skills in ${resumeData.skills.slice(0, 4).join(", ")} align perfectly with your needs for this role.

${resumeData.projects.length > 0 ? `I have also worked on several notable projects, including ${resumeData.projects[0]?.name}, where I ${resumeData.projects[0]?.description.split(".")[0].toLowerCase()}.` : ""}

I would welcome the opportunity to discuss how my experience and passion for technology can contribute to ${coverLetterData.companyName}'s continued success. Thank you for considering my application.

Sincerely,
${resumeData.personalInfo.name}`

    setCoverLetterData((prev) => ({ ...prev, content: template }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "-01")
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = new Date(startDate + "-01")
    const end = current
      ? "Present"
      : new Date(endDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    return `${start.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - ${end}`
  }

  return (
    <div className="h-screen pt-16 flex">
      {/* Left Panel - Form */}
      <div className="w-1/2 overflow-y-auto bg-gray-950 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Resume Builder</h1>
              <p className="text-gray-400">Create your professional resume</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveResume}
                disabled={isSaving}
                variant="outline"
                className="border-gray-700 bg-transparent"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
              <Button onClick={optimizeWithAI} disabled={isOptimizing} className="bg-purple-600 hover:bg-purple-700">
                {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                {isOptimizing ? "Optimizing..." : "Smart Optimize"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={resumeData.personalInfo.name}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, name: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-gray-300">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="website" className="text-gray-300">
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={resumeData.personalInfo.website}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, website: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin" className="text-gray-300">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github" className="text-gray-300">
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        value={resumeData.personalInfo.github}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, github: e.target.value },
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="summary" className="text-gray-300">
                      Professional Summary
                    </Label>
                    <Textarea
                      id="summary"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                      placeholder="Write a compelling professional summary..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Work Experience</CardTitle>
                  <Button onClick={addExperience} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 bg-gray-800 rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-semibold">Experience {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Tech Company Inc."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-300">Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Start Date</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">End Date</Label>
                          <div className="space-y-2">
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              disabled={exp.current}
                            />
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`current-${exp.id}`}
                                checked={exp.current}
                                onCheckedChange={(checked) => updateExperience(exp.id, "current", checked)}
                              />
                              <Label htmlFor={`current-${exp.id}`} className="text-sm text-gray-300">
                                Current position
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                          placeholder="• Describe your responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Include quantifiable results when possible"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Education</CardTitle>
                  <Button onClick={addEducation} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 bg-gray-800 rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-semibold">Education {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Bachelor of Computer Science"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">School</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="University Name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-300">Location</Label>
                          <Input
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Graduation Date</Label>
                          <Input
                            type="month"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">GPA (Optional)</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="3.8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Skills & Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resumeData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-400">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Projects</CardTitle>
                  <Button onClick={addProject} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.projects.map((project, index) => (
                    <div key={project.id} className="p-4 bg-gray-800 rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-semibold">Project {index + 1}</h3>
                        <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Label className="text-gray-300">Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => updateProject(project.id, "name", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="My Awesome Project"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => updateProject(project.id, "description", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Describe your project and its impact..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Live URL (Optional)</Label>
                          <Input
                            value={project.url}
                            onChange={(e) => updateProject(project.id, "url", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="https://project-demo.com"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">GitHub URL (Optional)</Label>
                          <Input
                            value={project.github}
                            onChange={(e) => updateProject(project.id, "github", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="https://github.com/user/project"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Technologies Used</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="bg-green-600/20 text-green-400">
                              {tech}
                              <button
                                onClick={() => removeTechnology(project.id, tech)}
                                className="ml-2 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology..."
                            value={activeProjectId === project.id ? newTech : ""}
                            onChange={(e) => {
                              setNewTech(e.target.value)
                              setActiveProjectId(project.id)
                            }}
                            className="bg-gray-700 border-gray-600 text-white"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addTechnology(project.id)
                                setActiveProjectId(null)
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              addTechnology(project.id)
                              setActiveProjectId(null)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Smart Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={optimizeWithAI}
              disabled={isOptimizing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Smart Optimize"}
            </Button>
            <p className="text-xs text-gray-400">Uses AI when available, or smart rule-based optimization</p>

            <Button onClick={suggestImprovements} variant="outline" className="w-full border-gray-700 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Suggest Improvements
            </Button>

            <Button
              onClick={() => setShowCoverLetter(true)}
              variant="outline"
              className="w-full border-gray-700 bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 bg-gray-100 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
            <div className="flex gap-2">
              <Button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                variant="outline"
                className="border-gray-300 bg-transparent"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
              <Button onClick={shareResume} variant="outline" className="border-gray-300 bg-transparent">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <Label className="text-gray-700 mb-3 block">Choose Template</Label>
            <div className="grid grid-cols-5 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplate(template.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    activeTemplate === template.id
                      ? `bg-${template.color}-100 border-2 border-${template.color}-500`
                      : "bg-white border-2 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-full h-8 rounded mb-2 ${
                      activeTemplate === template.id ? `bg-${template.color}-500` : "bg-gray-300"
                    }`}
                  ></div>
                  <p className="text-xs font-medium text-gray-700">{template.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <ResumePreview data={resumeData} template={activeTemplate} />
          </div>
        </div>
      </div>

      {/* Improvements Modal */}
      {showImprovements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Resume Improvement Suggestions</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowImprovements(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-300 text-sm">{improvement}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowImprovements(false)} className="bg-blue-600 hover:bg-blue-700">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {showCoverLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Generate Cover Letter</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCoverLetter(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Job Title</Label>
                  <Input
                    value={coverLetterData.jobTitle}
                    onChange={(e) => setCoverLetterData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Company Name</Label>
                  <Input
                    value={coverLetterData.companyName}
                    onChange={(e) => setCoverLetterData((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., Google"
                  />
                </div>
                <Button
                  onClick={generateCoverLetter}
                  disabled={!coverLetterData.jobTitle || !coverLetterData.companyName || isGeneratingCoverLetter}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingCoverLetter ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingCoverLetter ? "Generating..." : "Generate Cover Letter"}
                </Button>
              </div>

              <div>
                <Label className="text-gray-300">Generated Cover Letter</Label>
                <Textarea
                  value={coverLetterData.content}
                  onChange={(e) => setCoverLetterData((prev) => ({ ...prev, content: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white min-h-[400px] font-mono text-sm"
                  placeholder="Your cover letter will appear here..."
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                onClick={() => navigator.clipboard.writeText(coverLetterData.content)}
                disabled={!coverLetterData.content}
                variant="outline"
                className="border-gray-700 bg-transparent"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCoverLetter(false)} className="border-gray-700">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Save cover letter
                    setShowCoverLetter(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Cover Letter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
