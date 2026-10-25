import { Router } from 'express';
import signIn from './signIn.ts';
import signUp from './signUp.ts';

const routersEntry = Router();

routersEntry.use('/auth', signIn);
routersEntry.use('/auth', signUp);

export default routersEntry;
