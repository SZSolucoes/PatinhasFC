
export const checkPerfil = (perfil) => {
    switch (perfil) {
        case 'socio':
            return 'Sócio';
        case 'sociopatrim':
            return 'Sócio Patrimonial';
        case 'sociocontrib':
            return 'Sócio Contribuinte';
        case 'admin':
            return 'Administrador';
        default:
            return perfil;
    }
};

