export default function ProjectsSection() {
  const projects = [
    {
      title: "EduLife Hub",
      description: "A comprehensive educational platform built with React, TypeScript, and Supabase, designed to enhance the student experience with modern web technologies.",
      technologies: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
      link: "https://github.com/bussy12682/Edulife-Hub",
      github: "https://github.com/bussy12682/Edulife-Hub",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Aethra Project",
      description: "A blockchain-based project for secure transactions and decentralized applications.",
      technologies: ["Blockchain", "Cryptocurrency", "Smart Contracts"],
      link: "https://github.com/bussy12682/Aethra-project",
      github: "https://github.com/bussy12682/Aethra-project",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "NYC Congress 2026",
      description: "A full-stack registration system with email notifications and admin dashboard for CAMC National Youth Congress.",
      technologies: ["HTML", "JavaScript", "Node.js", "Email Integration"],
      link: "https://github.com/ROCK-TECH-web/Nyc-Congress",
      github: "https://github.com/ROCK-TECH-web/Nyc-Congress",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="projects" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          My Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a
                    href={project.link}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    Live Demo
                  </a>
                  <a
                    href={project.github}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}