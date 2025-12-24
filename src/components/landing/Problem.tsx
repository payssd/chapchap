import { AlertTriangle, Clock, MessageSquare, TrendingDown } from "lucide-react";

export function Problem() {
  const painPoints = [
    {
      icon: Clock,
      title: "Endless Follow-ups",
      description:
        "Spending hours every week sending payment reminders manually",
    },
    {
      icon: MessageSquare,
      title: "Awkward Conversations",
      description:
        "Uncomfortable calls asking clients to pay their overdue invoices",
    },
    {
      icon: TrendingDown,
      title: "Cash Flow Problems",
      description:
        "Late payments affecting your ability to pay suppliers and staff",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-sm font-medium text-red-400 mb-6">
            <AlertTriangle className="h-4 w-4" />
            The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Tired of Late Payments{" "}
            <span className="text-red-400">Killing Your Cash Flow?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            You&apos;re not alone. Late payments are the #1 challenge for East African
            SMEs, causing stress and threatening business survival.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <p className="text-5xl font-bold text-red-400 mb-2">70%</p>
            <p className="text-gray-400">
              of invoices in East Africa are paid late
            </p>
          </div>
          <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <p className="text-5xl font-bold text-red-400 mb-2">45 days</p>
            <p className="text-gray-400">
              average time to receive payment
            </p>
          </div>
          <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <p className="text-5xl font-bold text-red-400 mb-2">60%</p>
            <p className="text-gray-400">
              of SMEs face cash flow issues due to late payments
            </p>
          </div>
        </div>

        {/* Pain Points */}
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <point.icon className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
              <p className="text-gray-400">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
