"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import CadernoEditor from "@/components/caderno-editor"

export default function NewCadernoPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Não autenticado"); setSaving(false); return }

    const record: Record<string, any> = {
      user_id: user.id,
      title: title.trim(),
      content,
      type: "caderno",
      pinned: false,
      checklist: [],
    }

    if (tags.length > 0) record.tags = tags

    let result = await supabase.from("notes").insert(record)
    let err = result.error

    if (err && err.code === "42703") {
      delete record.tags
      result = await supabase.from("notes").insert(record)
      err = result.error
    }

    if (err) { setError(err.message); setSaving(false); return }

    router.push("/dashboard/caderno")
    router.refresh()
  }

  return (
    <CadernoEditor
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      tags={tags}
      setTags={setTags}
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      backHref="/dashboard/caderno"
      pageTitle="Nova Página do Caderno"
    />
  )
}
