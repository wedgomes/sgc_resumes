import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Importa Link do react-router-dom e renomeia

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Currículos
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Listar Currículos
          </Button>
          <Button color="inherit" component={RouterLink} to="/add">
            Adicionar Currículo
          </Button>
          {/* Adicione mais links de navegação aqui se necessário */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;