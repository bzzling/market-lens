'use client'

export default function Learn() {
  return (
    <main className="flex-1">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
          <p className="text-muted-foreground">
            Expand your investment knowledge with our educational content
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Stock Market Basics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn the fundamentals of how the stock market works
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Start Learning
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Investment Strategies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover different approaches to building wealth
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Start Learning
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Risk Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how to protect your investments
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}