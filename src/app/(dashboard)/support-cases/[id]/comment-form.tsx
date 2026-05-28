"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    const res = await fetch("/api/support-cases/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, comment: comment.trim() }),
    });

    setLoading(false);

    if (res.ok) {
      setComment("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al enviar comentario");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Escribir comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        required
      />
      <Button type="submit" disabled={loading || !comment.trim()}>
        {loading ? "Enviando..." : "Comentar"}
      </Button>
    </form>
  );
}
