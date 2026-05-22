const WEB3FORMS_ACCESS_KEY = 'cb4f54e1-5f12-4ddf-a5e6-d2adb94eb0a3'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export type ContactRequest = {
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  subject: string
}

export type ContactSubmitResult = {
  success?: boolean
  message?: string
}

type Web3FormsResult = {
  success?: boolean
  message?: string
}

function createPayload(data: ContactRequest) {
  const payload = new FormData()
  payload.append('access_key', WEB3FORMS_ACCESS_KEY)
  payload.append('subject', data.subject)
  payload.append('from_name', 'The Sticker Smith Website')
  payload.append('name', data.name)
  payload.append('email', data.email)
  if (data.phone) payload.append('phone', data.phone)
  if (data.service) payload.append('service', data.service)
  payload.append('message', data.message)

  return payload
}

async function sendToWeb3Forms(payload: FormData) {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    body: payload,
  })
  const text = await response.text()
  let result: Web3FormsResult = {}
  try {
    result = text ? JSON.parse(text) : {}
  } catch {
    result = { message: text }
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Web3Forms returned ${response.status}`)
  }

  return result
}

export async function submitContactRequest(data: ContactRequest): Promise<ContactSubmitResult> {
  return sendToWeb3Forms(createPayload(data))
}
