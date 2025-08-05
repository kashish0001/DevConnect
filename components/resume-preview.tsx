"use client"

import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink } from "lucide-react"

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
  experience: Array<{
    id: string
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    degree: string
    school: string
    location: string
    graduationDate: string
    gpa?: string
  }>
  skills: string[]
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string[]
    url?: string
    github?: string
  }>
}

interface ResumePreviewProps {
  data: ResumeData
  template: string
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString + "-01")
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = formatDate(startDate)
    const end = current ? "Present" : formatDate(endDate)
    return `${start} - ${end}`
  }

  if (template === "modern") {
    return (
      <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full">
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {data.personalInfo.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {data.personalInfo.phone}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {data.personalInfo.location}
            </div>
            {data.personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {data.personalInfo.website}
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="h-4 w-4" />
                {data.personalInfo.linkedin}
              </div>
            )}
            {data.personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                {data.personalInfo.github}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wide">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-blue-600 font-medium">
                        {exp.company} • {exp.location}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line ml-0">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wide">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2">
                      {project.url && <ExternalLink className="h-4 w-4 text-blue-600" />}
                      {project.github && <Github className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wide">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium">
                      {edu.school} • {edu.location}
                    </p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{formatDate(edu.graduationDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wide">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (template === "classic") {
    return (
      <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full font-serif">
        {/* Header */}
        <div className="text-center border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.name}</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {data.personalInfo.email} • {data.personalInfo.phone}
            </p>
            <p>{data.personalInfo.location}</p>
            {(data.personalInfo.website || data.personalInfo.linkedin) && (
              <p>
                {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
                {data.personalInfo.website && data.personalInfo.linkedin && <span> • </span>}
                {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">SUMMARY</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">EXPERIENCE</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-700 italic">
                        {exp.company}, {exp.location}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">EDUCATION</h2>
            <div className="space-y-2">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700 italic">
                      {edu.school}, {edu.location}
                    </p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(edu.graduationDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">SKILLS</h2>
            <p className="text-gray-700 text-sm">{data.skills.join(" • ")}</p>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">PROJECTS</h2>
            <div className="space-y-3">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  <p className="text-gray-700 text-sm mb-1">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <p className="text-gray-600 text-xs italic">Technologies: {project.technologies.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (template === "creative") {
    return (
      <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-4xl font-bold mb-2">{data.personalInfo.name}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {data.personalInfo.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {data.personalInfo.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.personalInfo.location}
              </p>
            </div>
            <div className="space-y-1">
              {data.personalInfo.website && (
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {data.personalInfo.website}
                </p>
              )}
              {data.personalInfo.linkedin && (
                <p className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  {data.personalInfo.linkedin}
                </p>
              )}
              {data.personalInfo.github && (
                <p className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  {data.personalInfo.github}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              About Me
            </h2>
            <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-purple-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                        <p className="text-purple-600 font-semibold">
                          {exp.company} • {exp.location}
                        </p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                    </div>
                    {exp.description && (
                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-medium shadow-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              Projects
            </h2>
            <div className="grid gap-4">
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2">
                      {project.url && <ExternalLink className="h-4 w-4 text-purple-600" />}
                      {project.github && <Github className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white text-purple-700 text-xs rounded border border-purple-200 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-purple-600 font-semibold">
                        {edu.school} • {edu.location}
                      </p>
                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatDate(edu.graduationDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (template === "minimal") {
    return (
      <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-light text-gray-900 mb-4">{data.personalInfo.name}</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.location}
            </p>
            {(data.personalInfo.website || data.personalInfo.linkedin || data.personalInfo.github) && (
              <p>
                {[data.personalInfo.website, data.personalInfo.linkedin, data.personalInfo.github]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed text-lg font-light">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-6 pb-2 border-b border-gray-200">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">
                        {exp.company}, {exp.location}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 font-light">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line font-light">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Skills</h2>
            <p className="text-gray-700 font-light leading-relaxed">{data.skills.join(" • ")}</p>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-6 pb-2 border-b border-gray-200">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-gray-700 font-light mb-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <p className="text-gray-500 text-sm font-light">{project.technologies.join(" • ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-6 pb-2 border-b border-gray-200">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600 font-light">
                      {edu.school}, {edu.location}
                    </p>
                    {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                  </div>
                  <p className="text-sm text-gray-500 font-light">{formatDate(edu.graduationDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (template === "tech") {
    return (
      <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full font-mono">
        {/* Header */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg mb-6 font-mono">
          <div className="text-green-500 mb-2">$ whoami</div>
          <h1 className="text-3xl font-bold mb-4">{data.personalInfo.name}</h1>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="text-green-500">email:</span> {data.personalInfo.email}
            </p>
            <p>
              <span className="text-green-500">phone:</span> {data.personalInfo.phone}
            </p>
            <p>
              <span className="text-green-500">location:</span> {data.personalInfo.location}
            </p>
            {data.personalInfo.website && (
              <p>
                <span className="text-green-500">website:</span> {data.personalInfo.website}
              </p>
            )}
            {data.personalInfo.github && (
              <p>
                <span className="text-green-500">github:</span> {data.personalInfo.github}
              </p>
            )}
            {data.personalInfo.linkedin && (
              <p>
                <span className="text-green-500">linkedin:</span> {data.personalInfo.linkedin}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <div className="text-green-600 font-bold mb-2">// Professional Summary</div>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
              <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <div className="text-green-600 font-bold mb-3">// Technical Skills</div>
            <div className="bg-gray-900 text-green-400 p-4 rounded">
              <div className="text-green-500 mb-2">const skills = [</div>
              <div className="pl-4">
                {data.skills.map((skill, index) => (
                  <div key={index} className="text-yellow-400">
                    "{skill}"{index < data.skills.length - 1 ? "," : ""}
                  </div>
                ))}
              </div>
              <div className="text-green-500">];</div>
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <div className="text-green-600 font-bold mb-3">// Work Experience</div>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-300 rounded p-4">
                  <div className="text-blue-600 mb-1">/* Experience #{index + 1} */</div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-indigo-600 font-semibold">
                        {exp.company} | {exp.location}
                      </p>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-6">
            <div className="text-green-600 font-bold mb-3">// Featured Projects</div>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={project.id} className="border border-gray-300 rounded p-4">
                  <div className="text-blue-600 mb-1">/* Project #{index + 1} */</div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2">
                      {project.url && <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">LIVE</div>}
                      {project.github && (
                        <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">REPO</div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 bg-gray-50 p-3 rounded">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="bg-gray-900 text-green-400 p-3 rounded">
                      <div className="text-green-500 mb-1">technologies: [</div>
                      <div className="pl-4">
                        {project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="text-yellow-400">
                            "{tech}"{techIndex < project.technologies.length - 1 ? "," : ""}
                          </div>
                        ))}
                      </div>
                      <div className="text-green-500">]</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <div className="text-green-600 font-bold mb-3">// Education</div>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={edu.id} className="border border-gray-300 rounded p-4">
                  <div className="text-blue-600 mb-1">/* Education #{index + 1} */</div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-indigo-600 font-semibold">
                        {edu.school} | {edu.location}
                      </p>
                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">{formatDate(edu.graduationDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-gray-500 text-sm mt-8 border-t pt-4">
          <div className="font-mono">// End of resume.json</div>
        </div>
      </div>
    )
  }

  // Default fallback to modern template
  return (
    <div className="resume-preview-content p-8 bg-white text-gray-900 min-h-[11in] w-full">
      <div className="text-center text-gray-500">
        <p>Select a template to preview your resume</p>
      </div>
    </div>
  )
}
