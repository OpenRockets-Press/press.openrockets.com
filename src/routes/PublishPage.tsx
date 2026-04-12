import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Publication } from "@shared/types";
import { getCurrentUser, submitPublication, toUserFacingError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";

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
          <Link className="solid-button" to="/login">
            Go to Sign In
          </Link>
          <Link className="ghost-button" to="/register">
            Create Account
          </Link>
        </div>
      </main>
    );
  }

  if (user.accountStatus !== "active") {
    return (
      <main className="page-wrap legal-wrap">
        <h1>Account Pending Activation</h1>
        <p>
          Your account status is <strong>{user.accountStatus}</strong>. Complete consent and activation before
          uploading submissions.
        </p>
        <div className="button-row">
          <Link className="solid-button" to="/consent/in-session">
            Continue Consent
          </Link>
          <Link className="ghost-button" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const isSubmitDisabled = !title.trim() || !file || submitMutation.isPending;

  return (
    <AppShell>
      <div className="dash-page">
      <section className="panel">
        <p className="eyebrow">Contributor Workflow</p>
        <h1>Submit A Publication</h1>
        <p className="muted">
          Upload your manuscript or publication package. Submissions enter moderation review and appear in your
          dashboard timeline immediately.
        </p>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}

        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            submitMutation.mutate();
          }}
        >
          <label className="field-group">
            <span>Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Human-Centered Propulsion Design"
              required
            />
          </label>

          <label className="field-group">
            <span>Abstract</span>
            <textarea
              rows={5}
              value={abstract}
              onChange={(event) => setAbstract(event.target.value)}
              placeholder="Summarize your submission for editors and moderators."
            />
          </label>

          <div className="form-two-col">
            <label className="field-group">
              <span>Type</span>
              <select value={type} onChange={(event) => setType(event.target.value as Publication["type"])}>
                {publicationTypes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>License</span>
              <select value={license} onChange={(event) => setLicense(event.target.value as Publication["license"])}>
                {publicationLicenses.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-group">
            <span>Tags</span>
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="orbital mechanics, classroom, engines"
            />
            <small>Comma-separated. Up to 12 tags.</small>
          </label>

          <label className="field-group">
            <span>Publication file</span>
            <input
              key={file ? file.name : "file-empty"}
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
            <small>{file ? `Selected: ${file.name}` : "Accepted formats depend on your moderation policy."}</small>
          </label>

          <label className="field-group">
            <span>Cover image (optional)</span>
            <input
              key={coverFile ? coverFile.name : "cover-empty"}
              type="file"
              accept="image/*"
              onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="button-row">
            <button type="submit" className="solid-button" disabled={isSubmitDisabled}>
              {submitMutation.isPending ? "Submitting..." : "Submit For Review"}
            </button>
          </div>
        </form>
      </section>
      </div>
    </AppShell>
  );
}
