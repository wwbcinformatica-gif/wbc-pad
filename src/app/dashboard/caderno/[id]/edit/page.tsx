"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import CadernoEditor from "@/components/caderno-editor"

export default function EditCadernoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single()

    if (error) { setError(error.message); setLoading(false); return }
    if (data) {
      setTitle(data.title || "")
      setContent(data.content || "")
      setTags(Array.isArray(data.tags) ? data.tags : [])
      setPinned(data.pinned || false)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    const record: Record<string, any> = {
      title: title.trim(),
      content,
      pinned,
      type: "caderno",
      updated_at: new Date().toISOString(),
    }

    if (tags.length > 0) record.tags = tags

    let result = await supabase.from("notes").update(record).eq("id", id)
    let err = result.error

    if (err && err.code === "42703") {
      delete record.tags
      result = await supabase.from("notes").update(record).eq("id", id)
      err = result.error
    }

    if (err) { setError(err.message); setSaving(false); return }

    router.push("/dashboard/caderno")
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Excluir esta página do caderno?")) return
    await supabase.from("notes").delete().eq("id", id)
    router.push("/dashboard/caderno")
    router.refresh()
  }

  async function handleTogglePin() {
    const newPinned = !pinned
    setPinned(newPinned)
    await supabase.from("notes").update({ pinned: newPinned }).eq("id", id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <CadernoEditor
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      tags={tags}
      setTags={setTags}
      pinned={pinned}
      onTogglePin={handleTogglePin}
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      backHref="/dashboard/caderno"
      pageTitle="Editar Página"
    />
  )
}
