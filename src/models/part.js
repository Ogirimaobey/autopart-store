/**
 * AutoPart Pro - Part Model
 * Designed for granular car component tracking
 */

const part = {
  id: null,               // Unique ID from the database
  partName: '',           // e.g., "M10 Engine Bolt" or "Oil Filter"
  oemNumber: '',          // Manufacturer part number for exact matching
  category: '',           // e.g., "Engine", "Suspension", "Electrical"
  subCategory: '',        // e.g., "Fasteners", "Sensors"
  price: 0,               // Sale price in Naira
  stockQuantity: 0,       // Number of small units available
  condition: 'new',       // 'new', 'tokunbo' (used), 'refurbished'
  brand: '',              // e.g., "Toyota Genuine", "Bosch", "Denso"
  
  // Array of vehicles this part fits
  // Example: [{ make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2018 }]
  compatibleVehicles: [], 
  
  description: '',        // Details about the part
  images: [],             // Array of URLs for high-quality photos
  sellerId: null,         // Link to the Igbo trader's account
  createdAt: null         // Timestamp for when the part was listed
};

export default part;