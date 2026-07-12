export type PasswordCategory =
  | "wifi"
  | "credit-card"
  | "site-app"
  | "document"
  | "bank-account"
  | "email"
  | "server-ssh"
  | "other"

export interface PasswordEntry {
  id: string
  user_id: string
  category: PasswordCategory
  title: string
  fields: Record<string, string>
  notes?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  name?: string
  subscription_status: "trial" | "active" | "canceled" | "expired"
  trial_ends_at?: string
  subscription_ends_at?: string
  role: "user" | "admin"
  created_at: string
}

export interface CategoryConfig {
  key: PasswordCategory
  label: string
  icon: string
  fields: { name: string; label: string; type: "text" | "password" | "number" | "date" | "textarea" }[]
}

export const PASSWORD_CATEGORIES: CategoryConfig[] = [
  {
    key: "wifi",
    label: "Wi-Fi",
    icon: "wifi",
    fields: [
      { name: "ssid", label: "SSID (Nome da Rede)", type: "text" },
      { name: "password", label: "Senha", type: "password" },
      { name: "security", label: "Tipo de Segurança", type: "text" },
    ],
  },
  {
    key: "credit-card",
    label: "Cartão de Crédito",
    icon: "credit-card",
    fields: [
      { name: "card_name", label: "Nome no Cartão", type: "text" },
      { name: "card_number", label: "Número", type: "text" },
      { name: "expiry", label: "Validade", type: "date" },
      { name: "cvv", label: "CVV", type: "password" },
      { name: "bank", label: "Banco", type: "text" },
      { name: "flag", label: "Bandeira", type: "text" },
    ],
  },
  {
    key: "site-app",
    label: "Sites/Apps",
    icon: "globe",
    fields: [
      { name: "url", label: "URL", type: "text" },
      { name: "username", label: "Usuário", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "password", label: "Senha", type: "password" },
    ],
  },
  {
    key: "document",
    label: "Documentos",
    icon: "file-text",
    fields: [
      { name: "type", label: "Tipo (RG, CPF, CNH)", type: "text" },
      { name: "number", label: "Número", type: "text" },
      { name: "cpf", label: "CPF", type: "text" },
      { name: "birth_date", label: "Data de Nascimento", type: "date" },
      { name: "issuer", label: "Órgão Emissor", type: "text" },
      { name: "expiry", label: "Data de Validade", type: "date" },
      { name: "issue_date", label: "Data de Emissão", type: "date" },
      { name: "reg_number", label: "Número do Registro (CNH)", type: "text" },
      { name: "first_license", label: "Data 1ª Habilitação (CNH)", type: "date" },
      { name: "categories", label: "Categorias (CNH)", type: "text" },
      { name: "observations", label: "Observações", type: "textarea" },
    ],
  },
  {
    key: "bank-account",
    label: "Conta Bancária",
    icon: "building",
    fields: [
      { name: "bank", label: "Banco", type: "text" },
      { name: "agency", label: "Agência", type: "text" },
      { name: "account", label: "Conta", type: "text" },
      { name: "pix", label: "Chave PIX", type: "text" },
      { name: "password", label: "Senha", type: "password" },
    ],
  },
  {
    key: "email",
    label: "E-mail",
    icon: "mail",
    fields: [
      { name: "email", label: "E-mail", type: "text" },
      { name: "password", label: "Senha", type: "password" },
      { name: "provider", label: "Provedor", type: "text" },
    ],
  },
  {
    key: "server-ssh",
    label: "Servidor/SSH",
    icon: "server",
    fields: [
      { name: "host", label: "Host/IP", type: "text" },
      { name: "port", label: "Porta", type: "text" },
      { name: "username", label: "Usuário", type: "text" },
      { name: "password", label: "Senha", type: "password" },
      { name: "key", label: "Chave SSH", type: "textarea" },
    ],
  },
  {
    key: "other",
    label: "Outros",
    icon: "key",
    fields: [
      { name: "value", label: "Valor", type: "text" },
      { name: "password", label: "Senha", type: "password" },
    ],
  },
]
