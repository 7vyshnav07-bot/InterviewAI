import { User, Mail, Phone } from "lucide-react";

interface InfoCardProps {
  analysis: {
    name: string;
    email: string;
    phone: string;
  };
  filename: string;
}

export default function InfoCard({
  analysis,
  filename,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 lg:col-span-2">

      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
        <User className="h-5 w-5" />
        Personal Information
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        <InfoRow
          title="Name"
          value={analysis.name}
        />

        <InfoRow
          title="Email"
          value={analysis.email}
          icon={<Mail className="h-4 w-4" />}
        />

        <InfoRow
          title="Phone"
          value={analysis.phone}
          icon={<Phone className="h-4 w-4" />}
        />

        <InfoRow
          title="Resume"
          value={filename}
        />

      </div>

    </div>
  );
}

function InfoRow({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>

      <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {title}
      </p>

      <p className="font-medium">
        {value || "-"}
      </p>

    </div>
  );
}