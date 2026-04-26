export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">Hello, I'm a Software Engineer</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl text-center">
        Welcome to my personal hub. I specialize in building efficient web applications and AI research.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-semibold mb-3">Projects</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Personal Hub (This site!)</li>
            <li>AI Image Generator</li>
            <li>Real-time Chat App</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-semibold mb-3">Links</h2>
          <div className="flex flex-col gap-2 text-blue-600">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  );
}
