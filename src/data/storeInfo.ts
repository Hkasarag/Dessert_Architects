// Franchise store details, shared by the admin profile and the customer service agent.
export const storeInfo = {
  brand: 'Frosted Corner',
  locationName: 'Downtown Atlanta',
  storeId: 'ATL-DT-001',
  /** Location code used on ingredient purchase orders sent to HQ. */
  inventoryLocationId: 'ATL001',
  city: 'Atlanta',
  state: 'Georgia',
  hours: [
    { days: 'Monday – Saturday', time: '8:00 AM – 6:00 PM' },
    { days: 'Sunday', time: '9:00 AM – 2:00 PM' },
  ],
}

export const storeHoursText = storeInfo.hours.map(h => `${h.days} ${h.time}`).join(', ')
