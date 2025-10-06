export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  try {
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateTime;
  }
};

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Currency formatting for Indian Rupees
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  
  // Convert USD to INR (approximate rate: 1 USD = 83 INR)
  const inrAmount = typeof amount === 'string' ? parseFloat(amount) * 83 : amount * 83;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(inrAmount);
};

// For displaying just the amount with ₹ symbol
export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  
  // Convert USD to INR
  const inrAmount = typeof amount === 'string' ? parseFloat(amount) * 83 : amount * 83;
  
  return `₹${Math.round(inrAmount).toLocaleString('en-IN')}`;
};

export const generateSeatLayout = (rows = 10, seatsPerRow = 16) => {
  const layout = [];
  
  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
    const seats = [];
    
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seats.push({
        id: `${rowLetter}${seat}`,
        row: rowLetter,
        number: seat,
        status: Math.random() > 0.7 ? 'booked' : 'available', // 30% chance of being booked
        price: row < 3 ? 250 : row < 7 ? 350 : 450, // Premium pricing in INR
      });
    }
    
    layout.push({
      row: rowLetter,
      seats,
    });
  }
  
  return layout;
};

export const calculateTotalPrice = (selectedSeats) => {
  return selectedSeats.reduce((total, seat) => total + seat.price, 0);
};

export const formatSeatNumbers = (seats) => {
  return seats.map(seat => seat.id).join(', ');
};