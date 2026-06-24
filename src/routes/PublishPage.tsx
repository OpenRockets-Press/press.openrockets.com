import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Publication } from "@shared/types";
import { getCurrentUser, submitPublication, toUserFacingError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { FloatInput } from "@/components/ui/FloatInput";
import { FloatTextarea } from "@/components/ui/FloatTextarea";

const publicationTypes: { value: Publication["type"]; label: string }[] = [
  { value: "book", label: "Book" },
  { value: "research_paper", label: "Research Paper" },
  { value: "magazine", label: "Magazine" },
  { value: "poster", label: "Poster" },
  { value: "other", label: "Other" },
];

const publicationLicenses: { value: Publication["license"]; label: string }[] = [
  { value: "CC_BY", label: "CC BY — Attribution" },
  { value: "CC0", label: "CC0 — Public Domain" },
  { value: "ORP_ND", label: "ORP ND — No Derivatives" },
];

export function PublishPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [type, setType] = useState<Publication["type"]>("book");
  const [license, setLicense] = useState<Publication["license"]>("CC_BY");
  const [tagsInput, setTagsInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!file) {
        throw new Error("Please select a publication file before submitting.");
      }

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12);

      return submitPublication({
        title: title.trim(),
        abstract: abstract.trim(),
        type,
        license,
        tags,
        file,
        coverFile: coverFile ?? undefined,
      });
    },
    onSuccess: (result) => {
      setError(null);
      setSuccess(`Submission received (${result.publication_id}). Moderators can now review it.`);
      setTitle("");
      setAbstract("");
      setType("book");
      setLicense("CC_BY");
      setTagsInput("");
      setFile(null);
      setCoverFile(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.contributor.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.contributor.publications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
    },
    onError: (mutationError) => {
      setSuccess(null);
      setError(toUserFacingError(mutationError));
    },
  });

  if (!user) {
    return (
      <main className="page-wrap legal-wrap">
        <h1>Publish</h1>
        <p>Sign in to submit a publication to Open Rockets Press.</p>
        <div className="button-row">
          <Link className="solid-button" to="/login">Go to Sign In</Link>
          <Link className="ghost-button" to="/register">Create Account</Link>
        </div>
      </main>
    );
  }

  if (user.accountStatus !== "active") {
    return (
      <main className="page-wrap legal-wrap">
        <h1>Account Pending Activation</h1>
        <p>
          Your account status is <strong>{user.accountStatus}</strong>. Complete consent and
          activation before uploading submissions.
        </p>
        <div className="button-row">
          <Link className="solid-button" to="/consent/in-session">Continue Consent</Link>
          <Link className="ghost-button" to="/dashboard">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  const isSubmitDisabled = !title.trim() || !file || submitMutation.isPending;

  return (
    <AppShell>
      <div className="dash-page">
        <header className="dash-page-header">
          <p className="eyebrow">Contributor Workflow</p>
          <h1>Submit a Publication</h1>
          <p className="muted">
            Upload your manuscript or publication package. Submissions enter moderation review
            and appear in your dashboard timeline immediately.
          </p>
        </header>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form
          className="publish-form"
          onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(); }}
        >
          <FloatInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=" "
            hint='e.g. "Human-Centered Propulsion Design"'
          />

          <FloatTextarea
            label="Abstract"
            rows={5}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder=" "
            hint="Summarize your submission for editors and moderators."
          />

          <div className="publish-two-col">
            <div className={`float-field float-select float-filled`}>
              <label className="float-label">Type</label>
              <select
                className="float-input float-select-input"
                aria-label="Publication type"
                value={type}
                onChange={(e) => setType(e.target.value as Publication["type"])}
              >
                {publicationTypes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="float-accent" aria-hidden="true" />
            </div>

            <div className={`float-field float-select float-filled`}>
              <label className="float-label">License</label>
              <select
                className="float-input float-select-input"
                aria-label="Publication license"
                value={license}
                onChange={(e) => setLicense(e.target.value as Publication["license"])}
              >
                {publicationLicenses.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="float-accent" aria-hidden="true" />
            </div>
          </div>

          <FloatInput
            label="Tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder=" "
            hint="Comma-separated. Up to 12 tags. e.g. orbital mechanics, classroom, engines"
          />

          <label className="field-group publish-file-field">
            <span>Publication file</span>
            <input
              key={file ? file.name : "file-empty"}
              type="file"
              accept=".pdf,.epub,.zip,application/pdf,application/epub+zip,application/zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            <small>{file ? `Selected: ${file.name}` : "PDF, EPUB, or ZIP accepted."}</small>
          </label>

          <label className="field-group publish-file-field">
            <span>Cover image <span className="muted">(optional)</span></span>
            <input
              key={coverFile ? coverFile.name : "cover-empty"}
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="publish-actions">
            <button type="submit" className="solid-button" disabled={isSubmitDisabled}>
              {submitMutation.isPending ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
