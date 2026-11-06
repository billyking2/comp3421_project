import { Router } from 'express';
import signIn from './signIn.ts';
import signUp from './signUp.ts';
import signOut from './signOut.ts';
import getToday from './getToday.ts';
import getBook from './getBook.ts';
import changeBook from './changeBook.ts';

const routersEntry = Router();

routersEntry.use('/auth', signIn);
routersEntry.use('/auth', signUp);
routersEntry.use('/auth', signOut);

routersEntry.use('/get', getToday);
routersEntry.use('/get', getBook);

routersEntry.use('/post', changeBook);

export default routersEntry;