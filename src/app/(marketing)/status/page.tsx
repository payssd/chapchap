import { Metadata } from "next";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status | ChapChap",
  description: "Check the current status of ChapChap services.",
};

const services = [
  {
    name: "Web Application",
    status: "operational",
    uptime: "99.99%",
  },
  {
    name: "API",
    status: "operational",
    uptime: "99.98%",
  },
  {
    name: "Payment Processing",
    status: "operational",
    uptime: "99.99%",
  },
  {
    name: "Email Notifications",
    status: "operational",
    uptime: "99.95%",
  },
  {
    name: "SMS Notifications",
    status: "operational",
    uptime: "99.90%",
  },
  {
    name: "WhatsApp Notifications",
    status: "operational",
    uptime: "99.85%",
  },
];

const recentIncidents = [
  {
    date: "Dec 15, 2024",
    title: "Scheduled Maintenance",
    description: "Routine database maintenance completed successfully.",
    status: "resolved",
    duration: "15 minutes",
  },
  {
    date: "Dec 1, 2024",
    title: "SMS Delivery Delays",
    description: "Some SMS notifications experienced delays due to carrier issues.",
    status: "resolved",
    duration: "45 minutes",
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "operational":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "outage":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded Performance";
    case "outage":
      return "Major Outage";
    default:
      return "Unknown";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "operational":
      return "text-green-600 bg-green-50";
    case "degraded":
      return "text-yellow-600 bg-yellow-50";
    case "outage":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
            allOperational ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {allOperational ? (
              <>
                <CheckCircle className="h-4 w-4" />
                All Systems Operational
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Some Systems Experiencing Issues
              </>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            System <span className="text-[#FF6B35]">Status</span>
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto">
            Real-time status of ChapChap services and infrastructure.
          </p>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8">
            Services
          </h2>
          <div className="bg-white rounded-2xl border shadow-sm divide-y">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <span className="font-medium text-[#1A2332]">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {service.uptime} uptime
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8">
            Recent Incidents
          </h2>
          
          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#1A2332]">{incident.title}</h3>
                    <span className="text-sm text-gray-500">{incident.date}</span>
                  </div>
                  <p className="text-[#44403C] text-sm mb-3">{incident.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                      Resolved
                    </span>
                    <span className="text-gray-500">Duration: {incident.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border shadow-sm text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-[#44403C]">No recent incidents to report.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-4">
            Stay Updated
          </h2>
          <p className="text-[#44403C] mb-6">
            Subscribe to receive notifications about service status and scheduled maintenance.
          </p>
          <p className="text-sm text-gray-500">
            Status updates are also posted on our{" "}
            <a href="https://twitter.com/chapchap" className="text-[#FF6B35] hover:underline">
              Twitter
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
