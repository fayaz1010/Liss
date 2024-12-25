import axios from 'axios';

const uploadFile = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error uploading file');
  }
};

const deleteFile = async (fileId) => {
  try {
    await axios.delete(`/api/upload/${fileId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting file');
  }
};

export { uploadFile, deleteFile };
