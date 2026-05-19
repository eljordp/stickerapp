import { normalizeAttachment } from './validation'

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
  attachmentStatus: 'none' | 'sent' | 'fallback'
}

type Web3FormsResult = {
  success?: boolean
  message?: string
}

function createPayload(data: ContactRequest, attachment?: File | null) {
  const payload = new FormData()
  payload.append('access_key', WEB3FORMS_ACCESS_KEY)
  payload.append('subject', data.subject)
  payload.append('from_name', 'The Sticker Smith Website')
  payload.append('name', data.name)
  payload.append('email', data.email)
  if (data.phone) payload.append('phone', data.phone)
  if (data.service) payload.append('service', data.service)
  payload.append('message', data.message)

  if (attachment) {
    const uploadFile = normalizeAttachment(attachment)
    payload.append('attachment', uploadFile, uploadFile.name)
  }

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

const isFileUploadPlanError = (error: unknown) =>
  error instanceof Error &&
  /pro feature|file uploads?|upgrade/i.test(error.message)

const attachmentFallbackMessage = (message: string, attachment: File) => {
  const sizeMb = (attachment.size / 1024 / 1024).toFixed(2)
  return [
    message,
    '',
    `Attachment selected: ${attachment.name} (${sizeMb} MB).`,
    'Web3Forms file uploads are not active on this form yet; reply to the customer to request the file.',
  ].join('\n')
}

export async function submitContactRequest(data: ContactRequest, attachment?: File | null): Promise<ContactSubmitResult> {
  try {
    const result = await sendToWeb3Forms(createPayload(data, attachment))
    return {
      ...result,
      attachmentStatus: attachment ? 'sent' : 'none',
    }
  } catch (error) {
    if (!attachment || !isFileUploadPlanError(error)) throw error

    const fallbackResult = await sendToWeb3Forms(createPayload({
      ...data,
      message: attachmentFallbackMessage(data.message, attachment),
    }))

    return {
      ...fallbackResult,
      attachmentStatus: 'fallback',
    }
  }
}
