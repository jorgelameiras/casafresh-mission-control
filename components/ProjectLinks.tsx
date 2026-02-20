'use client'

interface Project {
  emoji: string
  name: string
  description: string
  url: string
  isExternal?: boolean
}

const PROJECTS: Project[] = [
  {
    emoji: '📄',
    name: 'CasaFresh Website',
    description: 'Marketing site & landing page',
    url: 'file:///Users/jarvis/.openclaw/workspace-coder/index.html',
    isExternal: true,
  },
  {
    emoji: '🎛️',
    name: 'Mission Control',
    description: 'This dashboard',
    url: 'http://localhost:3000',
  },
  {
    emoji: '👥',
    name: 'CRM',
    description: 'Client relationship manager',
    url: 'http://localhost:3001',
  },
  {
    emoji: '📊',
    name: 'Design System',
    description: 'UI components & styles',
    url: 'file:///Users/jarvis/.openclaw/workspace-coder/design-system.html',
    isExternal: true,
  },
]

export default function ProjectLinks() {
  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-xl border"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mr-1 flex-shrink-0">
        Projects
      </span>

      <div className="flex flex-wrap gap-2">
        {PROJECTS.map(project => (
          <a
            key={project.name}
            href={project.url}
            target={project.isExternal ? '_blank' : '_blank'}
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-150 hover:border-green-800/60 hover:bg-green-950/20"
            style={{
              backgroundColor: '#0d1320',
              borderColor: '#1F2937',
              textDecoration: 'none',
            }}
          >
            <span className="text-sm leading-none">{project.emoji}</span>
            <div>
              <div className="text-[11px] font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">
                {project.name}
              </div>
              <div className="text-[9px] text-gray-600 leading-tight">
                {project.description}
              </div>
            </div>
            <span className="text-[9px] text-gray-700 group-hover:text-gray-500 ml-0.5 transition-colors">
              ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
