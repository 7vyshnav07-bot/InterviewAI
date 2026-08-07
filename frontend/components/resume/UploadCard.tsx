import { Upload, Loader2 } from "lucide-react";

interface UploadCardProps {
  uploading: boolean;
  resumeExists: boolean;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  onDelete: () => void;
}

export default function UploadCard({
  uploading,
  resumeExists,
  onFileChange,
  onUpload,
  onDelete,
}: UploadCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">

      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
        <Upload className="h-5 w-5" />
        Upload Resume
      </h2>

      <input
        type="file"
        accept=".pdf"
        className="mb-5 w-full"
        onChange={(e) =>
          onFileChange(e.target.files?.[0] ?? null)
        }
      />

      <button
        onClick={onUpload}
        disabled={uploading}
        className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Resume"
        )}
      </button>

      {resumeExists && (
        <button
          onClick={onDelete}
          className="mt-3 w-full rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
        >
          Delete Resume
        </button>
      )}

    </div>
  );
}