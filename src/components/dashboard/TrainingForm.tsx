"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TrainingFormValues {
  title: string;
  summary: string;
  content: string;
  category: string;
  estimatedMinutes: number;
  quiz: QuizQuestion[];
  published: boolean;
  videoUrl?: string;
  featuredImage?: string;
  simulationTemplateId?: string;
}

const defaultValues: TrainingFormValues = {
  title: "",
  summary: "",
  content: "",
  category: "General",
  estimatedMinutes: 5,
  quiz: [],
  published: true,
  videoUrl: "",
  featuredImage: "",
  simulationTemplateId: "",
};

const CATEGORIES = [
  "General",
  "Phishing Awareness",
  "Password Security",
  "Social Engineering",
  "Email Security",
  "Data Protection",
  "Network Security",
  "Malware & Ransomware",
  "Mobile Security",
  "Incident Response",
];

interface TemplateOption {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
}

export function TrainingForm({ initial, moduleId }: { initial?: Partial<TrainingFormValues>; moduleId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<TrainingFormValues>({ ...defaultValues, ...initial });
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store the selected file locally — only upload to Cloudinary on submit
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initial?.featuredImage || "");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => {});
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Show a local preview immediately
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadToCloudinary(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "secureguard_uploads");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.secure_url;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Image upload failed.");
  }

  function update<K extends keyof TrainingFormValues>(key: K, value: TrainingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addQuestion() {
    update("quiz", [...values.quiz, { question: "", options: ["", ""], correctIndex: 0 }]);
  }

  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    const next = [...values.quiz];
    next[i] = { ...next[i], ...patch };
    update("quiz", next);
  }

  function removeQuestion(i: number) {
    update("quiz", values.quiz.filter((_, idx) => idx !== i));
  }

  function updateOption(qi: number, oi: number, value: string) {
    const next = [...values.quiz];
    const options = [...next[qi].options];
    options[oi] = value;
    next[qi] = { ...next[qi], options };
    update("quiz", next);
  }

  function addOption(qi: number) {
    const next = [...values.quiz];
    next[qi] = { ...next[qi], options: [...next[qi].options, ""] };
    update("quiz", next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    let submitValues = { ...values };

    // Upload image to Cloudinary if a new file was selected
    if (selectedFile) {
      try {
        const imageUrl = await uploadToCloudinary(selectedFile);
        if (imageUrl) {
          submitValues.featuredImage = imageUrl;
        }
      } catch (err: any) {
        setPending(false);
        setError(err.message || "Image upload failed.");
        return;
      }
    }

    const res = moduleId
      ? await fetch(`/api/training/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitValues),
      })
      : await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitValues),
      });

    setPending(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
      return;
    }
    router.push("/dashboard/admin/training");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card className="p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white">Title</label>
          <input
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white">Summary</label>
          <input
            required
            value={values.summary}
            onChange={(e) => update("summary", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white">YouTube Video URL (optional)</label>
          <input
            value={values.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            placeholder="e.g., https://www.youtube.com/watch?v=..."
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white mb-2 block">Featured Image (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl bg-surface/50 border border-border border-dashed p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-colors"
          >
            {previewUrl ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Featured" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-text-muted">Click to change image</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-muted">
                <ImageIcon size={24} />
                <span className="text-sm font-medium">Click to select an image.</span>
              </div>
            )}
          </button>
        </div>
        <div>
          <label className="text-sm font-semibold text-white">Category</label>
          <input
            required
            list="category-options"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="Select or type a category"
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <datalist id="category-options">
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-sm font-semibold text-white">Estimated minutes</label>
          <input
            required
            type="number"
            min={1}
            value={values.estimatedMinutes}
            onChange={(e) => update("estimatedMinutes", Number(e.target.value))}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white flex items-center justify-between">
            <span>Attached Phishing Simulation (Optional)</span>
            <span className="text-xs font-normal text-text-muted">Interactive lab for students</span>
          </label>
          <select
            value={values.simulationTemplateId || ""}
            onChange={(e) => update("simulationTemplateId", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="" className="bg-surface text-text-muted">None (Article & Quiz only)</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id} className="bg-surface text-white">
                {t.name} ({t.category} - {t.difficulty})
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1.5">
            Selecting a template attaches an interactive mock email simulation to this course so students practice threat inspection.
          </p>
        </div>

        <label className="flex items-center gap-2 sm:col-span-2 text-sm text-slate-dark">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
            className="rounded border-line"
          />
          Published (visible to students)
        </label>
      </Card>

      <Card className="p-6">
        <label className="text-sm font-semibold text-white">Lesson content (Markdown)</label>
        <p className="text-xs text-text-muted mt-1 mb-2">Write your lesson content here. Use markdown for headings, bold, lists, etc.</p>
        <div data-color-mode="dark">
          <MDEditor
            value={values.content}
            onChange={(val) => update("content", val || "")}
            height={400}
            className="w-full rounded-xl border border-border !bg-surface/50"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-white">Quiz questions</label>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} />
            Add question
          </button>
        </div>

        {values.quiz.length === 0 && <p className="text-sm text-slate">No quiz yet — module will auto-complete at 100%.</p>}

        <div className="space-y-5">
          {values.quiz.map((q, qi) => (
            <div key={qi} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <input
                  required
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                  placeholder={`Question ${qi + 1}`}
                  className="flex-1 rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button type="button" onClick={() => removeQuestion(qi)} className="text-text-muted hover:text-danger mt-2">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, { correctIndex: oi })}
                    />
                    <input
                      required
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 rounded-xl bg-surface/50 border border-border px-3 py-1.5 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs font-medium text-primary hover:underline ml-6"
                >
                  + Add option
                </button>
              </div>
              <p className="text-[11px] text-slate mt-2 ml-6">Select the radio button next to the correct answer.</p>
            </div>
          ))}
        </div>
      </Card>

      {error && <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (selectedFile ? "saving…" : "Saving…") : moduleId ? "Save changes" : "Create module"}
        </Button>
      </div>
    </form>
  );
}
