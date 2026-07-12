"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Users,
  CreditCard,
  Shield,
  Search,
  Trash2,
  Crown,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Pencil,
  X,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAppConfig, saveAppConfig } from "@/lib/app-config"

interface UserProfile {
  id: string
  email: string
  name: string
  subscription_status: string
  trial_ends_at: string
  subscription_ends_at: string
  role: string
  created_at: string
}

interface SubscriptionPlan {
  id: string
  user_id: string
  amount: number
  duration_days: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

interface NewUserForm {
  email: string
  password: string
  name: string
  role: string
  subscription_status: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState("")
  const [trialDays, setTrialDays] = useState(7)
  const [trialDaysSaving, setTrialDaysSaving] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [customPlan, setCustomPlan] = useState({
    amount: "",
    duration_days: "7"
  })
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: "",
    password: "",
    name: "",
    role: "user",
    subscription_status: "trial"
  })
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'email' | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editModalUser, setEditModalUser] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    subscription_status: "",
    trial_ends_at: "",
    subscription_ends_at: "",
  })
  const [editModalSaving, setEditModalSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getAdmin = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('Auth error:', authError)
          router.push("/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          router.push("/dashboard")
          return
        }

        if (profile?.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
        loadUsers()
        loadSubscriptionPlans()
        loadConfig()
      } catch (error) {
        console.error('Error checking admin:', error)
        router.push("/dashboard")
      }
    }
    
    getAdmin()
  }, [router, supabase])

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setUsers(data)
    setLoading(false)
  }

  async function loadSubscriptionPlans() {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (data) setSubscriptionPlans(data)
  }

  async function loadConfig() {
    const config = await getAppConfig()
    setTrialDays(config.trial_days)
  }

  async function handleSaveTrialDays() {
    if (trialDays < 1 || trialDays > 365) {
      alert("Dias de trial deve ser entre 1 e 365")
      return
    }
    setTrialDaysSaving(true)
    const ok = await saveAppConfig({ trial_days: trialDays })
    if (ok) {
      alert(`Trial atualizado para ${trialDays} dias`)
    } else {
      alert("Erro ao salvar configuração")
    }
    setTrialDaysSaving(false)
  }

   async function updateUserStatus(userId: string, status: string) {
     try {
       // Atualizar o status da assinatura
        const updateData: Record<string, string | null> = { subscription_status: status };
       
        // Se for trial, definir trial_ends_at para {trialDays} dias a partir de agora
        if (status === "trial") {
          updateData.trial_ends_at = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
       }
       
       // Se for active ou expired, limpar trial_ends_at
       if (status === "active" || status === "expired") {
         updateData.trial_ends_at = null;
       }
       
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId);
        if (updateError) throw updateError;
          
        // Se estiver ativando uma assinatura paga, criar um plano padrão
       if (status === "active") {
         // Verificar se já existe um plano de subscription para este usuário
         const { data: existingPlan } = await supabase
           .from("subscription_plans")
           .select("id")
           .eq("user_id", userId)
           .single();
           
         // Se não existir, criar um plano gratuito padrão
         if (!existingPlan) {
           const startDate = new Date().toISOString();
           const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
           
            const { error: planInsertError } = await supabase
              .from("subscription_plans")
              .insert({
                user_id: userId,
                amount: 0,
                duration_days: 30,
                start_date: startDate,
                end_date: endDate,
                status: "active"
              });
            if (planInsertError) throw planInsertError;
         }
       }
       
       loadUsers();
     } catch (error) {
       console.error("Error updating user status:", error);
       alert("Erro ao atualizar status do usuário");
     }
   }

   async function updateUserDetails(userId: string, name: string, email: string) {
     if (!name.trim() || !email.trim()) {
       alert("Nome e email não podem estar vazios");
       return;
     }

     try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ name, email })
          .eq("id", userId);
        if (updateError) throw updateError;
       
       // Fechar modo de edição se estiver ativo
       if (editingUserId === userId) {
         setEditingUserId(null);
         setEditingField(null);
         setEditValue("");
       }
       
       alert("Usuário atualizado com sucesso!");
       loadUsers();
     } catch (error) {
       console.error("Error updating user details:", error);
       alert("Erro ao atualizar usuário");
     }
   }

  function openEditModal(user: UserProfile) {
    setEditForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      subscription_status: user.subscription_status,
      trial_ends_at: user.trial_ends_at?.split("T")[0] || "",
      subscription_ends_at: user.subscription_ends_at?.split("T")[0] || "",
    })
    setEditModalUser(user)
  }

  function closeEditModal() {
    setEditModalUser(null)
  }

  async function saveEditModal() {
    if (!editModalUser) return
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert("Nome e email são obrigatórios")
      return
    }

    setEditModalSaving(true)
    try {
      const updateData: Record<string, string | null> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        subscription_status: editForm.subscription_status,
      }

      if (editForm.subscription_status === "trial" && editForm.trial_ends_at) {
        updateData.trial_ends_at = new Date(editForm.trial_ends_at + "T23:59:59").toISOString()
      } else if (editForm.subscription_status === "trial") {
        updateData.trial_ends_at = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      } else {
        updateData.trial_ends_at = null
      }

      if (editForm.subscription_ends_at) {
        updateData.subscription_ends_at = new Date(editForm.subscription_ends_at + "T23:59:59").toISOString()
      } else {
        updateData.subscription_ends_at = null
      }

      const { error: updateError } = await supabase.from("profiles").update(updateData).eq("id", editModalUser.id)
      if (updateError) throw updateError

      if (editForm.subscription_status === "active") {
        const { data: existingPlan } = await supabase
          .from("subscription_plans")
          .select("id")
          .eq("user_id", editModalUser.id)
          .single()

        if (!existingPlan) {
          const startDate = new Date().toISOString()
          const endDate = editForm.subscription_ends_at
            ? new Date(editForm.subscription_ends_at + "T23:59:59").toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

          const { error: planInsertError } = await supabase.from("subscription_plans").insert({
            user_id: editModalUser.id,
            amount: 0,
            duration_days: 30,
            start_date: startDate,
            end_date: endDate,
            status: "active",
          })
          if (planInsertError) throw planInsertError
        }
      }

      alert("Usuário atualizado com sucesso!")
      closeEditModal()
      loadUsers()
      loadSubscriptionPlans()
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Erro ao salvar usuário")
    } finally {
      setEditModalSaving(false)
    }
  }

  async function toggleAdminRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
    if (error) { alert("Erro ao alterar permissão: " + error.message); return }
    loadUsers()
  }

  async function deleteUser(userId: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return
    const { error: pwError } = await supabase.from("passwords").delete().eq("user_id", userId)
    if (pwError) { alert("Erro ao excluir senhas: " + pwError.message); return }
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)
    if (profileError) { alert("Erro ao excluir perfil: " + profileError.message); return }
    loadUsers()
    alert("Usuário excluído com sucesso!")
  }

   async function assignCustomPlan() {
     if (!selectedUser || !customPlan.amount || !customPlan.duration_days) return

     try {
       const amount = parseFloat(customPlan.amount)
       const durationDays = parseInt(customPlan.duration_days)
       
       const startDate = new Date().toISOString()
       const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

       const { error: planError } = await supabase
          .from("subscription_plans")
          .upsert({
            user_id: selectedUser,
            amount: amount,
            duration_days: durationDays,
            start_date: startDate,
            end_date: endDate,
            status: "active"
          }, { onConflict: 'user_id' })
        if (planError) throw planError

        // Update user profile
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ 
            subscription_status: "active",
            subscription_ends_at: endDate
          })
          .eq("id", selectedUser)
        if (profileUpdateError) throw profileUpdateError

       // Reset form
       setCustomPlan({ amount: "", duration_days: "7" })
       setSelectedUser(null)
       alert("Plano personalizado atribuído com sucesso!")
       loadUsers()
       loadSubscriptionPlans()
     } catch (error) {
       console.error("Error assigning custom plan:", error)
       alert("Erro ao atribuir plano personalizado")
     }
   }

   async function registerUser() {
     if (!newUser.email || !newUser.password || !newUser.name) {
       setRegisterError("Por favor, preencha todos os campos obrigatórios")
       return
     }

     setRegistering(true)
     setRegisterError("")
     
     try {
       // First, create the auth user
       const { data: authData, error: authError } = await supabase.auth.signUp({
         email: newUser.email,
         password: newUser.password,
         options: {
           data: {
             name: newUser.name
           }
         }
       })

       if (authError) {
         // Handle specific Supabase errors
         if (authError.message?.includes('rate limit exceeded')) {
           throw new Error("Limite de tentativas excedido. Por favor, aguarde alguns minutos antes de tentar novamente ou use um email diferente.");
         }
         throw authError
       }
       
       // Handle case where user might not be immediately available (email confirmation required)
       if (!authData.user) {
         // Check if we need to get the user session instead
         const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
         if (sessionError) throw sessionError
         
         if (sessionData.session?.user) {
           // User is available in session
           authData.user = sessionData.session.user
         } else {
           throw new Error("Usuário criado, mas não foi possível obter os dados do usuário. Verifique seu email para confirmação.")
         }
       }

       // Then, create the profile
       const { error: profileError } = await supabase
         .from("profiles")
         .insert({
           id: authData.user.id,
           email: newUser.email,
           name: newUser.name,
           role: newUser.role,
           subscription_status: newUser.subscription_status,
            trial_ends_at: newUser.subscription_status === "trial" ? 
              new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString() : 
              null
         })

       if (profileError) throw profileError

       // If subscription status is active, create a subscription plan
       if (newUser.subscription_status === "active") {
         const startDate = new Date().toISOString()
         const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days default

          const { error: planInsertError } = await supabase
            .from("subscription_plans")
            .insert({
              user_id: authData.user.id,
              amount: 0,
              duration_days: 30,
              start_date: startDate,
              end_date: endDate,
              status: "active"
            })
          if (planInsertError) throw planInsertError
       }

       alert("Usuário cadastrado com sucesso!")
       setNewUser({
         email: "",
         password: "",
         name: "",
         role: "user",
         subscription_status: "trial"
       })
       loadUsers()
     } catch (error) {
       console.error("Error registering user:", error)
       const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar usuário"
       setRegisterError(errorMessage)
     } finally {
       setRegistering(false)
     }
   }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    active: users.filter((u) => u.subscription_status === "active").length,
    trial: users.filter((u) => u.subscription_status === "trial").length,
    expired: users.filter((u) => u.subscription_status === "expired").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-[var(--theme-primary)]" /> Painel Administrativo
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie usuários, assinaturas e planos personalizados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuários", value: stats.total, icon: Users, color: "text-blue-600" },
          { label: "Assinantes", value: stats.active, icon: Crown, color: "text-[var(--theme-secondary)]" },
          { label: "Trial", value: stats.trial, icon: CreditCard, color: "text-yellow-600" },
          { label: "Expirados", value: stats.expired, icon: Ban, color: "text-red-600" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${item.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trial Days Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Configuração de Trial</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Define quantos dias de teste grátis os novos usuários recebem ao se cadastrar.
            Atualmente: <strong>{trialDays} dias</strong>
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="365"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            />
            <Button onClick={handleSaveTrialDays} disabled={trialDaysSaving}>
              {trialDaysSaving ? "Salvando..." : "Salvar"}
            </Button>
            {trialDays === 0 && (
              <span className="text-xs text-green-600 font-medium">Acesso gratuito ilimitado</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Plan Assignment */}
       <Card>
         <CardHeader>
           <div className="flex items-center gap-2">
             <DollarSign className="w-5 h-5" />
             <h3 className="text-lg font-semibold">Plano Personalizado</h3>
           </div>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid md:grid-cols-3 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
               <select
                 value={selectedUser || ""}
                 onChange={(e) => setSelectedUser(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
               >
                 <option value="">Selecione um usuário</option>
                 {filteredUsers.map((user) => (
                   <option key={user.id} value={user.id}>
                     {user.name || user.email}
                   </option>
                 ))}
               </select>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
               <Input
                 type="number"
                 placeholder="0.00"
                 value={customPlan.amount}
                 onChange={(e) => setCustomPlan(prev => ({ ...prev, amount: e.target.value }))}
                 min="0"
                 step="0.01"
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Duração (dias)</label>
               <Input
                 type="number"
                 placeholder="7"
                 value={customPlan.duration_days}
                 onChange={(e) => setCustomPlan(prev => ({ ...prev, duration_days: e.target.value }))}
                 min="1"
               />
             </div>
           </div>
           
           <Button
             onClick={assignCustomPlan}
             disabled={!selectedUser || !customPlan.amount || !customPlan.duration_days}
             className="w-full"
           >
             Atribuir Plano Personalizado
           </Button>
         </CardContent>
       </Card>

       {/* New User Registration */}
       <Card>
         <CardHeader>
           <div className="flex items-center gap-2">
             <Users className="w-5 h-5" />
             <h3 className="text-lg font-semibold">Cadastrar Novo Usuário</h3>
           </div>
         </CardHeader>
         <CardContent className="space-y-4">
           {registerError && (
             <p className="text-sm text-red-500">{registerError}</p>
           )}
           <div className="grid md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
               <Input
                 value={newUser.name}
                 onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                 placeholder="Digite o nome completo"
                 required
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
               <Input
                 type="email"
                 value={newUser.email}
                 onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                 placeholder="usuario@exemplo.com"
                 required
               />
             </div>
           </div>
           <div className="grid md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
               <Input
                 type="password"
                 value={newUser.password}
                 onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                 placeholder="Digite uma senha segura"
                 required
                 minLength={6}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
               <select
                 value={newUser.role}
                 onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
               >
                 <option value="user">Usuário Comum</option>
                 <option value="admin">Administrador</option>
               </select>
             </div>
           </div>
           <div className="grid md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Status da Assinatura</label>
               <select
                 value={newUser.subscription_status}
                 onChange={(e) => setNewUser(prev => ({ ...prev, subscription_status: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
               >
                  <option value="trial">Trial ({trialDays} dias)</option>
                 <option value="active">Ativo</option>
                 <option value="canceled">Cancelado</option>
                 <option value="expired">Expirado</option>
               </select>
             </div>
           </div>
           
           <Button
             onClick={registerUser}
             disabled={registering}
             className="w-full"
           >
             {registering ? "Cadastrando..." : "Cadastrar Usuário"}
           </Button>
         </CardContent>
       </Card>

       {/* Subscription Plans History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Histórico de Planos</h3>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Usuário</th>
                <th className="text-left p-4 font-medium text-gray-600">Valor</th>
                <th className="text-left p-4 font-medium text-gray-600">Duração</th>
                <th className="text-left p-4 font-medium text-gray-600">Início</th>
                <th className="text-left p-4 font-medium text-gray-600">Fim</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionPlans.map((plan) => {
                const user = users.find(u => u.id === plan.user_id)
                return (
                  <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{user?.name || user?.email || "Desconhecido"}</td>
                    <td className="p-4 text-gray-600">R$ {plan.amount.toFixed(2)}</td>
                    <td className="p-4 text-gray-600">{plan.duration_days} dias</td>
                    <td className="p-4 text-gray-500 text-xs">{formatDate(plan.start_date)}</td>
                    <td className="p-4 text-gray-500 text-xs">{formatDate(plan.end_date)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.status === "active" ? <CheckCircle className="w-3 h-3" /> : null}
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Management */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20"
          placeholder="Buscar usuários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Nome</th>
                <th className="text-left p-4 font-medium text-gray-600">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Role</th>
                <th className="text-left p-4 font-medium text-gray-600">Cadastro</th>
                <th className="text-right p-4 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
             <tbody>
               {filteredUsers.map((u) => {
                 const isEditingName = editingUserId === u.id && editingField === 'name';
                 const isEditingEmail = editingUserId === u.id && editingField === 'email';
                 
                 return (
                   <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                     {/* Nome - Edição Inline */}
                     <td className="p-4">
                       {isEditingName ? (
                         <Input
                           value={editValue}
                           onChange={(e) => setEditValue(e.target.value)}
                           onBlur={async () => {
                             if (editValue.trim()) {
                               await updateUserDetails(u.id, editValue, u.email);
                               setEditingUserId(null);
                               setEditingField(null);
                               setEditValue("");
                             }
                           }}
                           onKeyPress={(e) => {
                             if (e.key === 'Enter' && editValue.trim()) {
                               updateUserDetails(u.id, editValue, u.email).then(() => {
                                 setEditingUserId(null);
                                 setEditingField(null);
                                 setEditValue("");
                               });
                             }
                           }}
                           autoFocus
                           className="w-full"
                         />
                       ) : (
                         <>
                           <span className="font-medium text-gray-900">{u.name || "-"}</span>
                           {!isEditingName && (
                             <button
                               onClick={() => {
                                 setEditingUserId(u.id);
                                 setEditingField('name');
                                 setEditValue(u.name || "");
                               }}
                               className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] ml-2"
                             >
                               Editar
                             </button>
                           )}
                         </>
                       )}
                     </td>
                     
                     {/* Email - Edição Inline */}
                     <td className="p-4">
                       {isEditingEmail ? (
                         <Input
                           type="email"
                           value={editValue}
                           onChange={(e) => setEditValue(e.target.value)}
                           onBlur={async () => {
                             if (editValue.trim()) {
                               await updateUserDetails(u.id, u.name, editValue);
                               setEditingUserId(null);
                               setEditingField(null);
                               setEditValue("");
                             }
                           }}
                           onKeyPress={(e) => {
                             if (e.key === 'Enter' && editValue.trim()) {
                               updateUserDetails(u.id, u.name, editValue).then(() => {
                                 setEditingUserId(null);
                                 setEditingField(null);
                                 setEditValue("");
                               });
                             }
                           }}
                           autoFocus
                           className="w-full"
                         />
                       ) : (
                         <>
                           <span className="text-gray-600">{u.email}</span>
                           {!isEditingEmail && (
                             <button
                               onClick={() => {
                                 setEditingUserId(u.id);
                                 setEditingField('email');
                                 setEditValue(u.email);
                               }}
                               className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] ml-2"
                             >
                               Editar
                             </button>
                           )}
                         </>
                       )}
                     </td>
                     
                     <td className="p-4">
                       <span
                         className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                           u.subscription_status === "active"
                             ? "bg-green-100 text-green-700"
                             : u.subscription_status === "trial"
                             ? "bg-yellow-100 text-yellow-700"
                             : "bg-red-100 text-red-700"
                         }`}
                       >
                         {u.subscription_status === "active" && <CheckCircle className="w-3 h-3" />}
                         {u.subscription_status === "trial" && <Clock className="w-3 h-3" />}
                         {u.subscription_status === "expired" && <Ban className="w-3 h-3" />}
                         {u.subscription_status}
                       </span>
                     </td>
                     
                     <td className="p-4">
                       <button
                         onClick={() => toggleAdminRole(u.id, u.role)}
                         className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                           u.role === "admin"
                             ? "bg-purple-100 text-purple-700"
                             : "bg-gray-100 text-gray-600"
                       }`}
                       >
                         {u.role}
                       </button>
                     </td>
                     
                     <td className="p-4 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                     <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(u)}
                            title="Editar usuário"
                          >
                            <Pencil className="w-4 h-4 text-[var(--theme-primary)]" />
                          </Button>
                          {/* Controle de Acesso Gratuito/Trial */}
                          {u.subscription_status !== "trial" && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => updateUserStatus(u.id, "trial")}
                             title="Conceder Acesso Gratuito (Trial)"
                           >
                             <Clock className="w-4 h-4 text-yellow-600" />
                           </Button>
                         )}
                         {u.subscription_status !== "active" && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => updateUserStatus(u.id, "active")}
                             title="Ativar Assinatura Paga"
                           >
                             <CheckCircle className="w-4 h-4 text-[var(--theme-secondary)]" />
                           </Button>
                         )}
                         {u.subscription_status !== "expired" && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => updateUserStatus(u.id, "expired")}
                             title="Expirar Acesso"
                           >
                             <Ban className="w-4 h-4 text-red-500" />
                           </Button>
                         )}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => deleteUser(u.id)}
                           title="Excluir usuário"
                         >
                           <Trash2 className="w-4 h-4 text-red-500" />
                         </Button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={closeEditModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Editar Usuário</h3>
              <button onClick={closeEditModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  >
                    <option value="user">Usuário Comum</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.subscription_status}
                    onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Ativo</option>
                    <option value="canceled">Cancelado</option>
                    <option value="expired">Expirado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trial até</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    value={editForm.trial_ends_at}
                    onChange={(e) => setEditForm({ ...editForm, trial_ends_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura até</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    value={editForm.subscription_ends_at}
                    onChange={(e) => setEditForm({ ...editForm, subscription_ends_at: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
              <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
              <Button onClick={saveEditModal} disabled={editModalSaving}>
                {editModalSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
