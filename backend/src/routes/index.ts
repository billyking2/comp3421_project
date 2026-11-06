import { Router } from 'express';
import signIn from './signIn.ts';
import signUp from './signUp.ts';
import signOut from './signOut.ts';
import getToday from './getToday.ts';
import getBook from './getBook.ts';
import changeBook from './changeBook.ts';
import getUsers from './getUsers.ts';
import getOrders from './getOrders.ts';

const routersEntry = Router();

routersEntry.use('/auth', signIn);
routersEntry.use('/auth', signUp);
routersEntry.use('/auth', signOut);

routersEntry.use('/get', getToday);
routersEntry.use('/get', getBook);
routersEntry.use('/get', getUsers);
routersEntry.use('/get', getOrders);
routersEntry.use('/post', changeBook);

export default routersEntry;