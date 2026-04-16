// API Configuration
// ВАЖНО: Используйте IP адрес вашего компьютера, а не localhost!
// Узнать IP: ipconfig (Windows) или ifconfig (Mac/Linux)
export const API_URL = 'http://172.20.10.2:3000/api';
export const BASE_URL = 'http://172.20.10.2:3000';

// Helper function to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

// Helper function to get auth headers
export const getAuthHeaders = async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// API methods
export const api = {
  // Auth
  register: async (email, password, name) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Listings
  getListings: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/listings?${params}`);
    return response.json();
  },

  getListing: async (id) => {
    const response = await fetch(`${API_URL}/listings/${id}`);
    return response.json();
  },

  createListing: async (data) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/listings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Favorites
  getFavorites: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/favorites`, { headers });
    return response.json();
  },

  addFavorite: async (listingId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/favorites/${listingId}`, {
      method: 'POST',
      headers,
    });
    return response.json();
  },

  removeFavorite: async (listingId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/favorites/${listingId}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Categories & Regions
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    return response.json();
  },

  getRegions: async () => {
    const response = await fetch(`${API_URL}/regions`);
    return response.json();
  },

  // Profile
  getProfile: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/profile`, { headers });
    return response.json();
  },

  getSellerProfile: async (sellerId) => {
    const response = await fetch(`${API_URL}/users/${sellerId}/profile`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getSellerListings: async (sellerId) => {
    const response = await fetch(`${API_URL}/users/${sellerId}/listings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getUserListings: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/profile/listings`, { headers });
    return response.json();
  },

  // File Upload
  uploadPhoto: async (photoUri) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('token');
    
    const formData = new FormData();
    const filename = photoUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
      uri: photoUri,
      name: filename,
      type: type,
    });

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки фото');
    }

    return response.json();
  },

  uploadPhotos: async (photoUris) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('token');
    
    const formData = new FormData();
    
    photoUris.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photos', {
        uri: uri,
        name: filename,
        type: type,
      });
    });

    const response = await fetch(`${API_URL}/upload-multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки фото');
    }

    return response.json();
  },

  // Profile Update
  updateProfile: async (profileData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка обновления профиля');
    }
    
    return response.json();
  },

  // Listing Update & Delete
  updateListing: async (listingId, listingData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/listings/${listingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(listingData),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка обновления объявления');
    }
    
    return response.json();
  },

  deleteListing: async (listingId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/listings/${listingId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Ошибка удаления объявления');
    }
    
    return response.json();
  },

  // Reviews & Ratings
  getUserReviews: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/reviews`);
    return response.json();
  },

  addReview: async (reviewData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления отзыва');
    }
    
    return response.json();
  },

  // Push Notifications
  sendPushToken: async (expoPushToken) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/notifications/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ expoPushToken }),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка отправки push токена');
    }
    
    return response.json();
  },

  // Chat
  createChat: async (chatData) => {
    try {
      const headers = await getAuthHeaders();
      console.log('Creating chat with data:', chatData);
      console.log('Headers:', headers);
      
      const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify(chatData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания чата');
      }
      
      return data;
    } catch (error) {
      console.error('createChat error:', error);
      throw error;
    }
  },

  getMessages: async (chatId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки сообщений');
    }
    
    return response.json();
  },

  sendMessage: async (chatId, content) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отправки сообщения');
      }
      
      return response.json();
    } catch (error) {
      console.error('sendMessage error:', error);
      throw error;
    }
  },

  getChats: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/chats`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки чатов');
      }
      
      return response.json();
    } catch (error) {
      console.error('getChats error:', error);
      throw error;
    }
  },
};
