import { orderStatusData } from './types'

export function customerServiceAgent(message: string) {
  const lower = message.toLowerCase()

  if (/where is my order|track my order|order status/.test(lower)) {
    const orderId = orderStatusData[0].orderId
    return {
      issueType: 'order_status',
      response: `Your order ${orderId} is currently in transit and was last updated on ${orderStatusData[0].updatedAt}.`,
      orderData: orderStatusData[0],
      escalationNeeded: false,
    }
  }

  if (/cancel/.test(lower)) {
    return {
      issueType: 'cancellation',
      response: 'I can help review the cancellation policy, but I cannot process a cancellation directly. Please contact support with your order number.',
      escalationNeeded: true,
    }
  }

  if (/refund|return/.test(lower)) {
    return {
      issueType: 'refund',
      response: 'Refund eligibility depends on the order status and item condition. I can provide policy guidance, but the final decision requires support review.',
      escalationNeeded: true,
    }
  }

  if (/shipping|delivery/.test(lower)) {
    return {
      issueType: 'shipping',
      response: 'Standard delivery is 2-5 business days. Expedited shipping may be available depending on location and order timing.',
      escalationNeeded: false,
    }
  }

  if (/store hours/.test(lower)) {
    return {
      issueType: 'store_info',
      response: 'Our bakery is open Monday to Saturday, 8:00 AM to 6:00 PM, and Sunday, 9:00 AM to 2:00 PM.',
      escalationNeeded: false,
    }
  }

  return {
    issueType: 'unsupported',
    response: 'I can help with order status, shipping, returns, refunds, or store information. Please provide more details about your request.',
    escalationNeeded: true,
  }
}
