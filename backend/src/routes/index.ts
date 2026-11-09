import { Router } from 'express';
import signIn from './signIn.ts';
import signUp from './signUp.ts';
import signOut from './signOut.ts';
import getToday from './getToday.ts';
import getBook from './getBook.ts';
import getCategories from './getCategories.ts';
import changeBook from './changeBook.ts';
import getUsers from './getUsers.ts';
import getOrders from './getOrders.ts';
import getMyOrders from './getMyOrders.ts';
import getSales from './getSales.ts';
import contactMessages from './contactMessages.ts';
import profile from './profile.ts';
import changeMyOrders from './changeMyOrders.ts';

const routersEntry = Router();

routersEntry.use('/', contactMessages);
routersEntry.use('/auth', signIn);
routersEntry.use('/auth', signUp);
routersEntry.use('/auth', signOut);
routersEntry.use('/auth', profile);

routersEntry.use('/get', getToday);
routersEntry.use('/get', getBook);
routersEntry.use('/get', getCategories);
routersEntry.use('/get', getUsers);
routersEntry.use('/get', getOrders);
routersEntry.use('/get', getMyOrders);
routersEntry.use('/get', getSales);
routersEntry.use('/post', changeBook);
routersEntry.use('/post', changeMyOrders);

export default routersEntry;