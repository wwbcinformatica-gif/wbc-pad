const PBKDF2_ITERATIONS = 600000
const KEY_LENGTH = 256
const SALT_SIZE = 32
const IV_SIZE = 12

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE))
  return bufferToBase64(salt)
}

export async function deriveKey(masterPassword: string, saltBase64: string): Promise<CryptoKey> {
  const salt = base64ToBuffer(saltBase64)
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function createVerificationHash(masterPassword: string, saltBase64: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const salt = new Uint8Array(base64ToBuffer(saltBase64))
  const hashSalt = new Uint8Array([...salt, ...encoder.encode("verify")])
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hashSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  )
  return bufferToBase64(bits)
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE))
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  )
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return bufferToBase64(combined)
}

export async function decrypt(ciphertextBase64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToBuffer(ciphertextBase64)
  const iv = combined.slice(0, IV_SIZE)
  const encrypted = combined.slice(IV_SIZE)
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  )
  return new TextDecoder().decode(decrypted)
}
