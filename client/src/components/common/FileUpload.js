import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { uploadFile, deleteFile } from '../../services/fileUpload';

const FileUpload = ({ onUpload, onDelete, maxFiles = 5, acceptedTypes = '*', existingFiles = [] }) => {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const uploadedFile = await uploadFile(file);
        setFiles(prev => [...prev, uploadedFile]);
        onUpload && onUpload(uploadedFile);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(error.message);
      }
    }

    setUploading(false);
    event.target.value = null;
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      setFiles(files.filter(f => f._id !== fileId));
      onDelete && onDelete(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(error.message);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    return <DocIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <input
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current.click()}
          disabled={uploading || files.length >= maxFiles}
        >
          Upload Files
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {`${files.length}/${maxFiles} files uploaded`}
        </Typography>
      </Box>

      {uploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {files.length > 0 && (
        <Paper variant="outlined">
          <List>
            {files.map((file) => (
              <ListItem key={file._id}>
                <ListItemIcon>
                  {getFileIcon(file.mimetype)}
                </ListItemIcon>
                <ListItemText
                  primary={file.originalname}
                  secondary={formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(file._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;
