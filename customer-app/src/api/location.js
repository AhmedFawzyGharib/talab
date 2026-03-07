import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_API_KEY';

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (res.data.results.length > 0) {
      return res.data.results[0].formatted_address;
    }

    return 'عنوان غير معروف';
  } catch (error) {
    return 'خطأ في تحديد العنوان';
  }
};