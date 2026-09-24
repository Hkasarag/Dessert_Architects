import { orderStatusData } from './types'
import { searchFuzzy } from './menuDataset'

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

  // If user asks for recommendations or similar items, delegate to dataset search
  const similarMatch = lower.match(/similar to ([a-z0-9\s\-\'\,]+)/i)
  if (similarMatch) {
    const query = similarMatch[1]
    const results = searchFuzzy(query, 5)
    if (results.length) {
      return {
        issueType: 'similar_items',
        response: `Here are items similar to "${query.trim()}": ${results.map(r => r.name).join(', ')}.`,
        suggestions: results.map(r => ({ name: r.name, price: `$${r.price.toFixed(2)}`, description: r.description })),
        escalationNeeded: false,
      }
    }
  }

  if (/subscription|subscribe|plan/.test(lower)) {
    return {
      issueType: 'subscription',
      response: 'Our subscription plans include monthly dessert boxes and family plans. I can summarize options or help sign you up.',
      escalationNeeded: false,
    }
  }

  return {
    issueType: 'unsupported',
    response: 'I can help with order status, shipping, returns, refunds, store information, or find similar desserts. Please provide more details about your request.',
    escalationNeeded: true,
  }
}
