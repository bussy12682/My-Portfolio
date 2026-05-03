export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Hi! I'm a passionate developer with experience in building modern web applications.
              I enjoy working with cutting-edge technologies and creating user-friendly experiences.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects,
              or enjoying outdoor activities.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                Problem Solver
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                Team Player
              </span>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                Creative Thinker
              </span>
            </div>
          </div>
          <div className="text-center">
            <img src="/my-pic.jpeg" alt="Your Photo" className="w-64 h-64 rounded-full object-cover mx-auto mb-4" />
          </div>
        </div>
      </div>
    </section>
  );
}