"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  uploadResume,
  getLatestResume,
  deleteResume,
} from "@/services/resumeService";

import {
  Resume,
  ResumeAnalysis,
} from "@/types/resume";

import InfoCard from "@/components/resume/InfoCard";
import UploadCard from "@/components/resume/UploadCard";
import ResumeScore from "@/components/resume/ResumeScore";

import {
  Code2,
  GraduationCap,
  FolderKanban,
  Briefcase,
  Award,
} from "lucide-react";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
  const loadData = async () => {
    try {
      const data = await getLatestResume();
      setResume(data);
    } catch {
      setResume(null);
    }
  };

  loadData();
}, []);

  const fetchResume = async () => {
    try {
      const data = await getLatestResume();
      setResume(data);
    } catch {
      setResume(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF");
      return;
    }

    try {
      setUploading(true);

      await uploadResume(file);

      toast.success("Resume uploaded successfully");

      setFile(null);

      await fetchResume();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResume();

      setResume(null);

      toast.success("Resume deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const analysis =
    resume?.analysis_json as ResumeAnalysis | undefined;
      return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">
          Resume Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          AI extracted and analyzed your latest resume.
        </p>

      </div>

      {/* Top Cards */}

      <div className="grid gap-6 lg:grid-cols-3">

        {analysis ? (

          <InfoCard
            analysis={analysis}
            filename={resume?.filename ?? "-"}
          />

        ) : (

          <div className="rounded-xl border bg-card p-6 lg:col-span-2">

            <p className="text-muted-foreground">
              Upload a resume to begin.
            </p>

          </div>

        )}

        <UploadCard
          uploading={uploading}
          resumeExists={!!resume}
          onFileChange={setFile}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />

      </div>

      {analysis && (

        <>

          <ResumeScore
  score={analysis.resume_score}
  strengths={analysis.strengths}
  improvements={analysis.improvements}
/>

          {/* Skills */}

          <div className="rounded-xl border bg-card p-6">

            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <Code2 className="h-5 w-5" />
              Skills
            </h2>

            <div className="flex flex-wrap gap-3">

              {analysis.skills.map((skill, index) => (

                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>

          <div className="grid gap-6">
          {/* Education */}

<div className="rounded-xl border bg-card p-6">

  <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
    <GraduationCap className="h-5 w-5" />
    Education
  </h2>

  <div className="space-y-4">

    {analysis.education.map((edu, index) => (

      <div
        key={index}
        className="rounded-lg border p-4"
      >

        <h3 className="text-lg font-semibold">
          {edu.qualification}
        </h3>

        <p className="text-muted-foreground">
          {edu.institution}
        </p>

        <div className="mt-3 flex gap-8 text-sm">

          <span>
            <strong>Year:</strong> {edu.year}
          </span>

          <span>
            <strong>Percentage:</strong> {edu.percentage}
          </span>

        </div>

      </div>

    ))}

  </div>

</div>
{/* Projects */}

<div className="rounded-xl border bg-card p-6">

  <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
    <FolderKanban className="h-5 w-5" />
    Projects
  </h2>

  <div className="space-y-4">

    {analysis.projects.length === 0 ? (

      <p className="text-muted-foreground">
        No projects found.
      </p>

    ) : (

      analysis.projects.map((project, index) => (

        <div
          key={index}
          className="rounded-lg border p-4"
        >

          <h3 className="text-lg font-semibold">
            {project.name}
          </h3>

          <p className="mt-2 text-muted-foreground">
            {project.description}
          </p>

        </div>

      ))

    )}

  </div>

</div>
{/* Experience */}

<div className="rounded-xl border bg-card p-6">

  <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
    <Briefcase className="h-5 w-5" />
    Experience
  </h2>

  <div className="space-y-4">

    {analysis.experience.length === 0 ? (

      <p className="text-muted-foreground">
        No experience found.
      </p>

    ) : (

      analysis.experience.map((exp, index) => (

        <div
          key={index}
          className="rounded-lg border p-4"
        >

          <h3 className="text-lg font-semibold">
            {exp.role}
          </h3>

          <p className="text-muted-foreground">
            {exp.company}
          </p>

          {exp.duration && (
            <p className="mt-2 text-sm text-blue-600">
              {exp.duration}
            </p>
          )}

          {exp.description && (
            <p className="mt-3">
              {exp.description}
            </p>
          )}

        </div>

      ))

    )}

  </div>

</div>
{/* Certifications */}

<div className="rounded-xl border bg-card p-6">

  <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
    <Award className="h-5 w-5" />
    Certifications
  </h2>

  <div className="space-y-3">

    {analysis.certifications.length === 0 ? (

      <p className="text-muted-foreground">
        No certifications found.
      </p>

    ) : (

      analysis.certifications.map((cert, index) => (

        <div
          key={index}
          className="rounded-lg border p-4"
        >

          <h3 className="font-semibold">
            {cert.name}
          </h3>

          {cert.issuer && (
            <p className="text-muted-foreground">
              {cert.issuer}
            </p>
          )}

          {cert.year && (
            <p className="text-sm text-blue-600">
              {cert.year}
            </p>
          )}

        </div>

      ))

    )}

  </div>

</div>
          </div> {/* End grid */}

        </>

      )}

    </div>
  );
}