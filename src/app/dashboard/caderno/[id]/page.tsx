import { createServerSupabase } from "@/lib/supabase-server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "@/components/markdown-renderer"

interface Props {
  params: Promise<{ id: string }>
}

export default async function CadernoViewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!note) return notFound()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/caderno">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <Link href={`/dashboard/caderno/${id}/edit`}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </Link>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #fdf8e1 0%, #fef9e4 100%)",
          border: "1px solid #e8d98a",
          borderLeft: "8px solid #f59e0b",
          boxShadow: "3px 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div
          className="px-8 pt-6 pb-2 text-2xl font-bold text-gray-800"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {note.title || "Sem título"}
        </div>
        <div className="mx-8 h-px mb-2" style={{ background: "#d4c17f88" }} />

        <div className="px-4 sm:px-8 py-4 min-h-[300px] text-base text-gray-700 leading-relaxed max-w-none break-words overflow-x-hidden">
          <MarkdownRenderer content={note.content || ""} />
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {note.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
