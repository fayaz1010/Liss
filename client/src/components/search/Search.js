import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  Popper,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  ListAlt as ListIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { searchAll, clearSearch } from '../../store/slices/searchSlice';

const Search = () => {
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.search);

  const handleSearch = debounce((searchQuery) => {
    if (searchQuery.trim()) {
      dispatch(searchAll(searchQuery));
    } else {
      dispatch(clearSearch());
    }
  }, 300);

  useEffect(() => {
    handleSearch(query);
    return () => handleSearch.cancel();
  }, [query]);

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearch());
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const handleResultClick = (type, id) => {
    setAnchorEl(null);
    switch (type) {
      case 'group':
        navigate(`/groups/${id}`);
        break;
      case 'list':
        navigate(`/lists/${id}`);
        break;
      case 'user':
        navigate(`/profile/${id}`);
        break;
      default:
        break;
    }
  };

  const open = Boolean(anchorEl);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          placeholder="Search groups, lists, tasks..."
          value={query}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  query && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon />
                    </IconButton>
                  )
                )}
              </InputAdornment>
            ),
          }}
        />

        <Popper
          open={open && (query.trim().length > 0)}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={3} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                {/* Groups */}
                {results.groups.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100' }}>
                      Groups
                    </Typography>
                    <List dense>
                      {results.groups.map((group) => (
                        <ListItem
                          key={group._id}
                          button
                          onClick={() => handleResultClick('group', group._id)}
                        >
                          <ListItemIcon>
                            <GroupIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={group.name}
                            secondary={`${group.members.length} members`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider />
                  </>
                )}

                {/* Lists */}
                {results.lists.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100' }}>
                      Lists
                    </Typography>
                    <List dense>
                      {results.lists.map((list) => (
                        <ListItem
                          key={list._id}
                          button
                          onClick={() => handleResultClick('list', list._id)}
                        >
                          <ListItemIcon>
                            <ListIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={list.title}
                            secondary={list.type}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider />
                  </>
                )}

                {/* List Items */}
                {results.items.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100' }}>
                      Tasks
                    </Typography>
                    <List dense>
                      {results.items.map((item) => (
                        <ListItem
                          key={item._id}
                          button
                          onClick={() => handleResultClick('list', item.listId)}
                        >
                          <ListItemIcon>
                            <TaskIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={`In: ${item.listTitle}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider />
                  </>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100' }}>
                      Users
                    </Typography>
                    <List dense>
                      {results.users.map((user) => (
                        <ListItem
                          key={user._id}
                          button
                          onClick={() => handleResultClick('user', user._id)}
                        >
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={user.username}
                            secondary={user.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* No Results */}
                {query.trim() && !loading && 
                  Object.values(results).every(arr => arr.length === 0) && (
                  <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                    No results found
                  </Typography>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default Search;
