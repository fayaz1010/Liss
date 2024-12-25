import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav'];
const PDF_TYPES = ['application/pdf'];

const getFileIcon = (mimetype) => {
  if (IMAGE_TYPES.includes(mimetype)) return <ImageIcon />;
  if (VIDEO_TYPES.includes(mimetype)) return <VideoIcon />;
  if (AUDIO_TYPES.includes(mimetype)) return <AudioIcon />;
  if (PDF_TYPES.includes(mimetype)) return <PdfIcon />;
  return <DocumentIcon />;
};

const ImagePreview = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleZoomIn = () => setZoom(prev => prev + 0.2);
  const handleZoomOut = () => setZoom(prev => Math.max(0.2, prev - 0.2));

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      <img
        src={file.url}
        alt={file.originalname}
        style={{
          maxWidth: '100%',
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s',
        }}
        onLoad={() => setLoading(false)}
      />
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 1,
        p: 1,
      }}>
        <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'white' }}>
          <ZoomOutIcon />
        </IconButton>
        <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'white' }}>
          <ZoomInIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const VideoPreview = ({ file }) => (
  <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
    <video
      controls
      style={{ width: '100%', maxHeight: '70vh' }}
    >
      <source src={file.url} type={file.mimetype} />
      Your browser does not support the video tag.
    </video>
  </Box>
);

const AudioPreview = ({ file }) => (
  <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
    <audio
      controls
      style={{ width: '100%' }}
    >
      <source src={file.url} type={file.mimetype} />
      Your browser does not support the audio tag.
    </audio>
  </Box>
);

const PDFPreview = ({ file }) => (
  <Box sx={{ width: '100%', height: '70vh' }}>
    <iframe
      src={`${file.url}#view=FitH`}
      title={file.originalname}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
    />
  </Box>
);

const FilePreview = ({ files, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentFile = files[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentFile.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.originalname;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const renderPreview = () => {
    if (IMAGE_TYPES.includes(currentFile.mimetype)) {
      return <ImagePreview file={currentFile} onClose={onClose} />;
    }
    if (VIDEO_TYPES.includes(currentFile.mimetype)) {
      return <VideoPreview file={currentFile} />;
    }
    if (AUDIO_TYPES.includes(currentFile.mimetype)) {
      return <AudioPreview file={currentFile} />;
    }
    if (PDF_TYPES.includes(currentFile.mimetype)) {
      return <PDFPreview file={currentFile} />;
    }
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography>
          Preview not available for this file type.
          Please download to view.
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {currentFile.originalname}
          </Typography>
          <Box>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative' }}>
          {files.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <PrevIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <NextIcon />
              </IconButton>
            </>
          )}
          {renderPreview()}
        </Box>
        {files.length > 1 && (
          <List
            sx={{
              display: 'flex',
              overflowX: 'auto',
              mt: 2,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'action.hover',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'primary.main',
                borderRadius: 1,
              },
            }}
          >
            {files.map((file, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{ width: 'auto' }}
              >
                <ListItemButton
                  selected={index === currentIndex}
                  onClick={() => setCurrentIndex(index)}
                  sx={{
                    px: 2,
                    minWidth: 200,
                    borderBottom: index === currentIndex ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(file.mimetype)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.originalname}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    primaryTypographyProps={{
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
