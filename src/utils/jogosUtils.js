
const deParaPos = {
    go: 'Goleiro',
    le: 'Lateral Esquerdo',
    ld: 'Lateral Direito',
    za1: 'Zagueiro',
    za2: 'Zagueiro',
    za3: 'Zagueiro',
    za4: 'Zagueiro',
    md1: 'Meio Defensivo',
    md2: 'Meio Defensivo',
    md3: 'Meio Defensivo',
    md4: 'Meio Defensivo',
    mo1: 'Meio Ofensivo',
    mo2: 'Meio Ofensivo',
    mo3: 'Meio Ofensivo',
    mo4: 'Meio Ofensivo',
    ale: 'Ala Esquerdo', 
    ald: 'Ala Direito',
    at1: 'Atacante', 
    at2: 'Atacante', 
    at3: 'Atacante', 
    at4: 'Atacante' 
};

export const getPosName = (posvalue) => deParaPos[posvalue];

