export function HeroSection() {
  return (
    <section className="relative z-10 text-center py-12 md:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight">
          Where Night Owls Gather
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
          A sanctuary for late-night thoughts, deep conversations, and meaningful connections when the world sleeps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          <div className="glassmorphism p-4 md:p-6 rounded-2xl animate-float">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
              alt="Peaceful meditation space"
              className="w-full h-24 md:h-32 object-cover rounded-lg mb-3 md:mb-4"
            />
            <h3 className="text-base md:text-lg font-semibold mb-2">Mindful Spaces</h3>
            <p className="text-gray-400 text-xs md:text-sm">Find peace in our guided meditation and wellness communities</p>
          </div>

          <div className="glassmorphism p-4 md:p-6 rounded-2xl animate-float" style={{ animationDelay: '0.5s' }}>
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
              alt="Cozy coffee shop at night"
              className="w-full h-24 md:h-32 object-cover rounded-lg mb-3 md:mb-4"
            />
            <h3 className="text-base md:text-lg font-semibold mb-2">Night Conversations</h3>
            <p className="text-gray-400 text-xs md:text-sm">Connect with fellow insomniacs and deep thinkers worldwide</p>
          </div>

          <div className="glassmorphism p-4 md:p-6 rounded-2xl animate-float sm:col-span-2 md:col-span-1" style={{ animationDelay: '1s' }}>
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
              alt="Person writing journal by moonlight"
              className="w-full h-24 md:h-32 object-cover rounded-lg mb-3 md:mb-4"
            />
            <h3 className="text-base md:text-lg font-semibold mb-2">Digital Journals</h3>
            <p className="text-gray-400 text-xs md:text-sm">Chronicle your midnight thoughts in beautiful, private diaries</p>
          </div>
        </div>
      </div>
    </section>
  );
}